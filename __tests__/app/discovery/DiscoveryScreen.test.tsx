import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import DiscoveryScreen from '@/app/discovery';
import { makeDiscoverySummary } from '@/testing/fixtures';
import type { DiscoverySummary, FriendSuggestion, PlayerSearchResult } from '@/types/api';

const mockReplace = jest.fn();
let mockParams: Record<string, string> = { target: 'assessment' };
jest.mock('expo-router', () =>
  require('@/testing/expoRouterMock').createExpoRouterMock({
    useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
    useLocalSearchParams: () => mockParams,
  })
);

let mockSummary: DiscoverySummary = makeDiscoverySummary();
let mockSuggestions: FriendSuggestion[] = [];
let mockSearchResults: PlayerSearchResult[] = [];
const mockSearchCalls: Array<{ q: string; enabled?: boolean }> = [];
const mockSave = jest.fn(async (_vars: unknown) => undefined);
jest.mock('@/services/hooks/useDiscovery', () => ({
  useMediaSources: () => ({ data: require('@/testing/fixtures').MEDIA_SOURCES, loading: false, error: null, refetch: jest.fn() }),
  useDiscoverySummary: () => ({ data: mockSummary, loading: false, error: null, refetch: jest.fn() }),
  useSuggestedFriends: () => ({ data: mockSuggestions, loading: false, error: null, refetch: jest.fn() }),
  usePlayerSearch: (q: string, enabled?: boolean) => {
    mockSearchCalls.push({ q, enabled });
    return { data: q.trim().length >= 2 ? mockSearchResults : null, loading: false, error: null, refetch: jest.fn() };
  },
  useSaveDiscoveryMutation: () => ({ mutateAsync: mockSave, isPending: false }),
}));

function renderScreen() {
  return (() => { const r = renderWithQueryClient(<DiscoveryScreen />); testClient = r.client; return r; })();
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = { target: 'assessment' };
  mockSummary = makeDiscoverySummary();
  mockSuggestions = [];
  mockSearchResults = [];
  mockSearchCalls.length = 0;
});
let testClient: ReturnType<typeof renderWithQueryClient>['client'] | null = null;
afterEach(async () => {
  if (testClient) await disposeTestQueryClient(testClient);
  testClient = null;
});

