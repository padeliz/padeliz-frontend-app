import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";
import {
  fetchIdentities,
  linkGoogleIdentity,
  unlinkIdentity,
} from "@/services/identities";
import { toQueryState, useViewer } from "@/services/hooks/queryState";
import type { LinkGoogleIdentityData, PlayerIdentity } from "@/types/api";

/** Linked identities for the current player (all providers). */
export function useIdentities(enabled = true) {
  const { viewer, isAuthed } = useViewer();
  return toQueryState(
    useQuery({
      queryKey: queryKeys.identities.list(viewer),
      queryFn: ({ signal }) => fetchIdentities(signal),
      enabled: enabled && isAuthed,
    })
  );
}

export function useLinkGoogleIdentityMutation() {
  const queryClient = useQueryClient();
  const { viewer } = useViewer();

  return useMutation({
    mutationFn: (idToken: string) => linkGoogleIdentity(idToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.identities.all(viewer),
      });
    },
  });
}

export function useUnlinkIdentityMutation() {
  const queryClient = useQueryClient();
  const { viewer } = useViewer();

  return useMutation({
    mutationFn: (idIdentity: number) => unlinkIdentity(idIdentity),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.identities.all(viewer),
      });
    },
  });
}

export type { PlayerIdentity, LinkGoogleIdentityData };
