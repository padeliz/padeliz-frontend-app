/**
 * Event registration + checkout payment data access (all authed).
 *
 *   GET    /app/my/event-registrations[?event_id]
 *   POST   /app/event-registrations
 *            { event_id, event_division_ids?: (number|null)[] }
 *            or legacy { event_id, event_division_id? }
 *   DELETE /app/event-registrations/{id}                         { cancel_reason }
 *   GET    /app/events/{event}/registration-checkouts
 *   GET    /app/registration-checkouts/{id}
 *   GET    /app/registration-checkouts/{id}/quote
 *   PATCH  /app/registration-checkouts/{id}/benefit-selections
 *   POST   /app/registration-checkouts/{id}/payments/netopia/start
 *   POST   /app/registration-checkouts/{id}/payments/bank-proofs   (multipart `proof`)
 *   POST   /app/registration-checkouts/{id}/payments/reset
 *   POST   /app/registration-checkouts/{id}/exclude                { registration_ids, cancel_reason }
 *   GET    /app/bank-transfer-settings[?checkout_id|&registration_id]
 *   Legacy registration-scoped payment endpoints still resolve the open checkout.
 *   POST   /app/device-tokens                                      { token, platform? }
 *   DELETE /app/device-tokens                                      { token }
 */
import {
  apiDelete,
  apiGetEnvelope,
  apiPatch,
  apiPost,
  apiUpload,
} from "@/services/apiClient";
import { ApiError } from "@/services/apiError";
import { formDataFromUri, type FileMeta } from "@/services/upload";
import type {
  BankProofUploadData,
  BankTransferSettings,
  BenefitSelectionsBody,
  CheckoutMutationData,
  CheckoutQuoteData,
  CreateRegistrationBody,
  CreateRegistrationsCheckoutData,
  DeviceTokenData,
  Event,
  EventRegistration,
  EventRegistrationCheckout,
  NetopiaStartData,
  RegistrationCancelReason,
} from "@/types/api";

/** Reasons a player may give when self-cancelling (mirrors the backend enum). */
export const CANCEL_REASONS: {
  value: RegistrationCancelReason;
  label: string;
}[] = [
  { value: "change_of_plans", label: "Change of plans" },
  { value: "schedule_conflict", label: "Schedule conflict" },
  { value: "injury_or_illness", label: "Injury or illness" },
  { value: "travel_issue", label: "Travel issue" },
  { value: "personal_reasons", label: "Personal reasons" },
  { value: "other", label: "Other" },
];

// ---------- Reads ----------

/** The player's registrations, newest first; optionally scoped to one event. */
export function fetchMyRegistrations(
  eventId?: number,
  signal?: AbortSignal
): Promise<EventRegistration[]> {
  return apiGetEnvelope<EventRegistration[]>(
    "/app/my/event-registrations",
    { query: { event_id: eventId }, signal }
  );
}

export type BankTransferSettingsQuery = {
  checkoutId?: number | null;
  registrationId?: number | null;
};

/**
 * Bank transfer details for the manual payment step. Returns null when the manager
 * has not configured them yet (the endpoint 404s in that case). Prefer `checkout_id`
 * so the payment reference resolves against the checkout group.
 */
export async function fetchBankTransferSettings(
  query?: number | BankTransferSettingsQuery,
  signal?: AbortSignal
): Promise<BankTransferSettings | null> {
  const opts: BankTransferSettingsQuery =
    typeof query === "number"
      ? { registrationId: query }
      : (query ?? {});

  try {
    return await apiGetEnvelope<BankTransferSettings>(
      "/app/bank-transfer-settings",
      {
        query: {
          checkout_id: opts.checkoutId ?? undefined,
          registration_id: opts.registrationId ?? undefined,
        },
        signal,
      }
    );
  } catch (e) {
    if (e instanceof ApiError && e.isNotFound) return null;
    throw e;
  }
}

// ---------- Mutations ----------

/**
 * Create registration(s). With `event_division_ids`, returns `{ registrations, checkout }`.
 * Legacy single `event_division_id` returns one `EventRegistration` (with `checkout_id`).
 */
export function createRegistration(
  body: CreateRegistrationBody
): Promise<EventRegistration | CreateRegistrationsCheckoutData> {
  return apiPost<EventRegistration | CreateRegistrationsCheckoutData>(
    "/app/event-registrations",
    body
  );
}

