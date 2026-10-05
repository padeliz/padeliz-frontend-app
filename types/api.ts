/**
 * TypeScript types mirroring the Laravel API (http://localhost:8000/api/v1).
 *
 * These describe the backend's wire shapes. UI-facing types live in
 * `types/types.ts`; mappers in `services/mappers.ts` translate between them.
 *
 * Conventions confirmed from the backend:
 * - Timestamps (inserted_at, updated_at, submitted_at, ...) are Unix epoch ints.
 * - Event `date` is a "YYYY-MM-DD" string; times are "HH:MM:SS" strings.
 * - Uploaded files are `{ id, url }` with absolute URLs.
 */

// ---------- Response envelopes ----------

/** Custom endpoints (auth, eligibility status/latest/approved/discard/pending). */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** List endpoints (events, my events) — Laravel pagination, no `success`. */
export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

/** 422 body shape. */
export interface ValidationErrorBody {
  success: false;
  message: string;
  errors: Record<string, string[]>;
}

// ---------- Domain resources ----------

export interface Club {
  id_club?: number;
  name?: string;
  [key: string]: unknown;
}

export interface Location {
  id_location: number;
  club_id: number;
  name: string;
  address: string;
  total_indoors_courts: number;
  total_outdoor_courts: number;
  inserted_at?: number;
  updated_at?: number;
  club?: Club;
}

export interface Division {
  id_division?: number;
  name?: string;
  color?: string | null;
  [key: string]: unknown;
}

export interface EventDivision {
  id_event_division: number;
  event_id: number;
  division_id: number;
  /** Per-event label, e.g. "Students Rookies"; falls back to `division.name`. */
  division_title?: string | null;
  players_limit: number;
  /** Entry fee in RON for this division (fees live on divisions, not events). */
  entry_fee: number;
  skill_order?: number;
  court?: string | null;
  playing_start_time: string | null; // "HH:MM:SS"
  playing_end_time: string | null; // "HH:MM:SS"
  player_opponents_nr?: number;
  player_matches_repeat?: number;
  include_scores?: boolean;
  has_demonstrative_match?: boolean;
  fixed_teams?: boolean;
  inserted_at?: number;
  updated_at?: number;
  division?: Division;
}

/** Player- or event-relative badge from GET /app/events (list/show). */
export interface EventBadge {
  key: string;
  label: string;
}

/** Nested organizer from GET /app/events (list/show when loaded). */
export interface Organizer {
  id_organizer: number;
  name: string;
  logo_path?: string | null;
  /** Public logo URL (API field name `url`). */
  url?: string | null;
  show_event_label?: boolean;
  inserted_at?: number;
  updated_at?: number | null;
}

export interface Event {
  id_event: number;
  /** Server-generated URL slug (read-only). */
  slug?: string | null;
  location_id: number;
  organizer_id?: number | null;
  name: string;
  /** HTML description; omitted on app index, present on show. */
  description?: string;
  cover_url?: string | null;
  date: string; // "YYYY-MM-DD"
  arriving_time: string; // "HH:MM:SS"
  closing_time: string; // "HH:MM:SS"
  finalized_at?: number | null;
  /** Unix epoch until which players may register. */
  registration_allowed_until: number;
  /** Unix epoch until which players may self-cancel. */
  cancellation_allowed_until: number;
  inserted_at: number;
  updated_at: number;
  location?: Location;
  organizer?: Organizer | null;
  event_divisions?: EventDivision[];
  participations?: unknown[];
  lotteries?: unknown[];
  /** Ordered badges from the API; client renders only. */
  badges?: EventBadge[];
}

/** data of GET /app/events/filter-options */
export interface EventFilterOptions {
  clubs: Array<{ id_club: number; name: string }>;
  unpaid_count: number;
  has_lottery_winner: boolean;
}

/** Item of GET /app/my/event-history */
export interface EventHistoryItem {
  id_event: number;
  name: string;
  date: string;
  division_titles: string[];
}

