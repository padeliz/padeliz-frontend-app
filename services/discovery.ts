/**
 * Discovery ("how did you hear about us") data access (all authed).
 *
 *   GET /app/my/discovery                   summary + what is still missing
 *   GET /app/my/discovery/media-sources     catalog
 *   PUT /app/my/discovery/media             { media_source_ids }
 *   PUT /app/my/discovery/friends           { friends: [...] } (max 3)
 *   GET /app/my/discovery/suggest-friends
 *   GET /app/my/discovery/search-players?q=
 */
import { apiGetEnvelope, request } from "@/services/apiClient";
import type {
  DiscoverySummary,
  FriendInput,
  FriendSuggestion,
  MediaSource,
  PlayerSearchResult,
} from "@/types/api";

const BASE = "/app/my/discovery";

export const MAX_FRIENDS = 3;
/** Shortest query the search endpoint accepts. */
export const SEARCH_MIN_LENGTH = 2;
/** Media source `code` that makes the Discovery UX ask for friends. */
export const FRIENDS_SOURCE_CODE = "friends";

export function fetchDiscoverySummary(
  signal?: AbortSignal
): Promise<DiscoverySummary> {
  return apiGetEnvelope<DiscoverySummary>(BASE, { signal });
}

export function fetchMediaSources(signal?: AbortSignal): Promise<MediaSource[]> {
  return apiGetEnvelope<MediaSource[]>(`${BASE}/media-sources`, { signal });
}

export function fetchSuggestedFriends(
  signal?: AbortSignal
): Promise<FriendSuggestion[]> {
  return apiGetEnvelope<FriendSuggestion[]>(`${BASE}/suggest-friends`, {
    signal,
  });
}

/** Players matching name / email / phone (server needs >= 2 chars, returns <= 20, never me). */
export function searchPlayers(
  q: string,
  signal?: AbortSignal
): Promise<PlayerSearchResult[]> {
  return apiGetEnvelope<PlayerSearchResult[]>(`${BASE}/search-players`, {
    query: { q: q.trim() },
    signal,
  });
}

/** Full replace; an empty array clears the selection. */
export async function replaceMedia(mediaSourceIds: number[]): Promise<unknown> {
  return request(`${BASE}/media`, {
    method: "PUT",
    body: { media_source_ids: mediaSourceIds },
  });
}

/** Full replace; an empty array clears the list. */
export async function replaceFriends(friends: FriendInput[]): Promise<unknown> {
  return request(`${BASE}/friends`, {
    method: "PUT",
    body: { friends },
  });
}
