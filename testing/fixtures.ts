/** Shared API-shaped fixtures for the app test suites. */
import type {
  Event,
  EventRegistration,
  Eligibility,
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

export function makeApprovedEligibility(
  overrides: Partial<Eligibility> = {}
): Eligibility {
  return {
    id_eligibility: 11,
    player_id: 9,
    event_ids: [EDITION_ID],
    media_source: null,
    friends_source: null,
    racket_experience: null,
    phone: '0700000000',
    first_name: 'Ana',
    middle_name: null,
    last_name: 'Pop',
    birth_year: 2003,
    birth_month: 4,
    birth_day: 12,
    being_student: true,
    playtomic_id: null,
    rankedin_id: null,
    instagram_username: null,
    facebook_username: null,
    submitted_at: 1_699_000_000,
    reviewed_at: 1_699_500_000,
    ready_for_review: true,
    review_status: 'approved',
    review_message: null,
    resubmitted_at: null,
    inserted_at: 1_699_000_000,
    updated_at: 1_699_500_000,
    student_proofs: [],
    portrait_photos: [],
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
