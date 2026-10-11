/**
 * TypeScript types mirroring the Laravel API (http://localhost:8000/api/v1).
 *
 * These describe the backend's wire shapes. UI-facing types live in
 * `types/types.ts`; mappers in `services/mappers.ts` translate between them.
 *
 * Conventions confirmed from the backend:
 * - Timestamps (inserted_at, updated_at, event_starts_at, …) are Unix epoch ints.
 * - Calendar timing uses Europe/Bucharest days of those unix bounds.
 * - Uploaded files / covers are absolute URLs.
 */

// ---------- Response envelopes ----------

/** Custom endpoints (auth, level assessment, discovery, student proofs, ...). */
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
  level_min?: string | number | null;
  level_max?: string | number | null;
  /**
   * Server verdict for the signed-in player (level fits the division bounds).
   * Absent/null for guests.
   */
  is_eligible?: boolean | null;
  court?: string | null;
  /** Unix epoch check-in; omit Check-in in the App when null. */
  check_in_at: number | null;
  playing_starts_at: number;
  playing_ends_at: number;
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

/** Child cover from GET /app/events (list/show). */
export interface EventCoverImage {
  id: number;
  url: string;
  /** Width / height; used for temporary cover wrapper height. */
  aspect_ratio: number;
  sort_order: number;
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
  /** Primary cover URL (lowest sort_order); kept for list role. */
  cover_url?: string | null;
  /** Ordered cover images (max 2); primary is sort_order ascending. */
  cover_images?: EventCoverImage[];
  /** Unix epoch when the event window starts. */
  event_starts_at: number;
  /** Unix epoch when the event window ends. */
  event_ends_at: number;
  /**
   * Inclusive Bucharest calendar days from event_starts_at to event_ends_at.
   * Computed by the API (not stored).
   */
  event_nr_of_days: number;
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
  /**
   * GET /app/events/{id} only: the auth player has an EventParticipation row for
   * this event (never inferred from registration / payment badges). `false` for guests.
   */
  has_participated?: boolean;
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
  /** Bucharest calendar day of event_starts_at ("YYYY-MM-DD"). */
  date: string;
  event_starts_at?: number;
  event_ends_at?: number;
  slug?: string | null;
  division_titles: string[];
}

export interface UploadedImage {
  id: number;
  url: string;
  is_pdf_primary?: boolean;
}

export interface PlayerEmail {
  id_user_email: number;
  email: string;
  purposes: string[];
  is_primary: boolean;
  verified_at: number | null;
}

export interface PlayerPhone {
  id_user_phone: number;
  phone: string;
  purposes: string[];
  is_primary: boolean;
  verified_at: number | null;
}

export interface PlayerIdentity {
  id_user_identity: number;
  provider: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_avatar_primary?: boolean;
  linked_at: number;
  last_login_at: number | null;
}

export interface Player {
  id_user: number;
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
  /** Google avatar resolved by the API (primary, else latest linked). Google only. */
  avatar_url?: string | null;
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
  user: Player;
  user_type: string; // "player"
}

// ---------- Level progression (assessment, discovery, student proofs) ----------

export type AssessmentReviewStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "discarded";

/** Custom field codes the app writes into a pending level assessment. */
export type AssessmentFieldCode =
  | "racket_experience"
  | "big_tournament_division"
  | "year_of_birth"
  | "playtomic_id"
  | "rankedin_id"
  | "gender"
  | "instagram_username"
  | "facebook_username";

/** One entry of the `racket_experience` json custom field. */
export interface RacketExperienceEntry {
  sport: string;
  level: string;
  years_of_playing?: number;
  matches_played?: number;
  lessons_had?: number;
}

export interface AssessmentFieldValue {
  id_player_custom_field_value: number;
  player_custom_field_id: number;
  /** Presenter-resolved answer (text, integer, option label, or json). */
  value: unknown;
  value_text?: string | null;
  value_integer?: number | null;
  value_json?: unknown;
  field?: { id_player_custom_field: number; code: string; type?: string } | null;
}

export interface AssessmentProfileImage {
  id: number;
  url: string;
  is_pdf_primary?: boolean;
  uploaded_via?: string | null;
  uploaded_via_level_assessment_id?: number | null;
  original_filename?: string | null;
}

