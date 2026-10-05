import { act, waitFor } from '@testing-library/react-native';
import {
  useEvent,
  useEventCount,
  useEventsPager,
} from '@/services/hooks/useEvents';
import { renderHookWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import { makeEvent } from '@/testing/fixtures';
import { queryKeys } from '@/lib/queryClient';
import type { Event, PaginatedResponse } from '@/types/api';

let mockUser: { id: string } | null = null;
jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: mockUser, isLoading: false }),
}));

jest.mock('@/services/events', () => ({
  fetchEvent: jest.fn(),
  fetchEvents: jest.fn(),
}));

import { fetchEvent, fetchEvents } from '@/services/events';

const fetchEventMock = fetchEvent as jest.MockedFunction<typeof fetchEvent>;
const fetchEventsMock = fetchEvents as jest.MockedFunction<typeof fetchEvents>;

const RANGE = { date_from: '2026-01-01', date_to: '2026-12-31' };

function pageOf(
  data: Event[],
  current: number,
  last: number,
  total: number
): PaginatedResponse<Event> {
  return {
    data,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: current,
      last_page: last,
      per_page: 1,
      total,
      from: 1,
      to: 1,
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = null;
});

describe('useEvent', () => {
  it('loads a public event without a user', async () => {
    const event = makeEvent();
    fetchEventMock.mockResolvedValue(event);

    const { result, client } = renderHookWithQueryClient(() => useEvent(42));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(event);
    expect(fetchEventMock).toHaveBeenCalledWith(42, expect.any(AbortSignal));
    expect(
      client.getQueryData(queryKeys.events.detail('guest', 42))
    ).toEqual(event);
    await disposeTestQueryClient(client);
  });

  it('scopes the cache by viewer', async () => {
    mockUser = { id: '7' };
    fetchEventMock.mockResolvedValue(makeEvent());

    const { result, client } = renderHookWithQueryClient(() => useEvent(42));
    await waitFor(() => expect(result.current.data).not.toBeNull());
    expect(
      client.getQueryData(queryKeys.events.detail('7', 42))
    ).toBeDefined();
    expect(client.getQueryData(queryKeys.events.detail('guest', 42))).toBeUndefined();
    await disposeTestQueryClient(client);
  });

  it('surfaces errors', async () => {
    fetchEventMock.mockRejectedValue(new Error('boom'));
    const { result, client } = renderHookWithQueryClient(() => useEvent(42));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.data).toBeNull();
    await disposeTestQueryClient(client);
  });
});

describe('useEventsPager', () => {
  it('accumulates pages and de-duplicates by id', async () => {
    const a = makeEvent({ id_event: 1 });
    const b = makeEvent({ id_event: 2 });
    fetchEventsMock.mockImplementation(async (opts) =>
      (opts as { page?: number }).page === 2 ? pageOf([a, b], 2, 2, 2) : pageOf([a], 1, 2, 2)
    );

    const { result, client } = renderHookWithQueryClient(() =>
      useEventsPager(RANGE)
    );
    expect(result.current.isInitialLoading).toBe(true);

    await waitFor(() => expect(result.current.events).toHaveLength(1));
    expect(result.current.hasMore).toBe(true);
    expect(result.current.total).toBe(2);

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.events).toHaveLength(2));
    expect(result.current.events.map((e) => e.id_event)).toEqual([1, 2]);
    expect(result.current.hasMore).toBe(false);
    await disposeTestQueryClient(client);
  });
});

describe('useEventCount', () => {
  it('returns meta.total', async () => {
    fetchEventsMock.mockResolvedValue(pageOf([makeEvent()], 1, 1, 5));
    const { result, client } = renderHookWithQueryClient(() =>
      useEventCount(RANGE)
    );
    expect(result.current).toBeUndefined();
    await waitFor(() => expect(result.current).toBe(5));
    await disposeTestQueryClient(client);
  });
});
