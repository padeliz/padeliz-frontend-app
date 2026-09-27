/**
 * TypeScript types mirroring the Laravel API (http://localhost:8000/api/v1).
 *
 * These describe the backend's wire shapes. UI-facing types live in
 * `types/types.ts`; mappers in `services/mappers.ts` translate between them.
 *
 * Conventions confirmed from the backend:
 * - Timestamps (inserted_at, updated_at, submitted_at, ...) are Unix epoch ints.
 * - Edition `date` is a "YYYY-MM-DD" string; times are "HH:MM:SS" strings.
 * - Uploaded files are `{ id, url }` with absolute URLs.
 */

// ---------- Response envelopes ----------

/** Custom endpoints (auth, eligibility status/latest/approved/discard/pending). */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

/** List endpoints (editions, my editions) — Laravel pagination, no `success`. */
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
  [key: string]: unknown;
}

export interface EditionDivision {
  id_edition_division: number;
  edition_id: number;
  division_id: number;
  players_limit: number;
  court: string | null;
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

export interface Edition {
  id_edition: number;
  location_id: number;
  name: string;
  date: string; // "YYYY-MM-DD"
  entry_fee: number;
  students_entry_fee: number;
  arriving_time: string; // "HH:MM:SS"
  closing_time: string; // "HH:MM:SS"
  inserted_at: number;
  updated_at: number;
  location?: Location;
  edition_divisions?: EditionDivision[];
  participations?: unknown[];
  lotteries?: unknown[];
}

export interface UploadedImage {
  id: number;
  url: string;
}

export interface Player {
  id_player: number;
  name: string | null;
  phone: string | null;
  google_id: string | null;
  google_name: string | null;
  google_email: string | null;
  google_avatar: string | null;
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
  uploaded_profile_images: UploadedImage[];
  participations?: unknown[];
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
  edition_ids: number[] | null;
  /** Full editions for edition_ids (embedded by the API so no by-id lookup is needed). */
  editions?: Edition[];
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

/** Body for PATCH /app/my/eligibility/pending — all fields optional. */
export interface PatchPendingBody {
  duplicate_id?: number;
  edition_ids?: number[];
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
