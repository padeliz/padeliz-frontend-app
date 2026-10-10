import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { queryKeys } from "@/lib/queryClient";
import { fetchDiscoverySummary } from "@/services/discovery";
import { discoveryNeeded, type LevelFlowTarget } from "@/services/discoveryGate";
import { useViewer } from "@/services/hooks/queryState";
import { discoveryPath, levelTargetPath } from "@/utils/eventPaths";

/**
 * Entry point for "Assess my level" / "Update level assessment" / "Register".
 *
 * Discovery is shown first when media is empty OR (Friends selected AND friends empty);
 * after it is submitted the Discovery screen continues to the same target. Otherwise
 * the player goes straight to the target.
 */
export function useLevelFlow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { viewer } = useViewer();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  /** Bumped by every start/cancel so a superseded request never navigates. */
  const runRef = useRef(0);

  /** Abort the in-flight start (if any): it will not navigate when the API resolves. */
  const cancel = useCallback(() => {
    runRef.current += 1;
    setStarting(false);
    setError(null);
  }, []);

  /** Resolves true when it navigated, false when it failed or was cancelled. */
  const start = useCallback(
    async (target: LevelFlowTarget, eventId?: number | null): Promise<boolean> => {
      const run = ++runRef.current;
      setStarting(true);
      setError(null);
      try {
        const summary = await queryClient.fetchQuery({
          queryKey: queryKeys.discovery.summary(viewer),
          queryFn: ({ signal }) => fetchDiscoverySummary(signal),
          staleTime: 0,
        });
        if (run !== runRef.current) return false;
        const route = discoveryNeeded(summary)
          ? discoveryPath(target, eventId)
          : levelTargetPath(target, eventId);
        router.push(route as any);
        return true;
      } catch (e) {
        if (run === runRef.current) {
          setError(e instanceof Error ? e : new Error("Could not continue."));
        }
        return false;
      } finally {
        if (run === runRef.current) setStarting(false);
      }
    },
    [queryClient, router, viewer]
  );

  return { start, cancel, starting, error };
}
