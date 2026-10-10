import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import { fetchLevels } from "@/services/levels";
import { toQueryState, useViewer } from "@/services/hooks/queryState";

/** Read-only level bands (names + numeric ranges). */
export function useLevels(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.levels.list(viewer),
      queryFn: ({ signal }) => fetchLevels(signal),
      enabled: enabled && isAuthed,
      staleTime: 5 * 60_000,
    })
  );
}
