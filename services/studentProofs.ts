/**
 * Student proof data access (all authed). One pending proof per player, holding 1-3 files.
 *
 *   GET    /app/my/student-proofs
 *   GET    /app/my/student-proofs/pending           (404 → null)
 *   POST   /app/my/student-proofs                   multipart `student_until` + `files[]` (1-3)
 *   PATCH  /app/my/student-proofs/pending           `student_until` only
 *   POST   /app/my/student-proofs/pending/files     multipart `file` (append one, max 3)
 *   DELETE /app/my/student-proofs/pending/files/{id}
 *   POST   /app/my/student-proofs/pending/ready     (needs >=1 file)
 *   POST /app/my/student-proofs/pending/reopen
 *   POST /app/my/student-proofs/discard
 */
import {
  apiDelete,
  apiGetEnvelope,
  apiPatch,
  apiPost,
  apiUpload,
} from "@/services/apiClient";
import { ApiError } from "@/services/apiError";
import {
  appendFileFromUri,
  formDataFromUri,
  type FileMeta,
} from "@/services/upload";
import type { PlayerStudentProof, StudentProofsIndex } from "@/types/api";

const BASE = "/app/my/student-proofs";

export function fetchStudentProofs(
  signal?: AbortSignal
): Promise<StudentProofsIndex> {
  return apiGetEnvelope<StudentProofsIndex>(BASE, { signal });
}

export async function fetchPendingStudentProof(
  signal?: AbortSignal
): Promise<PlayerStudentProof | null> {
  try {
    return await apiGetEnvelope<PlayerStudentProof>(`${BASE}/pending`, {
      signal,
    });
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) return null;
    throw e;
  }
}

/** Max files a single proof may hold (mirrors the backend limit). */
export const MAX_STUDENT_PROOF_FILES = 3;

export type StudentProofFileInput = { uri: string; meta?: FileMeta };

export type CreateStudentProofInput = {
  /** 1-3 local files. */
  files: StudentProofFileInput[];
  /** "YYYY-MM-DD". */
  studentUntil: string;
};

/** Create the pending proof: multipart `student_until` + `files[]` (1-3). */
export async function createStudentProof(
  input: CreateStudentProofInput
): Promise<PlayerStudentProof> {
  const form = new FormData();
  form.append("student_until", input.studentUntil);
  for (const file of input.files) {
    await appendFileFromUri(form, "files[]", file.uri, file.meta);
  }
  return apiUpload<PlayerStudentProof>(BASE, form);
}

/** Update the pending proof's validity date only. */
export function updateStudentProofDate(
  studentUntil: string
): Promise<PlayerStudentProof> {
  return apiPatch<PlayerStudentProof>(`${BASE}/pending`, {
    student_until: studentUntil,
  });
}

/** Append one file to the pending proof. */
export async function addStudentProofFile(
  file: StudentProofFileInput
): Promise<PlayerStudentProof> {
  const form = await formDataFromUri("file", file.uri, file.meta);
  return apiUpload<PlayerStudentProof>(`${BASE}/pending/files`, form);
}

/** Remove one file from the pending proof. */
export function removeStudentProofFile(
  fileId: number
): Promise<PlayerStudentProof> {
  return apiDelete<PlayerStudentProof>(`${BASE}/pending/files/${fileId}`);
}

export function markStudentProofReady(): Promise<PlayerStudentProof> {
  return apiPost<PlayerStudentProof>(`${BASE}/pending/ready`, {});
}

export function reopenStudentProof(): Promise<PlayerStudentProof> {
  return apiPost<PlayerStudentProof>(`${BASE}/pending/reopen`, {});
}

export function discardStudentProof(): Promise<unknown> {
  return apiPost(`${BASE}/discard`, {});
}

/** "YYYY-MM-DD" must be a real calendar date that is not in the past. */
export function studentUntilError(raw: string, now: Date = new Date()): string | null {
  const value = raw.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Use the format YYYY-MM-DD.";
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return "Enter a valid date.";
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date.getTime() < today.getTime()) return "The date cannot be in the past.";
  return null;
}
