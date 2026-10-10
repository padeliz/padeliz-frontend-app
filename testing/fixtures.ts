/** Shared API-shaped fixtures for the app test suites. */
import type {
  Event,
  EventRegistration,
  DiscoverySummary,
  MediaSource,
  PlayerLevel,
  PlayerLevelAssessment,
  PlayerStudentProof,
  PlayerStudentProofFile,
  Player,
  PlayerEmail,
  PlayerIdentity,
  PlayerPhone,
  RegistrationPaymentStatus,
} from '@/types/api';

export const EDITION_ID = 42;
export const DIVISION_ID = 7;

/** Far enough in the future that `classifyTiming` reports "upcoming". */
const FUTURE_DATE = '2099-06-15';

export function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id_event: EDITION_ID,
    location_id: 3,
    organizer_id: 1,
    name: 'Minitour 21',
    slug: 'tour-org-minitour-21',
    description: '<p>Join us for a day of padel.</p>',
    cover_url: 'https://example.com/cover.png',
    date: FUTURE_DATE,
    arriving_time: '10:30:00',
    closing_time: '18:00:00',
    registration_allowed_until: Math.floor(Date.now() / 1000) + 86_400,
    cancellation_allowed_until: Math.floor(Date.now() / 1000) + 86_400,
    inserted_at: 1_700_000_000,
    updated_at: 1_700_000_000,
    location: {
      id_location: 3,
      club_id: 1,
      name: 'Padel Arena',
      address: 'Str. Exemplu 1',
      total_indoors_courts: 4,
      total_outdoor_courts: 2,
    },
    organizer: {
      id_organizer: 1,
      name: 'Tour Org',
      url: 'https://example.com/org.png',
    },
    event_divisions: [
      {
        id_event_division: DIVISION_ID,
        event_id: EDITION_ID,
        division_id: 2,
        division_title: 'Students Rookies',
        players_limit: 12,
        entry_fee: 45,
        playing_start_time: '11:00:00',
        playing_end_time: '14:00:00',
        is_eligible: true,
        division: {
          id_division: 2,
          name: 'Students Rookies',
          color: '#2E7D32',
        },
      },
      {
        id_event_division: DIVISION_ID + 1,
        event_id: EDITION_ID,
        division_id: 3,
        division_title: 'Intermediate',
        players_limit: 16,
        entry_fee: 60,
        playing_start_time: '14:30:00',
        playing_end_time: '18:00:00',
        is_eligible: true,
        division: {
          id_division: 3,
          name: 'Intermediate',
          color: '#1565C0',
        },
      },
    ],
    ...overrides,
  };
}

export function makeRegistration(
  overrides: Partial<EventRegistration> = {}
): EventRegistration {
  return {
    id_registration: 501,
    event_id: EDITION_ID,
    player_id: 9,
    event_division_id: DIVISION_ID,
    checkout_id: 901,
    is_minor: false,
    is_student: true,
    payment: 45,
    amount_due: 45,
    payment_due_at: Math.floor(Date.now() / 1000) + 86_400,
    is_overdue: false,
    lifecycle_status: 'active',
    payment_status: 'unpaid',
    payment_method: null,
    paid_at: null,
    cancelled_at: null,
    declined_at: null,
    cancel_reason: null,
    decline_reason: null,
    inserted_at: 1_700_000_100,
    updated_at: 1_700_000_100,
    redemptions: [],
    ...overrides,
  };
}

export function makeRegistrationWithStatus(
  payment_status: RegistrationPaymentStatus
): EventRegistration {
  return makeRegistration({
    payment_status,
    paid_at: payment_status === 'paid' ? 1_700_000_200 : null,
    payment_due_at: payment_status === 'unpaid' ? Math.floor(Date.now() / 1000) + 86_400 : null,
    is_overdue: false,
  });
}

export function makePlayerLevel(overrides: Partial<PlayerLevel> = {}): PlayerLevel {
  return {
    id_player_level: 1,
    player_id: 9,
    level: '3.25',
    band_name: 'Intermediate',
    player_level_assessment_id: 5,
    event_participation_id: null,
    inserted_at: 1_700_000_000,
    updated_at: null,
    ...overrides,
  };
}

