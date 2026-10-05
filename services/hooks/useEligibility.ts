import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  fetchEligibilityApproved,
  fetchEligibilityLatest,
  fetchEligibilityStatus,
} from "@/services/eligibility";
import { toQueryState, useViewer } from "@/services/hooks/queryState";
import type { Eligibility } from "@/types/api";

/**
 * Eligibility is mutated from other screens (submit/discard/review), so these reads
 * are always considered stale and re-validated on mount.
 */
const ELIGIBILITY_STALE_TIME = 0;

/** Player's eligibility status summary (latest review status + counts). */
export function useEligibilityStatus(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.eligibility.status(viewer),
      queryFn: ({ signal }) => fetchEligibilityStatus(signal),
      enabled: enabled && isAuthed,
      staleTime: ELIGIBILITY_STALE_TIME,
    })
  );
}

/**
 * Latest eligibility record (any status); data is null when the player has none.
 * Pass `enabled=false` to skip the request entirely (avoids the backend's 404-when-none),
 * e.g. when a `/status` check already showed there is no pending record.
 */
export function useEligibilityLatest(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.eligibility.latest(viewer),
      queryFn: ({ signal }) => fetchEligibilityLatest(signal),
      enabled: enabled && isAuthed,
      staleTime: ELIGIBILITY_STALE_TIME,
    })
  );
}

/** Last approved eligibility; data is null when none. */
export function useEligibilityApproved(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.eligibility.approved(viewer),
      queryFn: ({ signal }) => fetchEligibilityApproved(signal),
      enabled: enabled && isAuthed,
      staleTime: ELIGIBILITY_STALE_TIME,
    })
  );
}

export type EligibilityGate = {
  loading: boolean;
  /** The approved record (carries `being_student`, which sets the entry fee). */
  approved: Eligibility | null;
  /** Registration is only allowed once an eligibility has been approved. */
  isApproved: boolean;
  /** Latest submission is still under review — registration stays locked. */
  isPending: boolean;
  /** The player never submitted an eligibility request. */
  isMissing: boolean;
};

/**
 * Registration gate: the backend rejects `POST /app/event-registrations` with 403
 * unless the player has an approved eligibility, so screens check this before
 * routing into the registration flow.
 *
 * Pass `enabled=false` for guests so no authed eligibility calls are made.
 */
export function useEligibilityGate(enabled = true): EligibilityGate {
  const { data: status, loading: statusLoading } = useEligibilityStatus(enabled);
  const { data: approved, loading: approvedLoading } =
    useEligibilityApproved(enabled);

  if (!enabled) {
    return {
      loading: false,
      approved: null,
      isApproved: false,
      isPending: false,
      isMissing: true,
    };
  }

  return {
    loading: statusLoading || approvedLoading,
    approved,
    isApproved: approved !== null,
    isPending: approved === null && status?.latest === "pending",
    isMissing: approved === null && !status?.latest,
  };
}
