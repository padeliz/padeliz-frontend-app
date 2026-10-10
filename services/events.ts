/**
 * Events data access.
 *
 * GET /app/events              — public list (optional bearer) + filters
 * GET /app/events/{id}         — public show (optional bearer)
 * GET /app/events/filter-options — clubs / unpaid / lottery meta for a range
 */
import {
  apiGetEnvelope,
  apiGetPaginated,
} from "@/services/apiClient";
import type {
  Event,
  EventFilterOptions,
  PaginatedResponse,
} from "@/types/api";
import type { DateRange } from "@/services/dateRange";

/**
 * @deprecated React Query (`lib/queryClient.ts`) is the cache of record for events.
 * This map is no longer populated by the fetchers or read by the data hooks; it only
 * remains for callers that explicitly seed/read it via `primeEventCache`.
 */
export const eventCache = new Map<number, Event>();

function hasEventDivisions(e: Event): boolean {
  return Array.isArray(e.event_divisions);
}

function cacheEvents(events: Event[]): void {
  for (const e of events) {
    if (typeof e?.id_event !== "number") continue;
    const prev = eventCache.get(e.id_event);
    // Never downgrade a cached event that already has event_divisions (incl. [])
    // with an embed that omits the key entirely.
    if (prev && hasEventDivisions(prev) && !hasEventDivisions(e)) {
      eventCache.set(e.id_event, {
        ...e,
        event_divisions: prev.event_divisions,
      });
      continue;
    }
    eventCache.set(e.id_event, e);
  }
}

/** @deprecated Read events through `useEvent` / React Query instead. */
export function getCachedEvent(id: number): Event | undefined {
  return eventCache.get(id);
}

/** @deprecated Seed React Query (`queryClient.setQueryData`) instead. */
export function primeEventCache(events: Event[]): void {
  cacheEvents(events);
}

/** @deprecated Clear the QueryClient instead. */
export function clearEventCache(): void {
  eventCache.clear();
}

/** Ordering for GET /app/events (date, then arriving_time). */
export type EventListSort = "asc" | "desc";

/** Chip / membership filters + explicit sort for GET /app/events. */
export type EventListFilters = {
  /** Past tab → "desc"; Ongoing / Upcoming → "asc". */
  sort?: EventListSort;
  participated?: boolean;
  registered?: boolean;
  unpaid?: boolean;
  lottery_winner?: boolean;
  club_ids?: number[];
};

export type FetchEventsOpts = {
  range: DateRange;
  page?: number;
  filters?: EventListFilters;
  /** Attach bearer when available (default true). Guests still work without a token. */
  auth?: boolean;
  signal?: AbortSignal;
};

function filtersToQuery(
  filters?: EventListFilters
): Record<string, string | number | boolean | number[] | undefined | null> {
  if (!filters) return {};
  return {
    participated: filters.participated ? 1 : undefined,
    registered: filters.registered ? 1 : undefined,
    unpaid: filters.unpaid ? 1 : undefined,
    lottery_winner: filters.lottery_winner ? 1 : undefined,
    sort: filters.sort,
    "club_ids[]":
      filters.club_ids && filters.club_ids.length > 0
        ? filters.club_ids
        : undefined,
  };
}

export async function fetchEvents(
  opts: FetchEventsOpts
): Promise<PaginatedResponse<Event>>;
/** @deprecated Prefer the opts object form. */
export async function fetchEvents(
  range: DateRange,
  page?: number,
  signal?: AbortSignal
): Promise<PaginatedResponse<Event>>;
export async function fetchEvents(
  rangeOrOpts: DateRange | FetchEventsOpts,
  page?: number,
  signal?: AbortSignal
): Promise<PaginatedResponse<Event>> {
  const opts: FetchEventsOpts =
    "date_from" in rangeOrOpts
      ? { range: rangeOrOpts, page, signal, auth: true }
      : rangeOrOpts;

  const res = await apiGetPaginated<Event>("/app/events", {
    auth: opts.auth !== false,
    signal: opts.signal,
    query: {
      date_from: opts.range.date_from,
      date_to: opts.range.date_to,
      page: opts.page,
      ...filtersToQuery(opts.filters),
    },
  });
  return res;
}

/** GET /app/events/{id} — replaces list-paging lookup. */
export async function fetchEvent(
  id: number,
  signal?: AbortSignal
): Promise<Event> {
  return apiGetEnvelope<Event>(`/app/events/${id}`, {
    auth: true,
    signal,
  });
}

export async function fetchFilterOptions(
  range: DateRange,
  signal?: AbortSignal
): Promise<EventFilterOptions> {
  return apiGetEnvelope<EventFilterOptions>("/app/events/filter-options", {
    auth: true,
    signal,
    query: {
      date_from: range.date_from,
      date_to: range.date_to,
    },
  });
}
