/**
 * Event history for the Account tab.
 * GET /app/my/event-history — auth required.
 */
import { apiGetPaginated } from "@/services/apiClient";
import type { EventHistoryItem, PaginatedResponse } from "@/types/api";

export function fetchEventHistory(
  page = 1,
  signal?: AbortSignal
): Promise<PaginatedResponse<EventHistoryItem>> {
  return apiGetPaginated<EventHistoryItem>("/app/my/event-history", {
    auth: true,
    signal,
    query: { page },
  });
}
