import React from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import {
  act,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { renderWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import AccountScreen from '@/app/(tabs)/account';
import { confirmAsync } from '@/services/confirm';
import { mapPlayerToUser } from '@/services/authUser';
import { makeGoogleIdentity, makePlayer, makePlayerLevel } from '@/testing/fixtures';
import type { Level, PlayerLevel } from '@/types/api';
import { ApiError } from '@/services/apiError';

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const mockObtainGoogleIdToken = jest.fn(async () => 'google-id-token');
const mockLinkGoogleIdentity = jest.fn(async () => undefined);
const mockSignOut = jest.fn(async () => undefined);
const mockRefreshMe = jest.fn(async () => undefined);

let mockUser: ReturnType<typeof mapPlayerToUser> | null = mapPlayerToUser(makePlayer());
let mockAuthLoading = false;

function renderAccount() {
  const result = renderWithQueryClient(<AccountScreen />);
  return result;
}

jest.mock('@/context/auth', () => ({
  useAuth: () => ({
    get user() {
      return mockUser;
    },
    isLoading: mockAuthLoading,
    signOut: mockSignOut,
    obtainGoogleIdToken: mockObtainGoogleIdToken,
    linkGoogleIdentity: mockLinkGoogleIdentity,
    refreshMe: mockRefreshMe,
  }),
}));

const mockFetchEventHistory = jest.fn(async () => ({ data: [] as unknown[] }));
jest.mock('@/services/eventHistory', () => ({
  fetchEventHistory: (...args: unknown[]) => mockFetchEventHistory(...args),
}));

jest.mock('@/services/confirm', () => ({
  confirmAsync: jest.fn(async () => true),
}));

const mockRefetchIdentities = jest.fn();
let mockIdentities = [makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' })];
let mockIdentitiesLoading = false;
let mockUnlinkPending = false;
const mockUnlinkMutateAsync = jest.fn(async () => undefined);
const mockAvatarMutateAsync = jest.fn(async (_id: number) => undefined);
let mockAvatarPending = false;

jest.mock('@/services/hooks/useIdentities', () => ({
  useIdentities: () => ({
    data: mockIdentities,
    loading: mockIdentitiesLoading,
    error: null,
    refetch: mockRefetchIdentities,
  }),
  useSetAvatarPrimaryMutation: () => ({
    mutateAsync: mockAvatarMutateAsync,
    get isPending() {
      return mockAvatarPending;
    },
  }),
  useUnlinkIdentityMutation: () => ({
    mutateAsync: mockUnlinkMutateAsync,
    get isPending() {
      return mockUnlinkPending;
    },
  }),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () =>
  require('@/testing/expoRouterMock').createExpoRouterMock({
    useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  })
);

let mockCurrentLevel: PlayerLevel | null = null;
jest.mock('@/services/hooks/useLevelAssessment', () => ({
  useCurrentLevel: () => ({
    data: mockCurrentLevel,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

let mockLevels: Level[] | null = null;
jest.mock('@/services/hooks/useLevels', () => ({
  useLevels: () => ({ data: mockLevels, loading: false, error: null, refetch: jest.fn() }),
}));

const mockStartLevelFlow = jest.fn(async (..._args: unknown[]) => true);
const mockCancelLevelFlow = jest.fn();
let mockLevelStarting = false;
let mockLevelFlowError: Error | null = null;
jest.mock('@/services/hooks/useLevelFlow', () => ({
  useLevelFlow: () => ({
    start: mockStartLevelFlow,
    cancel: mockCancelLevelFlow,
    get starting() {
      return mockLevelStarting;
    },
    get error() {
      return mockLevelFlowError;
    },
  }),
}));

const divisionLevels = (n: number): Level[] => [
  { id_level: n * 10 + 1, name: `Division ${n} Low`, level_min: `${n}.99`, level_max: `${n}.67` },
  { id_level: n * 10 + 2, name: `Division ${n} Mid`, level_min: `${n}.66`, level_max: `${n}.34` },
  { id_level: n * 10 + 3, name: `Division ${n} High`, level_min: `${n}.33`, level_max: `${n}.00` },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockAuthLoading = false;
  mockUser = mapPlayerToUser(makePlayer());
  mockIdentities = [makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' })];
  mockIdentitiesLoading = false;
  mockUnlinkPending = false;
  mockAvatarPending = false;
  mockCurrentLevel = null;
  mockLevels = null;
  mockLevelStarting = false;
  mockLevelFlowError = null;
  mockStartLevelFlow.mockResolvedValue(true);
  mockFetchEventHistory.mockResolvedValue({ data: [] });
  (confirmAsync as jest.Mock).mockResolvedValue(true);
});

describe('AccountScreen', () => {
  it('shows guest login when logged out', async () => {
    mockUser = null;
    const { client } = renderAccount();
    expect(screen.getByTestId('account-guest-login')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('labels the section My Participations and links with slug when present', async () => {
    mockFetchEventHistory.mockResolvedValue({
      data: [
        {
          id_event: 9,
          name: 'Past Minitour',
          slug: 'tour-org-past-minitour',
          date: '2026-01-15',
          division_titles: ['Students Rookies'],
        },
      ],
    });
    const { client } = renderAccount();

    await waitFor(() => expect(screen.getByText('My Participations')).toBeTruthy());
    expect(screen.queryByText('Event History')).toBeNull();
    await waitFor(() => expect(screen.getByTestId('event-history-9')).toBeTruthy());
    fireEvent.press(screen.getByTestId('event-history-9'));
    expect(mockPush).toHaveBeenCalledWith('/event/9/tour-org-past-minitour');
    await disposeTestQueryClient(client);
  });

  it('lists linked Google identities without primary badge', async () => {
    const { client } = renderAccount();
    expect(screen.getByTestId('google-identities-list')).toBeTruthy();
    expect(screen.getByText('linked@example.com')).toBeTruthy();
    expect(screen.queryByText('Primary Account')).toBeNull();
    await disposeTestQueryClient(client);
  });

  it('shows locked personal info fields', async () => {
    const { client } = renderAccount();
    expect(screen.getByText('Full Name')).toBeTruthy();
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Phone Number')).toBeTruthy();
    expect(screen.getByTestId('account-avatar-lock')).toBeTruthy();
    expect(screen.queryByText('private section')).toBeNull();
    expect(screen.queryByText('Birthdate')).toBeNull();
    expect(screen.queryByText('High School / University student')).toBeNull();
    await disposeTestQueryClient(client);
  });

  it('hides Unlink when the identity is the last for that provider', async () => {
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('google-identity-10'));
    expect(screen.queryByText('Unlink')).toBeNull();
    expect(screen.getByText('Close')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('shows Unlink when multiple Google identities exist', async () => {
    mockIdentities = [
      makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' }),
      makeGoogleIdentity({ id_identity: 11, email: 'second@example.com' }),
    ];
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('google-identity-10'));
    expect(screen.getByText('Unlink')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('surfaces unlink errors in the identity modal', async () => {
    mockIdentities = [
      makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' }),
      makeGoogleIdentity({ id_identity: 11, email: 'second@example.com' }),
    ];
    mockUnlinkMutateAsync.mockRejectedValueOnce(
      new ApiError(422, 'Cannot unlink the last Google identity')
    );
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('google-identity-10'));
    fireEvent.press(screen.getByText('Unlink'));

    await waitFor(() =>
      expect(screen.getByTestId('identity-unlink-error')).toBeTruthy()
    );
    expect(screen.getByText('Cannot unlink the last Google identity')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('shows on-button loading and disables close while unlink is pending', async () => {
    mockIdentities = [
      makeGoogleIdentity({ id_identity: 10, email: 'linked@example.com' }),
      makeGoogleIdentity({ id_identity: 11, email: 'second@example.com' }),
    ];
    mockUnlinkPending = true;
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('google-identity-10'));

    expect(screen.getByTestId('identity-unlink-loading')).toBeTruthy();
    fireEvent.press(screen.getByText('Close'));
    expect(screen.getByTestId('identity-unlink-loading')).toBeTruthy();
    await disposeTestQueryClient(client);
  });

  it('links another Google account via obtainGoogleIdToken', async () => {
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('link-google-account'));

    await waitFor(() => expect(mockObtainGoogleIdToken).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockLinkGoogleIdentity).toHaveBeenCalledWith('google-id-token')
    );
    await disposeTestQueryClient(client);
  });

  it('alerts on link conflict', async () => {
    mockLinkGoogleIdentity.mockRejectedValueOnce(
      new ApiError(409, 'Identity already linked to another player')
    );
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('link-google-account'));

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Could not link account',
        'Identity already linked to another player'
      )
    );
    await disposeTestQueryClient(client);
  });

  it('confirms before sign out', async () => {
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('account-sign-out'));

    await waitFor(() => expect(confirmAsync).toHaveBeenCalled());
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    await disposeTestQueryClient(client);
  });

  it('does not sign out when confirmation is cancelled', async () => {
    (confirmAsync as jest.Mock).mockResolvedValueOnce(false);
    const { client } = renderAccount();
    fireEvent.press(screen.getByTestId('account-sign-out'));

    await waitFor(() => expect(confirmAsync).toHaveBeenCalled());
    expect(mockSignOut).not.toHaveBeenCalled();
    await disposeTestQueryClient(client);
  });

  describe('player level', () => {
    it('shows the Assess my level CTA when the player has no level', async () => {
      const { client } = renderAccount();

      expect(screen.queryByTestId('account-level-band')).toBeNull();
      fireEvent.press(screen.getByTestId('account-assess-level'));

      expect(mockStartLevelFlow).toHaveBeenCalledWith('assessment');
      await disposeTestQueryClient(client);
    });

    it('shows the band name instead of the CTA when a level exists', async () => {
      mockCurrentLevel = makePlayerLevel({ band_name: 'Advanced', level: '4.50' });
      const { client } = renderAccount();

      expect(screen.getByTestId('account-level-band')).toBeTruthy();
      expect(screen.getByText('Advanced')).toBeTruthy();
      expect(screen.queryByTestId('account-assess-level')).toBeNull();
      await disposeTestQueryClient(client);
    });

    it('opens a centered modal with band, numeric level and Update level assessment', async () => {
      mockCurrentLevel = makePlayerLevel({ band_name: 'Advanced', level: '4.50' });
      const { client } = renderAccount();

      expect(screen.queryByTestId('level-modal')).toBeNull();
      fireEvent.press(screen.getByTestId('account-level-band'));

      expect(screen.getByTestId('level-modal')).toBeTruthy();
      expect(screen.getByTestId('level-modal-band').props.children).toBe('Advanced');
      expect(screen.getByText('Level 4.50')).toBeTruthy();

      await act(async () => {
        fireEvent.press(screen.getByText('Update level assessment'));
      });
      expect(mockStartLevelFlow).toHaveBeenCalledWith('assessment');
      await waitFor(() => expect(screen.queryByTestId('level-modal')).toBeNull());
      await disposeTestQueryClient(client);
    });

    it('keeps the modal open with a loader on the CTA while the API is pending', async () => {
      mockCurrentLevel = makePlayerLevel({ band_name: 'Division 3 Mid', level: '3.50' });
      mockLevelStarting = true;
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('account-level-band'));

      expect(screen.getByTestId('level-modal-update-loading')).toBeTruthy();
      expect(screen.queryByText('Update level assessment')).toBeNull();

      fireEvent.press(screen.getByTestId('level-modal-update'));
      expect(mockStartLevelFlow).not.toHaveBeenCalled(); // disabled while loading
      expect(screen.getByTestId('level-modal')).toBeTruthy();
      await disposeTestQueryClient(client);
    });

    it('stays open until start resolves, then closes once it navigated', async () => {
      mockCurrentLevel = makePlayerLevel({ band_name: 'Division 3 Mid', level: '3.50' });
      let resolveStart: (v: boolean) => void = () => undefined;
      mockStartLevelFlow.mockImplementationOnce(
        () => new Promise<boolean>((resolve) => (resolveStart = resolve))
      );
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('account-level-band'));
      fireEvent.press(screen.getByTestId('level-modal-update'));

      expect(screen.getByTestId('level-modal')).toBeTruthy();
      await act(async () => {
        resolveStart(true);
      });
      await waitFor(() => expect(screen.queryByTestId('level-modal')).toBeNull());
      await disposeTestQueryClient(client);
    });

    it('keeps the modal open and shows an error when start fails', async () => {
      mockCurrentLevel = makePlayerLevel({ band_name: 'Division 3 Mid', level: '3.50' });
      mockStartLevelFlow.mockResolvedValueOnce(false);
      mockLevelFlowError = new Error('boom');
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('account-level-band'));
      fireEvent.press(screen.getByTestId('level-modal-update'));

      await waitFor(() => expect(mockStartLevelFlow).toHaveBeenCalled());
      expect(screen.getByTestId('level-modal')).toBeTruthy();
      expect(screen.getByTestId('level-modal-error')).toBeTruthy();
      await disposeTestQueryClient(client);
    });

    it('Close aborts the pending start without navigating', async () => {
      mockCurrentLevel = makePlayerLevel({ band_name: 'Division 3 Mid', level: '3.50' });
      mockLevelStarting = true;
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('account-level-band'));
      fireEvent.press(screen.getByTestId('level-modal-close'));

      expect(mockCancelLevelFlow).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('level-modal')).toBeNull();
      expect(mockPush).not.toHaveBeenCalled();
      await disposeTestQueryClient(client);
    });

    it('backdrop press aborts the pending start without navigating', async () => {
      mockCurrentLevel = makePlayerLevel({ band_name: 'Division 3 Mid', level: '3.50' });
      mockLevelStarting = true;
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('account-level-band'));
      fireEvent.press(screen.getByTestId('level-modal-backdrop'));

      expect(mockCancelLevelFlow).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('level-modal')).toBeNull();
      expect(mockPush).not.toHaveBeenCalled();
      await disposeTestQueryClient(client);
    });

    it('renders the 3-segment Low/Mid/High scale under the band name', async () => {
      mockCurrentLevel = makePlayerLevel({ band_name: 'Division 3 Mid', level: '3.50' });
      mockLevels = [...divisionLevels(4), ...divisionLevels(3), ...divisionLevels(2)];
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('account-level-band'));

      expect(screen.getByTestId('level-band-scale')).toBeTruthy();
      expect(screen.getByTestId('level-band-label-low')).toBeTruthy();
      expect(screen.getByTestId('level-band-label-mid')).toBeTruthy();
      expect(screen.getByTestId('level-band-label-high')).toBeTruthy();
      expect(screen.getByTestId('level-band-pointer')).toBeTruthy();
      await disposeTestQueryClient(client);
    });

    it('omits the scale when levels are unavailable', async () => {
      mockCurrentLevel = makePlayerLevel({ band_name: 'Division 3 Mid', level: '3.50' });
      mockLevels = null;
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('account-level-band'));

      expect(screen.queryByTestId('level-band-scale')).toBeNull();
      await disposeTestQueryClient(client);
    });

    it('opens the student proof submit flow', async () => {
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('account-student-proof'));

      expect(mockPush).toHaveBeenCalledWith({ pathname: '/student-proof', params: {} });
      await disposeTestQueryClient(client);
    });
  });

  describe('avatar', () => {
    const avatarUris = () =>
      screen
        .UNSAFE_getAllByType(Image)
        .map((img) => (img.props.source as { uri?: string })?.uri)
        .filter(Boolean);

    it('shows the Google avatar_url', async () => {
      mockUser = mapPlayerToUser(
        makePlayer({ avatar_url: 'https://example.com/google.png' })
      );
      const { client } = renderAccount();

      expect(avatarUris()).toContain('https://example.com/google.png');
      await disposeTestQueryClient(client);
    });

    it('never falls back to a PDF / uploaded profile image', async () => {
      mockUser = mapPlayerToUser(
        makePlayer({
          avatar_url: null,
          identities: [makeGoogleIdentity({ avatar_url: null })],
          uploaded_profile_images: [
            { id: 2, url: 'https://example.com/pdf.png', is_pdf_primary: true },
          ],
        })
      );
      const { client } = renderAccount();

      expect(avatarUris()).not.toContain('https://example.com/pdf.png');
      await disposeTestQueryClient(client);
    });
  });

  describe('layout and link loader', () => {
    it('uses the same title-to-content gap for Linked Google Accounts as Personal Information', async () => {
      const { client } = renderAccount();
      const list = StyleSheet.flatten(
        screen.getByTestId('google-identities-list').props.style
      );
      expect(list.marginTop).toBe(16);
      await disposeTestQueryClient(client);
    });

    it('shows the loader on the Link Another Account button itself while linking', async () => {
      let resolveToken: (v: string) => void = () => undefined;
      mockObtainGoogleIdToken.mockImplementationOnce(
        () => new Promise<string>((resolve) => (resolveToken = resolve))
      );
      const { client } = renderAccount();
      await waitFor(() => expect(screen.getByTestId('event-history-list')).toBeTruthy());
      expect(screen.UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(0);
      fireEvent.press(screen.getByTestId('link-google-account'));

      await waitFor(() =>
        expect(screen.getByTestId('link-google-account-loading')).toBeTruthy()
      );
      expect(screen.queryByText('Link Another Account')).toBeNull();
      // The only new spinner is the button's own (no sibling ActivityIndicator).
      expect(screen.UNSAFE_queryAllByType(ActivityIndicator)).toHaveLength(1);

      await act(async () => {
        resolveToken('t');
      });
      await waitFor(() =>
        expect(screen.queryByTestId('link-google-account-loading')).toBeNull()
      );
      await disposeTestQueryClient(client);
    });
  });

  describe('primary avatar UI', () => {
    it('shows a Primary avatar badge only on the primary identity row', async () => {
      mockIdentities = [
        makeGoogleIdentity({ id_identity: 10, is_avatar_primary: true }),
        makeGoogleIdentity({
          id_identity: 11,
          email: 'second@example.com',
          is_avatar_primary: false,
        }),
      ];
      const { client } = renderAccount();

      expect(screen.getByTestId('google-identity-primary-10')).toBeTruthy();
      expect(screen.queryByTestId('google-identity-primary-11')).toBeNull();
      await disposeTestQueryClient(client);
    });

    it('shows "Primary avatar" in the modal for the primary identity', async () => {
      mockIdentities = [makeGoogleIdentity({ id_identity: 10, is_avatar_primary: true })];
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('google-identity-10'));

      expect(screen.getByTestId('identity-primary-avatar')).toBeTruthy();
      expect(screen.queryByTestId('identity-use-as-avatar')).toBeNull();
      await disposeTestQueryClient(client);
    });

    it('offers Use as avatar (no badge) for a non-primary identity with an avatar URL', async () => {
      mockIdentities = [makeGoogleIdentity({ id_identity: 11, is_avatar_primary: false })];
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('google-identity-11'));

      expect(screen.getByTestId('identity-use-as-avatar')).toBeTruthy();
      expect(screen.queryByTestId('identity-primary-avatar')).toBeNull();
      await disposeTestQueryClient(client);
    });

    it('retries the image after user.picture changes following a load error', async () => {
      mockUser = mapPlayerToUser(
        makePlayer({ avatar_url: 'https://example.com/broken.png' })
      );
      const { client, rerender } = renderAccount();
      const uris = () =>
        screen
          .UNSAFE_getAllByType(Image)
          .map((img) => (img.props.source as { uri?: string })?.uri);

      const broken = screen
        .UNSAFE_getAllByType(Image)
        .find((img) => (img.props.source as { uri?: string })?.uri === 'https://example.com/broken.png');
      act(() => {
        broken!.props.onError();
      });
      expect(uris()).not.toContain('https://example.com/broken.png');

      mockUser = mapPlayerToUser(
        makePlayer({ avatar_url: 'https://example.com/fixed.png' })
      );
      rerender(<AccountScreen />);

      await waitFor(() => expect(uris()).toContain('https://example.com/fixed.png'));
      await disposeTestQueryClient(client);
    });
  });

  describe('primary Google avatar picker', () => {
    it('hides Use as avatar when the identity is already primary', async () => {
      mockIdentities = [
        makeGoogleIdentity({ id_identity: 10, is_avatar_primary: true }),
      ];
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('google-identity-10'));

      expect(screen.queryByTestId('identity-use-as-avatar')).toBeNull();
      await disposeTestQueryClient(client);
    });

    it('hides Use as avatar when the identity has no avatar', async () => {
      mockIdentities = [
        makeGoogleIdentity({ id_identity: 10, avatar_url: null, is_avatar_primary: false }),
      ];
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('google-identity-10'));

      expect(screen.queryByTestId('identity-use-as-avatar')).toBeNull();
      await disposeTestQueryClient(client);
    });

    it('calls the API, refreshes the picture and closes the modal on success', async () => {
      mockIdentities = [
        makeGoogleIdentity({ id_identity: 10, is_avatar_primary: true }),
        makeGoogleIdentity({
          id_identity: 11,
          email: 'second@example.com',
          avatar_url: 'https://example.com/second.png',
          is_avatar_primary: false,
        }),
      ];
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('google-identity-11'));
      fireEvent.press(screen.getByTestId('identity-use-as-avatar'));

      await waitFor(() => expect(mockAvatarMutateAsync).toHaveBeenCalledWith(11));
      await waitFor(() => expect(mockRefreshMe).toHaveBeenCalled());
      await waitFor(() =>
        expect(screen.queryByTestId('identity-use-as-avatar')).toBeNull()
      );
      await disposeTestQueryClient(client);
    });

    it('shows the error and does not refresh when the API fails', async () => {
      mockIdentities = [
        makeGoogleIdentity({ id_identity: 11, is_avatar_primary: false }),
      ];
      mockAvatarMutateAsync.mockRejectedValueOnce(
        new ApiError(422, 'Only a Google identity with an avatar can be the primary avatar.')
      );
      const { client } = renderAccount();
      fireEvent.press(screen.getByTestId('google-identity-11'));
      fireEvent.press(screen.getByTestId('identity-use-as-avatar'));

      await waitFor(() =>
        expect(screen.getByTestId('identity-avatar-error')).toBeTruthy()
      );
      expect(mockRefreshMe).not.toHaveBeenCalled();
      await disposeTestQueryClient(client);
    });
  });
});
