/**
 * Account / modal CTA labels for level assessment and student proof.
 */
import type { PlayerLevelAssessment, PlayerStudentProof } from "@/types/api";

export function isAssessmentInReview(
  assessment: Pick<PlayerLevelAssessment, "review_status" | "ready_for_review"> | null | undefined
): boolean {
  return (
    assessment != null &&
    assessment.review_status === "pending" &&
    assessment.ready_for_review
  );
}

/** Prior assessment counts for “Again” (not a sole unsubmitted draft). */
export function hasPriorSubmittedOrTerminalAssessment(
  assessments: Array<
    Pick<PlayerLevelAssessment, "submitted_at" | "review_status">
  >
): boolean {
  return assessments.some(
    (a) =>
      a.submitted_at != null ||
      a.review_status === "approved" ||
      a.review_status === "rejected" ||
      a.review_status === "discarded"
  );
}

export type LevelAssessCta =
  | { kind: "see_pending"; label: "See your pending assessment" }
  | { kind: "again"; label: "Assess My Level Again" }
  | { kind: "first"; label: "Assess My Level" };

/**
 * Level modal CTA. Account assess button uses `includeSeePending: false`.
 */
export function levelAssessCta(
  options: {
    pendingOrLatest: PlayerLevelAssessment | null | undefined;
    assessmentsForHistory: Array<
      Pick<PlayerLevelAssessment, "submitted_at" | "review_status">
    >;
    /** When false, skip “See your pending…” (Account empty-state button). */
    includeSeePending?: boolean;
  }
): LevelAssessCta {
  const includeSeePending = options.includeSeePending !== false;
  if (includeSeePending && isAssessmentInReview(options.pendingOrLatest)) {
    return { kind: "see_pending", label: "See your pending assessment" };
  }
  if (hasPriorSubmittedOrTerminalAssessment(options.assessmentsForHistory)) {
    return { kind: "again", label: "Assess My Level Again" };
  }
  return { kind: "first", label: "Assess My Level" };
}

export function isProofInReview(
  proof: Pick<PlayerStudentProof, "review_status" | "ready_for_review"> | null | undefined
): boolean {
  return (
    proof != null &&
    proof.review_status === "pending" &&
    proof.ready_for_review
  );
}

export function hasPriorSubmittedProof(
  items: Array<Pick<PlayerStudentProof, "submitted_at">>
): boolean {
  return items.some((p) => p.submitted_at != null);
}

export type StudentProofCta =
  | { kind: "see_pending"; label: "See your pending proof" }
  | { kind: "new"; label: "Submit New Student Proof" }
  | { kind: "first"; label: "Submit Student Proof" };

export function studentProofCta(options: {
  pending: PlayerStudentProof | null | undefined;
  items: Array<Pick<PlayerStudentProof, "submitted_at">>;
}): StudentProofCta {
  if (isProofInReview(options.pending)) {
    return { kind: "see_pending", label: "See your pending proof" };
  }
  if (hasPriorSubmittedProof(options.items)) {
    return { kind: "new", label: "Submit New Student Proof" };
  }
  return { kind: "first", label: "Submit Student Proof" };
}

/** Lapsed approved proof used for Expired pill (newest first in `items`). */
export function findLapsedApprovedProof(
  items: PlayerStudentProof[],
  todayYmd: string
): PlayerStudentProof | null {
  for (const item of items) {
    if (item.review_status !== "approved" || item.student_until == null) continue;
    if (item.student_until < todayYmd) return item;
  }
  return null;
}

export function findActiveProof(
  items: PlayerStudentProof[],
  todayYmd: string
): PlayerStudentProof | null {
  for (const item of items) {
    if (item.review_status !== "approved" || item.student_until == null) continue;
    if (item.student_until >= todayYmd) return item;
  }
  return null;
}