export interface UploadedImage {
  id: number;
  url: string;
  is_pdf_primary?: boolean;
}

export interface PlayerEmail {
  id_player_email: number;
  email: string;
  purposes: string[];
  is_primary: boolean;
  verified_at: number | null;
}

export interface PlayerPhone {
  id_player_phone: number;
  phone: string;
  purposes: string[];
  is_primary: boolean;
  verified_at: number | null;
}

export interface PlayerIdentity {
  id_identity: number;
  provider: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  linked_at: number;
  last_login_at: number | null;
}

export interface Player {
  id_player: number;
  name: string | null;
  skill_division: number | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  year_of_birth: number | null;
  being_student: boolean | null;
  playtomic_id: string | null;
  rankedin_id: string | null;
  user_types: string[];
  instagram_username: string | null;
  facebook_username: string | null;
  inserted_at: number;
  updated_at: number;
  emails?: PlayerEmail[];
  phones?: PlayerPhone[];
  identities?: PlayerIdentity[];
  uploaded_profile_images: UploadedImage[];
  participations?: unknown[];
}

/** data of POST /app/auth/identities/google */
export interface LinkGoogleIdentityData {
  identity: PlayerIdentity;
  result_code: "linked" | "already_linked";
}

/** Auth login response payload (data of POST /app/auth/google | /app/auth/dev-login). */
export interface AuthData {
  token: string;
  player: Player;
  user_type: string; // "player"
}

// ---------- Eligibility ----------

export type ReviewStatus = "pending" | "approved" | "rejected" | "discarded";

export interface Eligibility {
  id_eligibility: number;
  player_id: number;
  event_ids: number[] | null;
  /** Full events for event_ids (embedded by the API so no by-id lookup is needed). */
  events?: Event[];
  media_source: number[] | null;
  friends_source: string[] | null;
  racket_experience: string[] | null; // "none" | "tennis" | "squash" | "badminton" | "padel"
  phone: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  birth_year: number | null;
  birth_month: number | null;
  birth_day: number | null;
  being_student: boolean | null;
  playtomic_id: string | null;
  rankedin_id: string | null;
  instagram_username: string | null;
  facebook_username: string | null;
  submitted_at: number | null;
  reviewed_at: number | null;
  ready_for_review: boolean;
  review_status: ReviewStatus;
  review_message: string | null;
  resubmitted_at: number | null;
  inserted_at: number;
  updated_at: number | null;
  student_proofs: UploadedImage[];
  portrait_photos: UploadedImage[];
}

export interface EligibilityStatus {
  latest: ReviewStatus | null;
  overall: {
    approved: number;
    pending: number;
    discarded: number;
    rejected: number;
  };
}

// ---------- Event registrations & payments ----------

export type RegistrationLifecycleStatus = "active" | "cancelled" | "declined";

export type RegistrationPaymentStatus =
  | "unpaid"
  | "awaiting_proof_review"
  | "paid"
  | "refund_pending"
  | "refunded";

export type RegistrationPaymentMethod = "netopia" | "bank_transfer";

export type RegistrationCancelReason =
  | "change_of_plans"
  | "schedule_conflict"
  | "injury_or_illness"
  | "travel_issue"
  | "personal_reasons"
  | "other";

export type RegistrationDeclineReason = string;

export type PaymentAttemptStatus =
  | "started"
  | "pending"
  | "succeeded"
  | "failed"
  | "superseded";

export type PaymentProofReviewStatus = "pending" | "approved" | "rejected";

export type CheckoutStatus = "open" | "awaiting_proof" | "completed";

export type CheckoutItemStatus = "active" | "cancelled";

export type PaymentCoverageItem = {
  registration_id: number;
  event_division_id: number | null;
  division_title: string;
  division_color: string;
  amount_ron: number;
};

export interface RegistrationPaymentAttempt {
  id_payment_attempt: number;
  checkout_id?: number;
  amount: number;
  currency?: string;
  status: PaymentAttemptStatus | string;
  ntp_id?: string | null;
  order_id: string | null;
  redirect_url?: string | null;
  error_message?: string | null;
  inserted_at: number;
  coverage?: PaymentCoverageItem[];
}

