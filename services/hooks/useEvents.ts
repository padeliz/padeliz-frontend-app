import { useCallback, useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  fetchEvent,
  fetchEvents,
  type EventListFilters,
  type FetchEventsOpts,
} from "@/services/events";
import { toQueryState, useViewer } from "@/services/hooks/queryState";
import type { DateRange } from "@/services/dateRange";
import type { Event, PaginatedResponse } from "@/types/api";

/**
 * Event reads are public, but the payload varies with the bearer (membership flags,
 * etc.), so they are keyed per viewer and run for guests too.
 */

/** Resolve a single event by id via GET /app/events/{id}. */
export function useEvent(id: number) {
  const { viewer } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.events.detail(viewer, id),
      queryFn: ({ signal }) => fetchEvent(id, signal),
      enabled: Number.isFinite(id),
    })
  );
}

/** Public events list for the given date range / page. */
export function useEvents(
  range: DateRange,
  page = 1,
  filters?: EventListFilters
) {
  const { viewer } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.events.list(viewer, range, page, filters),
      queryFn: ({ signal }) => fetchEvents({ range, page, filters, signal }),
    })
  );
}

export type EventsFetcher = (
  range: DateRange,
  page: number,
  signal?: AbortSignal,
  filters?: EventListFilters
) => Promise<PaginatedResponse<Event>>;

function flattenPages(pages: PaginatedResponse<Event>[]): Event[] {
  const seen = new Set<number>();
  const out: Event[] = [];
  for (const page of pages) {
    for (const event of page.data) {
      if (seen.has(event.id_event)) continue;
      seen.add(event.id_event);
      out.push(event);
    }
  }
  return out;
}

export type EventsPager = {
  events: Event[];
  /** True only on the first page load (nothing rendered yet). */
  isInitialLoading: boolean;
  /** True while a "load more" page is being fetched. */
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  total: number;
  loadMore: () => void;
  refetch: () => void;
};

/**
 * Pages through GET /app/events, accumulating results across pages.
 * Changing range/filters switches to a different cached infinite query.
 */
export function useEventsPager(
  range: DateRange,
  filters?: EventListFilters
): EventsPager {
  const { viewer } = useViewer();
  const query = useInfiniteQuery({
    queryKey: queryKeys.events.pager(viewer, range, filters),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      fetchEvents({ range, page: pageParam, filters, signal }),
    getNextPageParam: (last) =>
      last.meta.current_page < last.meta.last_page
        ? last.meta.current_page + 1
        : undefined,
  });

  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } =
    query;
  const { refetch } = query;

  const events = useMemo(
    () => (data ? flattenPages(data.pages) : []),
    [data]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) void fetchNextPage();
  }, [hasNextPage, isFetching, fetchNextPage]);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const lastPage = data?.pages[data.pages.length - 1];

  return {
    events,
    isInitialLoading: query.isLoading,
    loadingMore: isFetchingNextPage,
    error: query.error,
    hasMore: Boolean(hasNextPage),
    total: lastPage?.meta.total ?? 0,
    loadMore,
    refetch: refresh,
  };
}

/** Total count of events in a range (reads pagination `meta.total`). */
export function useEventCount(
  range: DateRange,
  filters?: EventListFilters
): number | undefined {
  const { viewer } = useViewer();
  const { data } = useQuery({
    queryKey: queryKeys.events.count(viewer, range, filters),
    queryFn: ({ signal }) =>
      fetchEvents({ range, page: 1, filters, signal }),
    select: (res) => res.meta.total,
  });
  return data;
}

/** Convenience for callers that still pass a fetcher-shaped callback. */
export function eventsFetcherFromOpts(
  extra?: Partial<FetchEventsOpts>
): EventsFetcher {
  return (range, page, signal, filters) =>
    fetchEvents({
      range,
      page,
      signal,
      filters,
      ...extra,
    });
}
