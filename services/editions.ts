/**
 * Editions data access.
 *
 * GET /app/editions          — public list (no auth)
 * GET /app/my/editions       — player's editions (auth)
 *
 * Both require `date_from`/`date_to`. There is no single-edition (`show`) endpoint,
 * so every fetched edition is stashed in `editionCache` (keyed by id_edition) for the
 * Event Details screen to read.
 */
import { apiGetPaginated } from "@/services/apiClient";
import type { Edition, PaginatedResponse } from "@/types/api";
import { defaultListRange, type DateRange } from "@/services/dateRange";

/** In-memory cache of editions seen via any list fetch. */
export const editionCache = new Map<number, Edition>();

function cacheEditions(editions: Edition[]): void {
  for (const e of editions) {
    if (typeof e?.id_edition === "number") editionCache.set(e.id_edition, e);
  }
}

export function getCachedEdition(id: number): Edition | undefined {
  return editionCache.get(id);
}

/** Seed the cache with editions obtained elsewhere (e.g. embedded in an eligibility
 * response) so Event Details can resolve them instantly. */
export function primeEditionCache(editions: Edition[]): void {
  cacheEditions(editions);
}

async function fetchList(
  path: string,
  range: DateRange,
  page: number | undefined,
  auth: boolean,
  signal?: AbortSignal
): Promise<PaginatedResponse<Edition>> {
  const res = await apiGetPaginated<Edition>(path, {
    auth,
    signal,
    query: {
      date_from: range.date_from,
      date_to: range.date_to,
      page,
    },
  });
  cacheEditions(res.data);
  return res;
}

export function fetchEditions(
  range: DateRange,
  page?: number,
  signal?: AbortSignal
): Promise<PaginatedResponse<Edition>> {
  return fetchList("/app/editions", range, page, false, signal);
}

export function fetchMyEditions(
  range: DateRange,
  page?: number,
  signal?: AbortSignal
): Promise<PaginatedResponse<Edition>> {
  return fetchList("/app/my/editions", range, page, true, signal);
}

const MAX_LOOKUP_PAGES = 25;

/**
 * Resolve a single edition by id. There is no `show` endpoint, so this returns the
 * cached edition if present (the common case: navigated from a list), otherwise pages
 * through the public editions list (which caches as it goes) until found.
 */
export async function ensureEditionLoaded(
  id: number,
  signal?: AbortSignal
): Promise<Edition | null> {
  const cached = getCachedEdition(id);
  if (cached) return cached;

  const range = defaultListRange();
  let page = 1;
  let lastPage = 1;
  do {
    const res = await fetchEditions(range, page, signal);
    lastPage = res.meta.last_page;
    const found = getCachedEdition(id);
    if (found) return found;
    page += 1;
  } while (page <= lastPage && page <= MAX_LOOKUP_PAGES);

  return null;
}