/** A level the player holds (data of GET /app/my/level-assessment/current-level). */
export interface PlayerLevel {
  id_player_level: number;
  player_user_id: number;
  /** Two-decimal numeric level, e.g. "3.25". */
  level: string;
  band_name: string | null;
  player_level_assessment_id: number | null;
  event_participation_id: number | null;
  inserted_at: number;
  updated_at: number | null;
}

export interface PlayerLevelAssessment {
  id_player_level_assessment: number;
  player_user_id: number;
  player_custom_field_submission_id: number | null;
  submitted_at: number | null;
  resubmitted_at: number | null;
  ready_for_review: boolean;
  reviewed_at: number | null;
  review_status: AssessmentReviewStatus;
  review_message: string | null;
  inserted_at: number;
  updated_at: number | null;
  submission?: {
    id_player_custom_field_submission: number;
    values: AssessmentFieldValue[] | null;
  } | null;
  player_level?: PlayerLevel | null;
  profile_images?: AssessmentProfileImage[];
}

export interface LevelAssessmentStatus {
  latest: AssessmentReviewStatus | null;
  overall: {
    approved: number;
    pending: number;
    discarded: number;
    rejected: number;
  };
}

/** Item of GET /app/levels. */
export interface Level {
  id_level: number;
  name: string;
  level_min: string | number;
  level_max: string | number;
}

export interface MediaSource {
  id_media_source: number;
  code: string;
  label: string;
  sort_order: number;
}

export interface PlayerFriendsSource {
  id_player_friends_source: number;
  player_user_id: number;
  friend_player_user_id: number | null;
  friend_name?: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

/** data of GET /app/my/discovery. */
export interface DiscoverySummary {
  media_sources: MediaSource[];
  media_source_ids: number[];
  friends: PlayerFriendsSource[];
  max_friends: number;
  friends_selected: boolean;
  needs_media: boolean;
  needs_friends: boolean;
}

/** One friend row sent to PUT /app/my/discovery/friends. */
export interface FriendInput {
  friend_player_user_id?: number | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
}

/** Item of GET /app/my/discovery/suggest-friends. */
export interface FriendSuggestion {
  friend_player_user_id: number;
  full_name: string;
  touched_at: number;
}

/** Item of GET /app/my/discovery/search-players (contacts are masked server-side). */
export interface PlayerSearchResult {
  id_user: number;
  name: string;
  email_masked: string | null;
  phone_masked: string | null;
  avatar_url: string | null;
}

export interface PlayerStudentProofFile {
  id_player_student_proof_file: number;
  student_proof_id: number;
  sort_order: number;
  url: string;
  inserted_at: number;
  updated_at: number | null;
}

export interface PlayerStudentProof {
  id_player_student_proof: number;
  player_user_id: number;
  /** "YYYY-MM-DD". */
  student_until: string | null;
  sort_order?: number;
  ready_for_review: boolean;
  review_status: AssessmentReviewStatus;
  review_message: string | null;
  submitted_at: number | null;
  reviewed_at: number | null;
  /** 0-3 files (a pending proof needs >=1 before it can be marked ready). */
  files: PlayerStudentProofFile[];
  inserted_at: number;
  updated_at: number | null;
}

/** data of GET /app/my/student-proofs. */
export interface StudentProofsIndex {
  has_active: boolean;
  pending: PlayerStudentProof | null;
  items: PlayerStudentProof[];
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
  referrer_player_user_id: number;
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
  referrer_player_user_id?: number | null;
}

export interface ReferralInviteeInput {
  email?: string | null;
  phone?: string | null;
  player_user_id?: number | null;
}

export interface EventReferralCodeInvitee {
  id_invitee?: number;
  email?: string | null;
  phone?: string | null;
  player_user_id?: number | null;
}

export interface EventReferralCode {
  id_referral_code: number;
  event_id: number;
  referrer_player_user_id: number;
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
  referrer_player_user_id?: number;
  referred_player_user_id?: number;
  code?: string;
  touched_at?: number;
  discount_eligible?: boolean;
  [key: string]: unknown;
}

export interface EventRegistrationCheckout {
  id_checkout: number;
  event_id: number;
  player_user_id: number;
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
  player_user_id: number;
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
