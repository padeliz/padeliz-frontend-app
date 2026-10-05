/**
 * Linked auth identities (GET list, link Google, unlink).
 */
import { apiDelete, apiGetEnvelope, apiPost } from "@/services/apiClient";
import type { LinkGoogleIdentityData, PlayerIdentity } from "@/types/api";

export function fetchIdentities(signal?: AbortSignal): Promise<PlayerIdentity[]> {
  return apiGetEnvelope<PlayerIdentity[]>("/app/auth/identities", { signal });
}

export function linkGoogleIdentity(idToken: string): Promise<LinkGoogleIdentityData> {
  return apiPost<LinkGoogleIdentityData>("/app/auth/identities/google", {
    id_token: idToken,
  });
}

export function unlinkIdentity(idIdentity: number): Promise<null> {
  return apiDelete<null>(`/app/auth/identities/${idIdentity}`);
}