/** Multi-division create; always sends `event_division_ids`. */
export function createRegistrations(
  eventId: number,
  eventDivisionIds: Array<number | null>
): Promise<CreateRegistrationsCheckoutData> {
  return apiPost<CreateRegistrationsCheckoutData>("/app/event-registrations", {
    event_id: eventId,
    event_division_ids: eventDivisionIds,
  });
}

/** Cancel own registration; allowed only before `event.cancellation_allowed_until`. */
export function cancelRegistration(
  registrationId: number,
  cancelReason: RegistrationCancelReason
): Promise<EventRegistration> {
  return apiDelete<EventRegistration>(
    `/app/event-registrations/${registrationId}`,
    { cancel_reason: cancelReason }
  );
}

/** Open a Netopia payment attempt for a checkout group. */
export function startNetopiaPaymentForCheckout(
  checkoutId: number
): Promise<NetopiaStartData> {
  return apiPost<NetopiaStartData>(
    `/app/registration-checkouts/${checkoutId}/payments/netopia/start`,
    {}
  );
}

/**
 * Open a Netopia payment attempt. Prefer checkout-scoped when `checkoutId` is known;
 * legacy registration-scoped still resolves the open checkout on the backend.
 */
export function startNetopiaPayment(
  registrationOrCheckoutId: number,
  opts?: { checkoutId?: number | null }
): Promise<NetopiaStartData> {
  const checkoutId = opts?.checkoutId;
  if (checkoutId != null) {
    return startNetopiaPaymentForCheckout(checkoutId);
  }
  return apiPost<NetopiaStartData>(
    `/app/event-registrations/${registrationOrCheckoutId}/payments/netopia/start`,
    {}
  );
}

/** Upload a bank transfer receipt against a checkout group. */
export async function uploadBankProofForCheckout(
  checkoutId: number,
  uri: string,
  opts?: FileMeta
): Promise<BankProofUploadData> {
  return apiUpload<BankProofUploadData>(
    `/app/registration-checkouts/${checkoutId}/payments/bank-proofs`,
    await formDataFromUri("proof", uri, opts)
  );
}

/** Upload a bank transfer receipt; prefer checkout-scoped when known. */
export async function uploadBankProof(
  registrationOrCheckoutId: number,
  uri: string,
  opts?: FileMeta & { checkoutId?: number | null }
): Promise<BankProofUploadData> {
  const { checkoutId, ...fileMeta } = opts ?? {};
  if (checkoutId != null) {
    return uploadBankProofForCheckout(checkoutId, uri, fileMeta);
  }
  return apiUpload<BankProofUploadData>(
    `/app/event-registrations/${registrationOrCheckoutId}/payments/bank-proofs`,
    await formDataFromUri("proof", uri, fileMeta)
  );
}

/** Pricing quote for an open checkout (eligible benefits + referrer candidates). */
export function fetchCheckoutQuote(
  checkoutId: number,
  signal?: AbortSignal
): Promise<CheckoutQuoteData> {
  return apiGetEnvelope<CheckoutQuoteData>(
    `/app/registration-checkouts/${checkoutId}/quote`,
    { signal }
  );
}

/** Commit optional benefit selections (and referrer when 2+ candidates). */
export function commitBenefitSelections(
  checkoutId: number,
  body: BenefitSelectionsBody
): Promise<EventRegistrationCheckout> {
  return apiPatch<EventRegistrationCheckout>(
    `/app/registration-checkouts/${checkoutId}/benefit-selections`,
    body
  );
}

/** Reset payment path on an open checkout (unpaid payable, clear method, reject proofs). */
export function resetCheckoutPayment(
  checkoutId: number
): Promise<CheckoutMutationData> {
  return apiPost<CheckoutMutationData>(
    `/app/registration-checkouts/${checkoutId}/payments/reset`,
    {}
  );
}

/**
 * Exclude (cancel) selected registrations from an open checkout, then reset remaining
 * payable actives on the same checkout.
 */
