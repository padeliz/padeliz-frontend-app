import { useCallback, useEffect, useState } from "react";
import { useAsync } from "@/services/hooks/useAsync";
import {
  ensureEditionLoaded,
  fetchEditions,
  fetchMyEditions,
} from "@/services/editions";
import type { DateRange } from "@/services/dateRange";
import type { Edition, PaginatedResponse } from "@/types/api";

/** Resolve a single edition by id (from cache, falling back to the list endpoint). */
export function useEdition(id: number) {
  return useAsync((signal) => ensureEditionLoaded(id, signal), [id]);
}

/** Public editions list for the given date range / page. */
export function useEditions(range: DateRange, page = 1) {
  return useAsync((signal) => fetchEditions(range, page, signal), [
    range.date_from,
    range.date_to,
    page,
  ]);
}

/** The authenticated player's editions for the given date range / page. */
export function useMyEditions(range: DateRange, page = 1) {
  return useAsync((signal) => fetchMyEditions(range, page, signal), [
    range.date_from,
    range.date_to,
    page,
  ]);
}

export type EditionsFetcher = (
  range: DateRange,
  page: number,
  signal?: AbortSignal
) => Promise<PaginatedResponse<Edition>>;

function mergeById(prev: Edition[], next: Edition[]): Edition[] {
  const seen = new Set(prev.map((e) => e.id_edition));
  return [...prev, ...next.filter((e) => !seen.has(e.id_edition))];
}

export type EditionsPager = {
  editions: Edition[];
  /** True only on the first page load (nothing rendered yet). */
  isInitialLoading: boolean;
  /** True while a "load more" page is being fetched. */
  loadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
};

/**
 * Pages through an editions endpoint, accumulating results across pages.
 * Pass `fetchEditions` (public) or `fetchMyEditions` (authed).
 */
export function useEditionsPager(fetcher: EditionsFetcher, range: DateRange): EditionsPager {
  const rangeKey = `${range.date_from}|${range.date_to}`;
  const [page, setPage] = useState(1);
  const [editions, setEditions] = useState<Edition[]>([]);

  // When the range (tab) changes, reset paging + accumulated list. useAsync below
  // aborts the in-flight request on dep change, so the brief race is harmless.
  useEffect(() => {
    setPage(1);
    setEditions([]);
  }, [rangeKey]);

  const { data, loading, error, refetch } = useAsync(
    (signal) => fetcher(range, page, signal),
    [rangeKey, page]
  );

  // Accumulate based on the response's own page number to avoid double-merging
  // a stale page while the next page is in flight.
  useEffect(() => {
    if (!data) return;
    const current = data.meta.current_page;
    setEditions((prev) => (current <= 1 ? data.data : mergeById(prev, data.data)));
  }, [data]);

  const hasMore = data ? data.meta.current_page < data.meta.last_page : false;

  const loadMore = useCallback(() => {
    if (!loading && hasMore) setPage((p) => p + 1);
  }, [loading, hasMore]);

  return {
    editions,
    isInitialLoading: loading && editions.length === 0,
    loadingMore: loading && editions.length > 0,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}

/** Total count of editions in a range (reads pagination `meta.total`); for tab badges. */
export function useEditionCount(
  fetcher: EditionsFetcher,
  range: DateRange
): number | undefined {
  const { data } = useAsync(
    (signal) => fetcher(range, 1, signal),
    [range.date_from, range.date_to]
  );
  return data?.meta.total;
}
