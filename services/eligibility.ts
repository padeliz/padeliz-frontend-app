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
import { Platform } from "react-native";
import {
  apiDelete,
  apiGetEnvelope,
  apiPatch,
  apiPost,
  apiUpload,
} from "@/services/apiClient";
import { ApiError } from "@/services/apiError";
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

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};

/**
 * Build a multipart body from a local file URI. On web, FormData does not accept a
 * `{uri,name,type}` object (it serializes to "[object Object]"), so we fetch the URI
 * into a real Blob. On native, React Native's FormData expects the `{uri,name,type}`
 * file shape. `name`/`type` from the image picker are preferred when provided.
 */
export async function fileFromUri(
  uri: string,
  opts?: { name?: string; type?: string }
): Promise<FormData> {
  const inferredName = uri.split("/").pop()?.split("?")[0] || "upload.jpg";
  const name = opts?.name || inferredName;
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const type = opts?.type || MIME_BY_EXT[ext] || "image/jpeg";

  const form = new FormData();
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    form.append("file", blob, name);
  } else {
    form.append("file", { uri, name, type } as unknown as Blob);
  }
  return form;
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
