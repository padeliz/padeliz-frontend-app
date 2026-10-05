import {
  clearEventCache,
  fetchEvent,
  fetchEvents,
  getCachedEvent,
  primeEventCache,
} from '@/services/events';
import { makeEvent } from '@/testing/fixtures';
import type { Event } from '@/types/api';

jest.mock('@/services/apiClient', () => ({
  apiGetPaginated: jest.fn(),
  apiGetEnvelope: jest.fn(),
}));

import { apiGetEnvelope, apiGetPaginated } from '@/services/apiClient';

const apiGetPaginatedMock = apiGetPaginated as jest.MockedFunction<typeof apiGetPaginated>;
const apiGetEnvelopeMock = apiGetEnvelope as jest.MockedFunction<typeof apiGetEnvelope>;

beforeEach(() => {
  clearEventCache();
  jest.clearAllMocks();
});

describe('event cache merge', () => {
  it('does not replace present event_divisions with an absent key', () => {
    const complete = makeEvent();
    primeEventCache([complete]);

    const thin: Event = {
      ...makeEvent(),
    };
    delete thin.event_divisions;
    primeEventCache([thin]);

    const cached = getCachedEvent(complete.id_event);
    expect(cached?.event_divisions).toEqual(complete.event_divisions);
    expect(cached?.name).toBe(thin.name);
  });

  it('allows replacing with an explicit empty event_divisions array', () => {
    primeEventCache([makeEvent()]);
    primeEventCache([makeEvent({ event_divisions: [] })]);

    expect(getCachedEvent(makeEvent().id_event)?.event_divisions).toEqual([]);
  });
});

describe('fetchEvent', () => {
  it('uses GET /app/events/{id} show', async () => {
    const complete = makeEvent();
    apiGetEnvelopeMock.mockResolvedValue(complete);

    const loaded = await fetchEvent(complete.id_event);

    expect(apiGetEnvelopeMock).toHaveBeenCalledWith(
      `/app/events/${complete.id_event}`,
      expect.objectContaining({ auth: true })
    );
    expect(apiGetPaginatedMock).not.toHaveBeenCalled();
    expect(loaded.event_divisions).toEqual(complete.event_divisions);
    // React Query is the cache of record: fetchers must not populate the legacy map.
    expect(getCachedEvent(complete.id_event)).toBeUndefined();
  });
});

describe('fetchEvents filters', () => {
  it('passes filter query params to the list endpoint', async () => {
    apiGetPaginatedMock.mockResolvedValue({
      data: [makeEvent()],
      links: { first: null, last: null, prev: null, next: null },
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
        from: 1,
        to: 1,
      },
    });

    await fetchEvents({
      range: { date_from: '2026-01-01', date_to: '2026-12-31' },
      page: 1,
      filters: {
        registered: true,
        unpaid: true,
        lottery_winner: true,
        club_ids: [3, 5],
      },
    });

    expect(apiGetPaginatedMock).toHaveBeenCalledWith(
      '/app/events',
      expect.objectContaining({
        query: expect.objectContaining({
          date_from: '2026-01-01',
          date_to: '2026-12-31',
          page: 1,
          registered: 1,
          unpaid: 1,
          lottery_winner: 1,
          'club_ids[]': [3, 5],
        }),
      })
    );
  });
});