export interface RegistrationPaymentProof {
  id_payment_proof: number;
  checkout_id?: number;
  url: string | null;
  review_status: PaymentProofReviewStatus | string;
  review_message: string | null;
  reviewed_at: number | null;
  inserted_at?: number;
  coverage?: PaymentCoverageItem[];
}

export interface EventRegistrationCheckoutItem {
  id_checkout_item: number;
  registration_id: number;
  base_amount_ron?: number | null;
  amount: number;
  item_status: CheckoutItemStatus | string;
  registration?: EventRegistration | null;
}

/** Applied / available benefit line from pricing quote or registration.redemptions. */
export interface BenefitRedemption {
  id_redemption?: number;
  benefit_definition_id: number;
  benefit_name: string;
  amount_ron: number;
  selection_source?: string | null;
  reason?: string | null;
}

/** Eligible benefit candidate inside a checkout quote line. */
export interface CheckoutQuoteEligibleBenefit {
  benefit_id: number;
  slug: string;
  name: string;
  auto: boolean;
  player_optional: boolean;
  amount_ron: number;
}

export interface CheckoutQuoteAppliedBenefit {
  benefit_id: number;
  slug: string;
  name: string;
  amount_ron: number;
  selection_source: string;
}

export interface CheckoutQuoteLineQuote {
  base_fee: number;
  amount_due: number;
  eligible: CheckoutQuoteEligibleBenefit[];
  applied: CheckoutQuoteAppliedBenefit[];
}

export interface CheckoutQuoteLine {
  checkout_item_id: number;
  registration_id: number;
  event_division_id: number | null;
  base_amount_ron: number;
  amount: number;
  quote: CheckoutQuoteLineQuote;
}

export interface ReferrerCandidate {
  referrer_player_id: number;
  latest_touched_at: number;
}

/** data of GET /app/registration-checkouts/{id}/quote */
export interface CheckoutQuoteData {
  checkout_id: number;
  total_amount: number;
  referrer_candidates: ReferrerCandidate[];
  lines: CheckoutQuoteLine[];
}

/** Body for PATCH /app/registration-checkouts/{id}/benefit-selections */
export interface BenefitSelectionsBody {
  selected_benefit_ids?: number[];
  referrer_player_id?: number | null;
}

export interface ReferralInviteeInput {
  email?: string | null;
  phone?: string | null;
  player_id?: number | null;
}

export interface EventReferralCodeInvitee {
  id_invitee?: number;
  email?: string | null;
  phone?: string | null;
  player_id?: number | null;
}

export interface EventReferralCode {
  id_referral_code: number;
  event_id: number;
  referrer_player_id: number;
  code: string;
  expires_at: number;
  revoked_at: number | null;
  inserted_at?: number;
  updated_at?: number | null;
  invitees?: EventReferralCodeInvitee[];
}

/** data of GET /app/events/{id}/referral-codes */
export interface ReferralCodesIndexData {
  remaining_slots: number;
  codes: EventReferralCode[];
}

/** data of POST /app/events/{id}/referral-codes */
export interface ReferralCodeCreateData {
  remaining_slots: number;
  code: EventReferralCode;
}

/** data of POST /app/referral-codes/{id}/revoke */
export interface ReferralCodeRevokeData {
  remaining_slots: number;
  code: EventReferralCode;
}

export interface ReferralTouchpoint {
  id_touchpoint?: number;
  event_id: number;
  referral_code_id?: number;
  referrer_player_id?: number;
  referred_player_id?: number;
  code?: string;
  touched_at?: number;
  discount_eligible?: boolean;
  [key: string]: unknown;
}

