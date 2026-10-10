/** Read-only level bands: GET /app/levels (strongest first per the API order). */
import { apiGetEnvelope } from "@/services/apiClient";
import type { Level } from "@/types/api";

export function fetchLevels(signal?: AbortSignal): Promise<Level[]> {
  return apiGetEnvelope<Level[]>("/app/levels", { signal });
}
