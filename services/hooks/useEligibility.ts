import { useAsync } from "@/services/hooks/useAsync";
import {
  fetchEligibilityApproved,
  fetchEligibilityLatest,
  fetchEligibilityStatus,
} from "@/services/eligibility";

/** Player's eligibility status summary (latest review status + counts). */
export function useEligibilityStatus() {
  return useAsync((signal) => fetchEligibilityStatus(signal), []);
}

/**
 * Latest eligibility record (any status); data is null when the player has none.
 * Pass `enabled=false` to skip the request entirely (avoids the backend's 404-when-none),
 * e.g. when a `/status` check already showed there is no pending record.
 */
export function useEligibilityLatest(enabled = true) {
  return useAsync(
    (signal) => (enabled ? fetchEligibilityLatest(signal) : Promise.resolve(null)),
    [enabled]
  );
}

/** Last approved eligibility; data is null when none. */
export function useEligibilityApproved() {
  return useAsync((signal) => fetchEligibilityApproved(signal), []);
}
