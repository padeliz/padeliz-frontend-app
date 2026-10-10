/**
 * Player level assessment data access (all authed).
 *
 *   GET   /app/my/level-assessment/status
 *   GET   /app/my/level-assessment/latest          (404 → null)
 *   GET   /app/my/level-assessment/current-level   (404 → null)
 *   GET   /app/my/level-assessment/pending         (404 → null)
 *   POST  /app/my/level-assessment/pending         (create or return existing)
 *   PATCH /app/my/level-assessment/pending         ({ custom_fields })
 *   POST  /app/my/level-assessment/pending/ready
 *   POST  /app/my/level-assessment/pending/reopen
 *   POST  /app/my/level-assessment/discard
 *   POST  /app/my/level-assessment/pending/profile-image   (multipart `image`)
 *   DELETE /app/my/level-assessment/pending/profile-image/{id}
 */
import {
  apiDelete,
  apiGetEnvelope,
  apiPatch,
  apiPost,
  apiUpload,
} from "@/services/apiClient";
import { ApiError } from "@/services/apiError";
import { formDataFromUri, type FileMeta } from "@/services/upload";
import type {
  LevelAssessmentStatus,
  PlayerLevel,
  PlayerLevelAssessment,
} from "@/types/api";

const BASE = "/app/my/level-assessment";

/** Custom field code → answer (select fields take an option id). */
export type CustomFieldsPayload = Record<string, unknown>;

async function getOrNull<T>(
  path: string,
  signal?: AbortSignal
): Promise<T | null> {
  try {
    return await apiGetEnvelope<T>(path, { signal });
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) return null;
    throw e;
  }
}

// ---------- Reads ----------

export function fetchLevelAssessmentStatus(
  signal?: AbortSignal
): Promise<LevelAssessmentStatus> {
  return apiGetEnvelope<LevelAssessmentStatus>(`${BASE}/status`, { signal });
}

/** Latest assessment of any status; null if the player has none. */
export function fetchLatestAssessment(
  signal?: AbortSignal
): Promise<PlayerLevelAssessment | null> {
  return getOrNull<PlayerLevelAssessment>(`${BASE}/latest`, signal);
}

/** The open (pending) assessment; null if none. */
export function fetchPendingAssessment(
  signal?: AbortSignal
): Promise<PlayerLevelAssessment | null> {
  return getOrNull<PlayerLevelAssessment>(`${BASE}/pending`, signal);
}

/** The player's current level (`player_levels`); null when they have none yet. */
export function fetchCurrentLevel(
  signal?: AbortSignal
): Promise<PlayerLevel | null> {
  return getOrNull<PlayerLevel>(`${BASE}/current-level`, signal);
}

// ---------- Mutations ----------

/** POST pending: creates the draft, or returns the existing one (optionally writing answers). */
export function createPendingAssessment(
  customFields?: CustomFieldsPayload
): Promise<PlayerLevelAssessment> {
  return apiPost<PlayerLevelAssessment>(
    `${BASE}/pending`,
    customFields ? { custom_fields: customFields } : {}
  );
}

/**
 * Assess / Update level assessment entry: always opens the existing pending record when
 * there is one, otherwise creates a new one.
 */
export async function openOrCreatePendingAssessment(): Promise<PlayerLevelAssessment> {
  const existing = await fetchPendingAssessment();
  if (existing) return existing;
  return createPendingAssessment();
}

/**
 * Wizard entry: load the latest assessment of any status. Creates a pending draft only
 * when the player has none yet.
 */
export async function loadLatestOrCreateAssessment(): Promise<PlayerLevelAssessment> {
  const latest = await fetchLatestAssessment();
  if (latest) return latest;
  return createPendingAssessment();
}

/** Write answers into the pending draft (rejected by the API once ready for review). */
export function patchPendingAssessment(
  customFields: CustomFieldsPayload
): Promise<PlayerLevelAssessment> {
  return apiPatch<PlayerLevelAssessment>(`${BASE}/pending`, {
    custom_fields: customFields,
  });
}

/** Lock the draft for review. Allowed even when no answers were given. */
export function markAssessmentReady(): Promise<PlayerLevelAssessment> {
  return apiPost<PlayerLevelAssessment>(`${BASE}/pending/ready`, {});
}

/** Pull a ready draft back out of the review queue so it can be edited again. */
export function reopenAssessment(): Promise<PlayerLevelAssessment> {
  return apiPost<PlayerLevelAssessment>(`${BASE}/pending/reopen`, {});
}

/** Discard the current pending record (no-op if none). */
export function discardAssessment(): Promise<unknown> {
  return apiPost(`${BASE}/discard`, {});
}

// ---------- Profile images (uploaded_via = app_level_assessment) ----------

export async function uploadAssessmentProfileImage(
  uri: string,
  opts?: FileMeta
): Promise<PlayerLevelAssessment> {
  return apiUpload<PlayerLevelAssessment>(
    `${BASE}/pending/profile-image`,
    await formDataFromUri("image", uri, opts)
  );
}

export function deleteAssessmentProfileImage(
  id: number
): Promise<PlayerLevelAssessment> {
  return apiDelete<PlayerLevelAssessment>(`${BASE}/pending/profile-image/${id}`);
}
