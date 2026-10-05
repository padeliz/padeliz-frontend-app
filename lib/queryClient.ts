/**
 * React Query client + keys for App server state.
 *
 * Authed (or auth-dependent) keys carry a `viewer` segment (`user.id` or `"guest"`) so
 * data never leaks across sessions and sign-in/out naturally switches cache entries.
 */

import { QueryClient } from '@tanstack/react-query';
import type { DateRange } from '@/services/dateRange';
import type { EventListFilters } from '@/services/events';

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: true,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export type Viewer = string;

export const GUEST_VIEWER: Viewer = 'guest';

type RangeKey = Pick<DateRange, 'date_from' | 'date_to'>;

function rangeKey(range: DateRange): RangeKey {
  return { date_from: range.date_from, date_to: range.date_to };
}

export const queryKeys = {
  events: {
    all: () => ['events'] as const,
    detail: (viewer: Viewer, id: number) =>
      ['events', 'detail', viewer, id] as const,
    list: (
      viewer: Viewer,
      range: DateRange,
      page: number,
      filters?: EventListFilters
    ) => ['events', 'list', viewer, rangeKey(range), page, filters ?? {}] as const,
    /** Infinite (paged) list for a range + filters. */
    pager: (viewer: Viewer, range: DateRange, filters?: EventListFilters) =>
      ['events', 'pager', viewer, rangeKey(range), filters ?? {}] as const,
    count: (viewer: Viewer, range: DateRange, filters?: EventListFilters) =>
      ['events', 'count', viewer, rangeKey(range), filters ?? {}] as const,
  },
  registrations: {
    all: (viewer: Viewer) => ['registrations', viewer] as const,
    list: (viewer: Viewer, eventId?: number) =>
      ['registrations', viewer, eventId ?? 'all'] as const,
  },
  eligibility: {
    all: (viewer: Viewer) => ['eligibility', viewer] as const,
    status: (viewer: Viewer) => ['eligibility', viewer, 'status'] as const,
    latest: (viewer: Viewer) => ['eligibility', viewer, 'latest'] as const,
    approved: (viewer: Viewer) => ['eligibility', viewer, 'approved'] as const,
  },
  bankTransferSettings: (
    viewer: Viewer,
    query: { checkoutId: number | null; registrationId: number | null }
  ) => ['bankTransferSettings', viewer, query] as const,
  identities: {
    all: (viewer: Viewer) => ['identities', viewer] as const,
    list: (viewer: Viewer) => ['identities', viewer, 'list'] as const,
  },
};

/** Invalidate all registration queries for the current viewer (list + bank settings). */
export function invalidateViewerRegistrations(
  client: QueryClient,
  viewer: Viewer
) {
  return Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.registrations.all(viewer) }),
    client.invalidateQueries({
      queryKey: ['bankTransferSettings', viewer],
    }),
  ]);
}

/** Invalidate event detail + lists for the current viewer. */
export function invalidateViewerEvents(client: QueryClient, viewer: Viewer) {
  return client.invalidateQueries({
    queryKey: [...queryKeys.events.all(), viewer],
  });
}
