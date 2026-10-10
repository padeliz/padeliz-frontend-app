import type { QueryClient } from '@tanstack/react-query';
import { act, waitFor } from '@testing-library/react-native';
import { renderHookWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import { useLevelFlow } from '@/services/hooks/useLevelFlow';
import { makeDiscoverySummary } from '@/testing/fixtures';
import type { DiscoverySummary } from '@/types/api';

jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: { id: '9' }, isLoading: false }),
}));

const mockPush = jest.fn();
jest.mock('expo-router', () =>
  require('@/testing/expoRouterMock').createExpoRouterMock({
    useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
  })
);

const mockFetchSummary = jest.fn();
jest.mock('@/services/discovery', () => ({
  ...jest.requireActual('@/services/discovery'),
  fetchDiscoverySummary: (...args: unknown[]) => mockFetchSummary(...args),
}));

let testClient: QueryClient | null = null;

async function startFlow(
  summary: DiscoverySummary,
  target: 'assessment' | 'registration',
  eventId?: number
) {
  mockFetchSummary.mockResolvedValue(summary);
  const { result, client } = renderHookWithQueryClient(() => useLevelFlow());
  testClient = client;
  await act(async () => {
    await result.current.start(target, eventId);
  });
  await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
  return mockPush.mock.calls[0][0] as { pathname: string; params: Record<string, string> };
}

beforeEach(() => jest.clearAllMocks());
afterEach(async () => {
  if (testClient) await disposeTestQueryClient(testClient);
  testClient = null;
});

describe('useLevelFlow cancel', () => {
  it('start resolves true after navigating', async () => {
    mockFetchSummary.mockResolvedValue(
      makeDiscoverySummary({ media_source_ids: [1], friends_selected: false })
    );
    const { result, client } = renderHookWithQueryClient(() => useLevelFlow());
    testClient = client;
    let navigated: boolean | undefined;
    await act(async () => {
      navigated = await result.current.start('assessment');
    });
    expect(navigated).toBe(true);
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('cancel stops the pending start from navigating and clears starting', async () => {
    let resolveSummary: (s: DiscoverySummary) => void = () => undefined;
    mockFetchSummary.mockImplementation(
      () => new Promise<DiscoverySummary>((resolve) => (resolveSummary = resolve))
    );
    const { result, client } = renderHookWithQueryClient(() => useLevelFlow());
    testClient = client;

    let startPromise: Promise<boolean> = Promise.resolve(false);
    act(() => {
      startPromise = result.current.start('assessment');
    });
    await waitFor(() => expect(result.current.starting).toBe(true));

    act(() => {
      result.current.cancel();
    });
    expect(result.current.starting).toBe(false);

    let navigated: boolean | undefined;
    await act(async () => {
      resolveSummary(makeDiscoverySummary({ media_source_ids: [1], friends_selected: false }));
      navigated = await startPromise;
    });
    expect(navigated).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.starting).toBe(false);
  });
});

describe('useLevelFlow', () => {
  it('shows Discovery first when media is empty (assessment)', async () => {
    const route = await startFlow(makeDiscoverySummary(), 'assessment');
    expect(route).toEqual({ pathname: '/discovery', params: { target: 'assessment' } });
  });

  it('shows Discovery first when media is empty (registration), keeping the event', async () => {
    const route = await startFlow(makeDiscoverySummary(), 'registration', 7);
    expect(route).toEqual({
      pathname: '/discovery',
      params: { target: 'registration', eventId: '7' },
    });
  });

  it('shows Discovery when Friends is selected and friends are empty', async () => {
    const route = await startFlow(
      makeDiscoverySummary({ media_source_ids: [4], friends_selected: true, friends: [] }),
      'assessment'
    );
    expect(route.pathname).toBe('/discovery');
  });

  it('goes straight to the assessment when Discovery is complete', async () => {
    const route = await startFlow(
      makeDiscoverySummary({ media_source_ids: [1], friends_selected: false }),
      'assessment'
    );
    expect(route).toEqual({ pathname: '/level-assessment', params: {} });
  });

  it('goes straight to registration when Discovery is complete', async () => {
    const route = await startFlow(
      makeDiscoverySummary({ media_source_ids: [1], friends_selected: false }),
      'registration',
      7
    );
    expect(route).toEqual({ pathname: '/event/registration', params: { eventId: '7' } });
  });
});
