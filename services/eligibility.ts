/**
 * Player eligibility data access (all authed).
 *
 *   GET   /app/my/eligibility/status
 *   GET   /app/my/eligibility/latest                 (404 → null)
 *   GET   /app/my/eligibility/approved               (404 → null)
 *   PATCH /app/my/eligibility/pending[?duplicate_id]
 *   POST  /app/my/eligibility/discard
 *   POST  /app/my/eligibility/pending/student-proof   (multipart `file`)
 *   DELETE /app/my/eligibility/pending/student-proof/{id}
 *   POST  /app/my/eligibility/pending/portrait-photo  (multipart `file`)
 *   DELETE /app/my/eligibility/pending/portrait-photo/{id}
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
  Eligibility,
  EligibilityStatus,
  PatchPendingBody,
} from "@/types/api";

// ---------- Reads ----------

export function fetchEligibilityStatus(
  signal?: AbortSignal
): Promise<EligibilityStatus> {
  return apiGetEnvelope<EligibilityStatus>("/app/my/eligibility/status", {
    signal,
  });
}

async function fetchOrNull(
  path: string,
  signal?: AbortSignal
): Promise<Eligibility | null> {
  try {
    return await apiGetEnvelope<Eligibility>(path, { signal });
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) return null;
    throw e;
  }
}

/** Latest eligibility of any status; null if the player has none. */
export function fetchEligibilityLatest(
  signal?: AbortSignal
): Promise<Eligibility | null> {
  return fetchOrNull("/app/my/eligibility/latest", signal);
}

/** Last approved eligibility; null if none. */
export function fetchEligibilityApproved(
  signal?: AbortSignal
): Promise<Eligibility | null> {
  return fetchOrNull("/app/my/eligibility/approved", signal);
}

// ---------- Mutations ----------

/** Create or update the pending eligibility record (201 create / 200 update). */
export function patchPending(
  body: PatchPendingBody,
  duplicateId?: number
): Promise<Eligibility> {
  return apiPatch<Eligibility>("/app/my/eligibility/pending", body, {
    query: { duplicate_id: duplicateId },
  });
}

/** Discard the current pending record (no-op if none). */
export function discardEligibility(): Promise<unknown> {
  return apiPost("/app/my/eligibility/discard", {});
}

// ---------- File uploads ----------

/** Eligibility uploads all use the `file` field. */
export function fileFromUri(
  uri: string,
  opts?: FileMeta
): Promise<FormData> {
  return formDataFromUri("file", uri, opts);
}

export async function uploadStudentProof(
  uri: string,
  opts?: { name?: string; type?: string }
): Promise<unknown> {
  return apiUpload(
    "/app/my/eligibility/pending/student-proof",
    await fileFromUri(uri, opts)
  );
}

export function deleteStudentProof(id: number): Promise<unknown> {
  return apiDelete(`/app/my/eligibility/pending/student-proof/${id}`);
}

export async function uploadPortraitPhoto(
  uri: string,
  opts?: { name?: string; type?: string }
): Promise<unknown> {
  return apiUpload(
    "/app/my/eligibility/pending/portrait-photo",
    await fileFromUri(uri, opts)
  );
}

export function deletePortraitPhoto(id: number): Promise<unknown> {
  return apiDelete(`/app/my/eligibility/pending/portrait-photo/${id}`);
}
