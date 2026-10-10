import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  createPendingAssessment,
  deleteAssessmentProfileImage,
  discardAssessment,
  fetchCurrentLevel,
  fetchLatestAssessment,
  fetchLevelAssessmentStatus,
  loadLatestOrCreateAssessment,
  markAssessmentReady,
  openOrCreatePendingAssessment,
  patchPendingAssessment,
  reopenAssessment,
  uploadAssessmentProfileImage,
  type CustomFieldsPayload,
} from "@/services/levelAssessment";
import { toQueryState, useViewer } from "@/services/hooks/queryState";
import type { PlayerLevelAssessment } from "@/types/api";

/**
 * Assessments are mutated from several screens (submit / reopen / discard) and by the
 * review team, so these reads are always considered stale and re-validated on mount.
 */
const ASSESSMENT_STALE_TIME = 0;

/** Latest review status summary + counts. */
export function useLevelAssessmentStatus(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.levelAssessment.status(viewer),
      queryFn: ({ signal }) => fetchLevelAssessmentStatus(signal),
      enabled: enabled && isAuthed,
      staleTime: ASSESSMENT_STALE_TIME,
    })
  );
}

/** Latest assessment of any status; data is null when the player has none. */
export function useLatestAssessment(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.levelAssessment.latest(viewer),
      queryFn: ({ signal }) => fetchLatestAssessment(signal),
      enabled: enabled && isAuthed,
      staleTime: ASSESSMENT_STALE_TIME,
    })
  );
}

/**
 * The player's current level (`player_levels`); data is null when they have none yet.
 * Drives the event CTA (Assess my level vs Register), the Account band and the
 * registration gate. A pending re-assessment never hides an existing level.
 */
export function useCurrentLevel(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.levelAssessment.currentLevel(viewer),
      queryFn: ({ signal }) => fetchCurrentLevel(signal),
      enabled: enabled && isAuthed,
      staleTime: ASSESSMENT_STALE_TIME,
    })
  );
}

function useInvalidateAssessment() {
  const queryClient = useQueryClient();
  const { viewer } = useViewer();
  return () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.levelAssessment.all(viewer),
    });
}

/** Open the existing pending assessment, or create one (Assess / Update level assessment). */
export function useOpenAssessmentMutation() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: () => openOrCreatePendingAssessment(),
    onSuccess: () => void invalidate(),
  });
}

/** Wizard load: GET latest, or POST pending when the player has no assessment yet. */
export function useLoadAssessmentMutation() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: () => loadLatestOrCreateAssessment(),
    onSuccess: () => void invalidate(),
  });
}

export function useCreatePendingAssessmentMutation() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: (customFields?: CustomFieldsPayload) =>
      createPendingAssessment(customFields),
    onSuccess: () => void invalidate(),
  });
}

export function useSaveAssessmentMutation() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: (customFields: CustomFieldsPayload) =>
      patchPendingAssessment(customFields),
    onSuccess: () => void invalidate(),
  });
}

export function useMarkAssessmentReadyMutation() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: () => markAssessmentReady(),
    onSuccess: () => void invalidate(),
  });
}

export function useReopenAssessmentMutation() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: () => reopenAssessment(),
    onSuccess: () => void invalidate(),
  });
}

export function useDiscardAssessmentMutation() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: () => discardAssessment(),
    onSuccess: () => void invalidate(),
  });
}

export function useUploadAssessmentImageMutation() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: (uri: string) => uploadAssessmentProfileImage(uri),
    onSuccess: () => void invalidate(),
  });
}

export function useDeleteAssessmentImageMutation() {
  const invalidate = useInvalidateAssessment();
  return useMutation({
    mutationFn: (id: number) => deleteAssessmentProfileImage(id),
    onSuccess: () => void invalidate(),
  });
}

export type { PlayerLevelAssessment };