export function excludeFromCheckout(
  checkoutId: number,
  registrationIds: number[],
  cancelReason: RegistrationCancelReason
): Promise<CheckoutMutationData> {
  return apiPost<CheckoutMutationData>(
    `/app/registration-checkouts/${checkoutId}/exclude`,
    { registration_ids: registrationIds, cancel_reason: cancelReason }
  );
}

/** All checkouts for the current player on an event (newest first). */
export function fetchEventCheckouts(
  eventId: number
): Promise<{ checkouts: EventRegistrationCheckout[] }> {
  return apiGetEnvelope<{ checkouts: EventRegistrationCheckout[] }>(
    `/app/events/${eventId}/registration-checkouts`
  );
}

// ---------- Push device tokens ----------

export function registerDeviceToken(
  token: string,
  platform?: string
): Promise<DeviceTokenData> {
  return apiPost<DeviceTokenData>("/app/device-tokens", { token, platform });
}

export function unregisterDeviceToken(token: string): Promise<unknown> {
  return apiDelete("/app/device-tokens", { token });
}

// ---------- Derived helpers ----------

/** All live registrations (cancelled/declined ignored). */
export function activeRegistrations(
  registrations: EventRegistration[] | null | undefined
): EventRegistration[] {
  return (registrations ?? []).filter((r) => r.lifecycle_status === "active");
}

/** The single live registration for an event, if any (cancelled/declined ignored). */
export function activeRegistration(
  registrations: EventRegistration[] | null | undefined
): EventRegistration | null {
  return activeRegistrations(registrations)[0] ?? null;
}

/** Active unpaid regs that still owe money (payable checkout lines). */
export function payableRegistrations(
  registrations: EventRegistration[] | null | undefined
): EventRegistration[] {
  return activeRegistrations(registrations).filter(
    (r) => r.payment_status === "unpaid" && Number(r.amount_due) > 0
  );
}

/** Active regs awaiting bank-proof review. */
export function awaitingProofRegistrations(
  registrations: EventRegistration[] | null | undefined
): EventRegistration[] {
  return activeRegistrations(registrations).filter(
    (r) => r.payment_status === "awaiting_proof_review"
  );
}

/** Shared open checkout id across active regs, if any. */
export function openCheckoutId(
  registrations: EventRegistration[] | null | undefined
): number | null {
  for (const r of activeRegistrations(registrations)) {
    if (
      (r.payment_status === "unpaid" ||
        r.payment_status === "awaiting_proof_review") &&
      r.checkout_id != null
    ) {
      return r.checkout_id;
    }
  }
  return null;
}

/** True while the event still allows player self-cancel for at least one active reg. */
export function canSelfCancel(
  event: Event | null | undefined,
  registration:
    | EventRegistration
    | EventRegistration[]
    | null
    | undefined,
  now: number = Date.now()
): boolean {
  const regs = Array.isArray(registration)
    ? registration
    : registration
      ? [registration]
      : [];
  if (!regs.some((r) => r.lifecycle_status === "active")) return false;
  const until = event?.cancellation_allowed_until;
  if (until === null || until === undefined) return false;
  return now < until * 1000;
}

/** Human label for a registration's division (or Event-wide). */
export function registrationDivisionLabel(
  registration: EventRegistration,
  event?: Event | null
): string {
  if (registration.event_division_id == null) return "Event-wide";
  const embedded =
    registration.event_division?.division_title ||
    registration.event_division?.division?.name;
  if (embedded) return embedded;
  const fromEvent = event?.event_divisions?.find(
    (d) => d.id_event_division === registration.event_division_id
  );
  return (
    fromEvent?.division_title ||
    fromEvent?.division?.name ||
    `Division ${registration.event_division_id}`
  );
}

/** Shared payment method across active regs (first non-null). */
export function sharedPaymentMethod(
  registrations: EventRegistration[] | null | undefined
): EventRegistration["payment_method"] {
  for (const r of activeRegistrations(registrations)) {
    if (r.payment_method) return r.payment_method;
  }
  return null;
}

export function isCreateRegistrationsCheckoutData(
  value: EventRegistration | CreateRegistrationsCheckoutData | EventRegistrationCheckout
): value is CreateRegistrationsCheckoutData {
  return (
    typeof value === "object" &&
    value !== null &&
    "registrations" in value &&
    "checkout" in value &&
    Array.isArray((value as CreateRegistrationsCheckoutData).registrations)
  );
}