export interface EventRegistrationCheckout {
  id_checkout: number;
  event_id: number;
  player_id: number;
  status: CheckoutStatus | string;
  total_amount: number;
  payment_method: RegistrationPaymentMethod | null;
  paid_at: number | null;
  inserted_at: number;
  updated_at: number | null;
  items?: EventRegistrationCheckoutItem[];
  payment_attempts?: RegistrationPaymentAttempt[];
  payment_proofs?: RegistrationPaymentProof[];
  latest_attempt?: {
    id_payment_attempt: number;
    amount: number;
    status: PaymentAttemptStatus | string;
    order_id: string | null;
    inserted_at: number;
  } | null;
}

export interface EventRegistration {
  id_registration: number;
  event_id: number;
  player_id: number;
  event_division_id: number | null;
  /** Open or latest checkout that includes this registration, when known. */
  checkout_id?: number | null;
  is_minor: boolean;
  is_student: boolean;
  payment: number;
  amount_due: number;
  /** Unix epoch payment deadline; null when already paid / not applicable. */
  payment_due_at?: number | null;
  /** True when unpaid and past payment_due_at. */
  is_overdue?: boolean;
  lifecycle_status: RegistrationLifecycleStatus;
  payment_status: RegistrationPaymentStatus;
  payment_method: RegistrationPaymentMethod | null;
  paid_at: number | null;
  cancelled_at: number | null;
  declined_at: number | null;
  cancel_reason: RegistrationCancelReason | null;
  decline_reason: RegistrationDeclineReason | null;
  inserted_at: number;
  updated_at: number | null;
  /** Named benefit redemptions (student, referred, …) — not a flat discount line. */
  redemptions?: BenefitRedemption[];
  event?: Event;
  event_division?: EventDivision | null;
  payment_attempts?: RegistrationPaymentAttempt[];
  payment_proofs?: RegistrationPaymentProof[];
}

/**
 * Body for POST /app/event-registrations.
 * Prefer `event_division_ids` for multi-division checkout create; legacy single
 * `event_division_id` still works and returns one registration.
 */
export interface CreateRegistrationBody {
  event_id: number;
  event_division_id?: number | null;
  event_division_ids?: Array<number | null>;
}

/** data of multi-create POST /app/event-registrations with event_division_ids. */
export interface CreateRegistrationsCheckoutData {
  registrations: EventRegistration[];
  checkout: EventRegistrationCheckout;
}

/** data of POST …/payments/netopia/start (registration or checkout scoped). */
export interface NetopiaStartData {
  attempt: {
    id_payment_attempt: number;
    checkout_id?: number;
    order_id: string | null;
    redirect_url: string | null;
    status: PaymentAttemptStatus | string;
  };
  registration?: EventRegistration;
  checkout?: EventRegistrationCheckout;
}

/** data of POST …/payments/bank-proofs (registration or checkout scoped). */
export interface BankProofUploadData {
  proof: {
    id_payment_proof: number;
    checkout_id?: number;
    url: string | null;
    review_status: PaymentProofReviewStatus | string;
  };
  registration?: EventRegistration;
  checkout?: EventRegistrationCheckout;
}

/** data of POST /app/registration-checkouts/{id}/payments/reset | /exclude. */
export interface CheckoutMutationData {
  checkout: EventRegistrationCheckout;
}

/** data of GET /app/bank-transfer-settings. */
export interface BankTransferSettings {
  iban: string;
  beneficiary_name: string;
  bank_name: string | null;
  payment_reference_template: string | null;
  /** Resolved reference when `checkout_id` or `registration_id` was supplied. */
  payment_reference: string | null;
  extra_instructions: string | null;
}

/** data of POST /app/device-tokens. */
export interface DeviceTokenData {
  id_player_device_token: number;
  token: string;
  platform: string | null;
}

/** Body for PATCH /app/my/eligibility/pending — all fields optional. */
export interface PatchPendingBody {
  duplicate_id?: number;
  event_ids?: number[];
  media_source?: number[];
  friends_source?: string[];
  racket_experience?: string[];
  playtomic_id?: string;
  rankedin_id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone?: string;
  birth_year?: number;
  birth_month?: number;
  birth_day?: number;
  being_student?: boolean;
  instagram_username?: string;
  facebook_username?: string;
}