export function makeAssessment(
  overrides: Partial<PlayerLevelAssessment> = {}
): PlayerLevelAssessment {
  return {
    id_player_level_assessment: 5,
    player_id: 9,
    player_custom_field_submission_id: 77,
    submitted_at: null,
    resubmitted_at: null,
    ready_for_review: false,
    reviewed_at: null,
    review_status: 'pending',
    review_message: null,
    inserted_at: 1_700_000_000,
    updated_at: null,
    submission: { id_player_custom_field_submission: 77, values: [] },
    player_level: null,
    profile_images: [],
    ...overrides,
  };
}

export const MEDIA_SOURCES: MediaSource[] = [
  { id_media_source: 1, code: 'instagram', label: 'Instagram', sort_order: 1 },
  { id_media_source: 2, code: 'tiktok', label: 'TikTok', sort_order: 2 },
  { id_media_source: 3, code: 'facebook', label: 'Facebook', sort_order: 3 },
  { id_media_source: 4, code: 'friends', label: 'Friends', sort_order: 4 },
];

export function makeDiscoverySummary(
  overrides: Partial<DiscoverySummary> = {}
): DiscoverySummary {
  return {
    media_sources: [],
    media_source_ids: [],
    friends: [],
    max_friends: 3,
    friends_selected: false,
    needs_media: true,
    needs_friends: false,
    ...overrides,
  };
}

export function makeStudentProofFile(
  overrides: Partial<PlayerStudentProofFile> = {}
): PlayerStudentProofFile {
  const id = overrides.id_player_student_proof_file ?? 31;
  return {
    id_player_student_proof_file: id,
    student_proof_id: 3,
    sort_order: 0,
    url: `https://example.com/proof-${id}.png`,
    inserted_at: 1_700_000_000,
    updated_at: null,
    ...overrides,
  };
}

export function makeStudentProof(
  overrides: Partial<PlayerStudentProof> = {}
): PlayerStudentProof {
  return {
    id_player_student_proof: 3,
    player_id: 9,
    student_until: '2099-06-30',
    ready_for_review: false,
    review_status: 'pending',
    review_message: null,
    submitted_at: null,
    reviewed_at: null,
    files: [makeStudentProofFile()],
    inserted_at: 1_700_000_000,
    updated_at: null,
    ...overrides,
  };
}

/** Screen-facing shape returned by the React Query wrapper hooks (`QueryState`). */
export function asyncState<T>(data: T, loading = false) {
  return { data, loading, error: null, refetch: jest.fn() };
}

export function makePlayerEmail(
  overrides: Partial<PlayerEmail> = {}
): PlayerEmail {
  return {
    id_player_email: 1,
    email: 'ana@example.com',
    purposes: ['contact', 'login'],
    is_primary: true,
    verified_at: 1_700_000_000,
    ...overrides,
  };
}

export function makePlayerPhone(
  overrides: Partial<PlayerPhone> = {}
): PlayerPhone {
  return {
    id_player_phone: 1,
    phone: '0700000000',
    purposes: ['contact'],
    is_primary: true,
    verified_at: 1_700_000_000,
    ...overrides,
  };
}

export function makeGoogleIdentity(
  overrides: Partial<PlayerIdentity> = {}
): PlayerIdentity {
  return {
    id_identity: 10,
    provider: 'google',
    email: 'google@example.com',
    display_name: 'Google User',
    avatar_url: 'https://example.com/avatar.png',
    linked_at: 1_700_000_000,
    last_login_at: 1_700_000_100,
    ...overrides,
  };
}

export function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id_player: 9,
    name: 'Ana Pop',
    skill_division: null,
    first_name: 'Ana',
    middle_name: null,
    last_name: 'Pop',
    year_of_birth: 2003,
    being_student: true,
    playtomic_id: null,
    rankedin_id: null,
    user_types: ['player'],
    instagram_username: null,
    facebook_username: null,
    inserted_at: 1_700_000_000,
    updated_at: 1_700_000_000,
    emails: [makePlayerEmail()],
    phones: [makePlayerPhone()],
    identities: [makeGoogleIdentity()],
    uploaded_profile_images: [],
    ...overrides,
  };
}
