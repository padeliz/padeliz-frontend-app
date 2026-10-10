import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  fetchDiscoverySummary,
  fetchMediaSources,
  fetchSuggestedFriends,
  replaceFriends,
  replaceMedia,
  SEARCH_MIN_LENGTH,
  searchPlayers,
} from "@/services/discovery";
import { toQueryState, useViewer } from "@/services/hooks/queryState";
import type { FriendInput } from "@/types/api";

/** Discovery is edited from its own screen, so always re-validate on mount. */
const DISCOVERY_STALE_TIME = 0;

export function useDiscoverySummary(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.discovery.summary(viewer),
      queryFn: ({ signal }) => fetchDiscoverySummary(signal),
      enabled: enabled && isAuthed,
      staleTime: DISCOVERY_STALE_TIME,
    })
  );
}

export function useMediaSources(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.discovery.mediaSources(viewer),
      queryFn: ({ signal }) => fetchMediaSources(signal),
      enabled: enabled && isAuthed,
    })
  );
}

export function useSuggestedFriends(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.discovery.suggestFriends(viewer),
      queryFn: ({ signal }) => fetchSuggestedFriends(signal),
      enabled: enabled && isAuthed,
    })
  );
}

const SEARCH_DEBOUNCE_MS = 300;

/** Debounced player search; idle until the trimmed query reaches the server minimum. */
export function usePlayerSearch(query: string, enabled = true) {
  const { viewer, isAuthed } = useViewer();
  const trimmed = query.trim();
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(trimmed), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed]);

  const ready = debounced.length >= SEARCH_MIN_LENGTH && trimmed === debounced;
  return toQueryState(
    useQuery({
      queryKey: queryKeys.discovery.searchPlayers(viewer, debounced),
      queryFn: ({ signal }) => searchPlayers(debounced, signal),
      enabled: enabled && isAuthed && ready,
    })
  );
}

export type SaveDiscoveryInput = {
  mediaSourceIds: number[];
  /** Pass `null` to leave the friends list untouched (Friends source not selected). */
  friends: FriendInput[] | null;
};

/** Persist the media selection, then (when asked) the friends list. */
export function useSaveDiscoveryMutation() {
  const queryClient = useQueryClient();
  const { viewer } = useViewer();
  return useMutation({
    mutationFn: async ({ mediaSourceIds, friends }: SaveDiscoveryInput) => {
      await replaceMedia(mediaSourceIds);
      if (friends !== null) await replaceFriends(friends);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.discovery.all(viewer),
      });
    },
  });
}
