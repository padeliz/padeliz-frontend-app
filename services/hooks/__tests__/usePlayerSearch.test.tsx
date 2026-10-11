import type { QueryClient } from '@tanstack/react-query';
import { act, waitFor } from '@testing-library/react-native';
import { renderHookWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import { usePlayerSearch } from '@/services/hooks/useDiscovery';

jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: { id: '9' }, isLoading: false }),
}));

const mockSearch = jest.fn();
jest.mock('@/services/discovery', () => ({
  ...jest.requireActual('@/services/discovery'),
  searchPlayers: (...args: unknown[]) => mockSearch(...args),
}));

let testClient: QueryClient | null = null;

beforeEach(() => {
  jest.clearAllMocks();
  mockSearch.mockResolvedValue([
    { id_user: 5, name: 'Ana Pop', email_masked: null, phone_masked: null, avatar_url: null },
  ]);
});
afterEach(async () => {
  jest.useRealTimers();
  if (testClient) await disposeTestQueryClient(testClient);
  testClient = null;
});

describe('usePlayerSearch', () => {
  it('stays idle below the minimum length', async () => {
    jest.useFakeTimers();
    const { result, client } = renderHookWithQueryClient(() => usePlayerSearch('a'));
    testClient = client;

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockSearch).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('debounces, then calls the search API with the trimmed query', async () => {
    jest.useFakeTimers();
    const { result, client } = renderHookWithQueryClient(() => usePlayerSearch(' ana '));
    testClient = client;

    expect(mockSearch).not.toHaveBeenCalled();
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(mockSearch).toHaveBeenCalledTimes(1);
    expect(mockSearch.mock.calls[0][0]).toBe('ana');
  });
});