describe('Discovery intercept screen', () => {
  it('requires at least one media source', async () => {
    renderScreen();
    fireEvent.press(screen.getByTestId('discovery-submit'));
    await waitFor(() => expect(screen.getByText(/pick at least one/i)).toBeTruthy());
    expect(mockSave).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('saves media only and continues to the assessment target', async () => {
    renderScreen();
    fireEvent.press(screen.getByText('Instagram'));
    fireEvent.press(screen.getByTestId('discovery-submit'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith({ pathname: '/level-assessment', params: {} }));
    expect(mockSave).toHaveBeenCalledWith({ mediaSourceIds: [1], friends: null });
    expect(screen.queryByTestId('discovery-friends')).toBeNull();
  });

  it('continues to the stored registration target for the event', async () => {
    mockParams = { target: 'registration', eventId: '12' };
    renderScreen();
    fireEvent.press(screen.getByText('TikTok'));
    fireEvent.press(screen.getByTestId('discovery-submit'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
    expect(mockReplace.mock.calls[0][0]).toEqual({
      pathname: '/event/registration',
      params: { eventId: '12' },
    });
  });

  it('shows friends inputs when Friends is selected and requires a friend', async () => {
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));
    expect(screen.getByTestId('discovery-friends')).toBeTruthy();

    fireEvent.press(screen.getByTestId('discovery-submit'));
    await waitFor(() => expect(mockSave).not.toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('caps friends at 3', () => {
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));

    fireEvent.changeText(screen.getByTestId('friend-name-0'), 'One');
    fireEvent.press(screen.getByTestId('add-friend'));
    fireEvent.changeText(screen.getByTestId('friend-name-1'), 'Two');
    fireEvent.press(screen.getByTestId('add-friend'));
    fireEvent.changeText(screen.getByTestId('friend-name-2'), 'Three');

    expect(screen.queryByTestId('friend-name-3')).toBeNull();
    expect(screen.queryByTestId('add-friend')).toBeNull();
    expect(screen.getByTestId('friends-max')).toBeTruthy();
  });

  it('saves friends with media and navigates to the target', async () => {
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));
    fireEvent.changeText(screen.getByTestId('friend-name-0'), 'Ana Pop');
    fireEvent.changeText(screen.getByTestId('friend-email-0'), 'ana@example.com');
    fireEvent.press(screen.getByTestId('discovery-submit'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith({ pathname: '/level-assessment', params: {} }));
    const vars = mockSave.mock.calls[0][0] as { mediaSourceIds: number[]; friends: unknown[] };
    expect(vars.mediaSourceIds).toEqual([4]);
    expect(vars.friends).toHaveLength(1);
    expect(vars.friends[0]).toMatchObject({ full_name: 'Ana Pop', email: 'ana@example.com' });
  });

  it('sends the typed search text to the search hook and lists masked results', () => {
    mockSearchResults = [
      { id_player: 31, name: 'Ioana Vasilescu', email_masked: 'i***@example.com', phone_masked: '+*********009', avatar_url: null },
    ];
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));

    fireEvent.changeText(screen.getByTestId('friend-search'), 'ioana');
    expect(mockSearchCalls.some((c) => c.q === 'ioana' && c.enabled === true)).toBe(true);
    expect(screen.getByTestId('search-result-31')).toBeTruthy();
    expect(screen.getByText('i***@example.com · +*********009')).toBeTruthy();
  });

  it('does not list results for a too-short query', () => {
    mockSearchResults = [
      { id_player: 31, name: 'Ioana Vasilescu', email_masked: null, phone_masked: null, avatar_url: null },
    ];
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));

    fireEvent.changeText(screen.getByTestId('friend-search'), 'i');
    expect(screen.queryByTestId('search-result-31')).toBeNull();
  });

  it('picking a search result sets friend_player_id and name and is saved', async () => {
    mockSearchResults = [
      { id_player: 31, name: 'Ioana Vasilescu', email_masked: null, phone_masked: null, avatar_url: null },
    ];
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));
    fireEvent.changeText(screen.getByTestId('friend-search'), 'ioana');
    fireEvent.press(screen.getByTestId('search-result-31'));

    expect(screen.getByDisplayValue('Ioana Vasilescu')).toBeTruthy();
    expect(screen.getByTestId('friend-search').props.value).toBe('');
    expect(screen.queryByTestId('friend-name-1')).toBeNull();

    fireEvent.press(screen.getByTestId('discovery-submit'));
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    const vars = mockSave.mock.calls[0][0] as { friends: unknown[] };
    expect(vars.friends).toEqual([
      { friend_player_id: 31, full_name: 'Ioana Vasilescu', email: null, phone: null },
    ]);
  });

  it('editing a picked friend name drops the player link', async () => {
    mockSearchResults = [
      { id_player: 31, name: 'Ioana Vasilescu', email_masked: null, phone_masked: null, avatar_url: null },
    ];
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));
    fireEvent.changeText(screen.getByTestId('friend-search'), 'ioana');
    fireEvent.press(screen.getByTestId('search-result-31'));
    fireEvent.changeText(screen.getByTestId('friend-name-0'), 'Someone Else');
    fireEvent.press(screen.getByTestId('discovery-submit'));

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    const vars = mockSave.mock.calls[0][0] as { friends: Array<{ friend_player_id: number | null }> };
    expect(vars.friends[0].friend_player_id).toBeNull();
  });

  it('includes the phone field in the save payload', async () => {
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));
    fireEvent.changeText(screen.getByTestId('friend-name-0'), 'Ana Pop');
    fireEvent.changeText(screen.getByTestId('friend-phone-0'), '+40712000009');
    fireEvent.press(screen.getByTestId('discovery-submit'));

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    const vars = mockSave.mock.calls[0][0] as { friends: unknown[] };
    expect(vars.friends[0]).toMatchObject({ full_name: 'Ana Pop', phone: '+40712000009' });
  });

  it('accepts a phone-only friend', async () => {
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));
    fireEvent.changeText(screen.getByTestId('friend-phone-0'), '0712000009');
    fireEvent.press(screen.getByTestId('discovery-submit'));

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect((mockSave.mock.calls[0][0] as { friends: unknown[] }).friends).toEqual([
      { friend_player_id: null, full_name: null, email: null, phone: '0712000009' },
    ]);
  });

  it('prefills the saved phone', () => {
    mockSummary = makeDiscoverySummary({
      media_source_ids: [4],
      friends_selected: true,
      friends: [
        {
          friend_player_id: null,
          full_name: 'Saved Friend',
          email: null,
          phone: '+40712000001',
        } as DiscoverySummary['friends'][number],
      ],
    });
    renderScreen();
    expect(screen.getByDisplayValue('+40712000001')).toBeTruthy();
  });

  it('hides search at the 3-friend cap and does not allow picking a 4th', () => {
    mockSearchResults = [
      { id_player: 31, name: 'Ioana Vasilescu', email_masked: null, phone_masked: null, avatar_url: null },
    ];
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));

    fireEvent.changeText(screen.getByTestId('friend-name-0'), 'One');
    fireEvent.press(screen.getByTestId('add-friend'));
    fireEvent.changeText(screen.getByTestId('friend-name-1'), 'Two');
    fireEvent.press(screen.getByTestId('add-friend'));
    fireEvent.changeText(screen.getByTestId('friend-name-2'), 'Three');

    expect(screen.queryByTestId('friend-search')).toBeNull();
    expect(screen.queryByTestId('friend-name-3')).toBeNull();
    expect(screen.getByTestId('friends-max')).toBeTruthy();
  });

  it('picking from search fills the last open slot (max 3)', () => {
    mockSearchResults = [
      { id_player: 31, name: 'Ioana Vasilescu', email_masked: null, phone_masked: null, avatar_url: null },
    ];
    renderScreen();
    fireEvent.press(screen.getByText('Friends'));
    fireEvent.changeText(screen.getByTestId('friend-name-0'), 'One');
    fireEvent.press(screen.getByTestId('add-friend'));
    fireEvent.changeText(screen.getByTestId('friend-name-1'), 'Two');

    fireEvent.changeText(screen.getByTestId('friend-search'), 'ioana');
    fireEvent.press(screen.getByTestId('search-result-31'));

    expect(screen.getByDisplayValue('Ioana Vasilescu')).toBeTruthy();
    expect(screen.queryByTestId('friend-name-3')).toBeNull();
    expect(screen.getByTestId('friends-max')).toBeTruthy();
  });

  it('prefills from an already saved summary', () => {
    mockSummary = makeDiscoverySummary({
      media_source_ids: [4],
      friends_selected: true,
      friends: [
        {
          friend_player_id: null,
          full_name: 'Saved Friend',
          email: 'saved@example.com',
        } as DiscoverySummary['friends'][number],
      ],
    });
    renderScreen();
    expect(screen.getByDisplayValue('Saved Friend')).toBeTruthy();
  });
});
