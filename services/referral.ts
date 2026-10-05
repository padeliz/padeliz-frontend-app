/**
 * Referral codes + touchpoints (all authed).
 *
 *   POST /app/referral-touchpoints                     { event_id, code }
 *   GET  /app/events/{id}/referral-codes
 *   POST /app/events/{id}/referral-codes             { invitees: [{email?, phone?}] }
 *   POST /app/referral-codes/{id}/revoke
 */
import { apiGetEnvelope, apiPost } from "@/services/apiClient";
import { BASE_URL } from "@/utils/constants";
import { eventDetailPath } from "@/utils/eventPaths";
import type {
  ReferralCodeCreateData,
  ReferralCodeRevokeData,
  ReferralCodesIndexData,
  ReferralInviteeInput,
  ReferralTouchpoint,
} from "@/types/api";

export function recordReferralTouchpoint(
  eventId: number,
  code: string,
  clientMetadata?: Record<string, unknown>
): Promise<ReferralTouchpoint> {
  return apiPost<ReferralTouchpoint>("/app/referral-touchpoints", {
    event_id: eventId,
    code,
    client_metadata: clientMetadata,
  });
}

export function fetchReferralCodes(
  eventId: number,
  signal?: AbortSignal
): Promise<ReferralCodesIndexData> {
  return apiGetEnvelope<ReferralCodesIndexData>(
    `/app/events/${eventId}/referral-codes`,
    { signal }
  );
}

export function createReferralCode(
  eventId: number,
  invitees: ReferralInviteeInput[]
): Promise<ReferralCodeCreateData> {
  return apiPost<ReferralCodeCreateData>(
    `/app/events/${eventId}/referral-codes`,
    { invitees }
  );
}

export function revokeReferralCode(
  referralCodeId: number
): Promise<ReferralCodeRevokeData> {
  return apiPost<ReferralCodeRevokeData>(
    `/app/referral-codes/${referralCodeId}/revoke`,
    {}
  );
}

function normalizedBaseUrl(): string {
  const raw = (BASE_URL ?? "").trim().replace(/\/+$/, "");
  return raw || "https://app.padeliz.ro";
}

/** Public share URL for an event (opens web app / in-app detail). */
export function eventShareUrl(eventId: number, slug?: string | null): string {
  return `${normalizedBaseUrl()}${eventDetailPath(eventId, slug)}`;
}

/** Referral share URL: {BASE_URL}/event/{id}/{slug?}?ref=CODE */
export function referralShareUrl(
  eventId: number,
  code: string,
  slug?: string | null
): string {
  return `${eventShareUrl(eventId, slug)}?ref=${encodeURIComponent(code)}`;
}

/** @deprecated Prefer referralShareUrl (HTTPS via EXPO_PUBLIC_BASE_URL). */
export function referralDeeplink(eventId: number, code: string): string {
  return referralShareUrl(eventId, code);
}
