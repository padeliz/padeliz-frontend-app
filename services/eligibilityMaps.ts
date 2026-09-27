/**
 * Mapping between the eligibility form state and the backend PATCH-pending body.
 *
 * IMPORTANT: `media_source` is stored as integers but the backend defines NO canonical
 * meaning for them (it just persists the ints). This map is therefore a FRONTEND-OWNED
 * convention — keep it in sync with the manager/admin apps so a given int means the same
 * channel everywhere. `racket_experience` is free-form strings; the documented vocabulary
 * is none/tennis/squash/badminton/padel (ping-pong has no value and is dropped).
 */
import type { PatchPendingBody, Eligibility } from "@/types/api";
import type { EligibilityFormState } from "@/app/event/eligibility-check";

/** discovery source id ↔ integer (frontend-owned convention). */
export const MEDIA_SOURCE_MAP: Record<string, number> = {
  instagram: 1,
  tiktok: 2,
  facebook: 3,
  friends: 4,
};

const MEDIA_SOURCE_REVERSE: Record<number, string> = Object.fromEntries(
  Object.entries(MEDIA_SOURCE_MAP).map(([k, v]) => [v, k])
);

/** sport id → racket_experience value (null = no backend equivalent, dropped). */
export const SPORT_TO_RACKET: Record<string, string | null> = {
  padel: "padel",
  tennis: "tennis",
  badminton: "badminton",
  squash: "squash",
  "ping-pong": null,
};

const RACKET_SPORT_IDS = new Set(
  Object.entries(SPORT_TO_RACKET)
    .filter(([, v]) => v !== null)
    .map(([, v]) => v as string)
);

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Build the PATCH /pending body from the collected form state. `editionIds` is the FULL
 * set of editions the pending record should cover (the backend replaces the array), so
 * callers must pass the union of existing + current to avoid dropping prior events.
 */
export function buildPatchPendingBody(
  state: EligibilityFormState,
  editionIds?: number[]
): PatchPendingBody {
  const body: PatchPendingBody = {};

  const media = uniq(
    state.discoverySources
      .map((s) => MEDIA_SOURCE_MAP[s])
      .filter((n): n is number => typeof n === "number")
  );
  if (media.length) body.media_source = media;

  const friends = state.friendEmails.map((e) => e.trim()).filter(Boolean);
  if (friends.length) body.friends_source = friends;

  const rackets = uniq(
    state.selectedSports
      .map((s) => SPORT_TO_RACKET[s])
      .filter((v): v is string => !!v)
  );
  body.racket_experience = rackets.length ? rackets : ["none"];

  const firstName = state.firstName.trim();
  const middleName = state.middleName.trim();
  const lastName = state.lastName.trim();
  if (firstName) body.first_name = firstName;
  if (middleName) body.middle_name = middleName;
  if (lastName) body.last_name = lastName;

  const phone = state.phoneNumber.trim();
  if (phone) body.phone = phone;

  const birthYear = parseInt(state.birthYear, 10);
  const birthMonth = parseInt(state.birthMonth, 10);
  const birthDay = parseInt(state.birthDay, 10);
  if (!Number.isNaN(birthYear)) body.birth_year = birthYear;
  if (!Number.isNaN(birthMonth)) body.birth_month = birthMonth;
  if (!Number.isNaN(birthDay)) body.birth_day = birthDay;

  body.being_student = state.isStudent;

  const ids = (editionIds ?? []).filter(
    (n) => typeof n === "number" && !Number.isNaN(n)
  );
  if (ids.length) body.edition_ids = uniq(ids);

  return body;
}

/** Reverse-map an existing eligibility record into form fields for prefill. */
export function hydrateFromEligibility(
  e: Eligibility
): Partial<EligibilityFormState> {
  const discoverySources = (e.media_source ?? [])
    .map((n) => MEDIA_SOURCE_REVERSE[n])
    .filter((s): s is string => typeof s === "string");

  const selectedSports = (e.racket_experience ?? []).filter((s) =>
    RACKET_SPORT_IDS.has(s)
  );

  const friendEmails = e.friends_source && e.friends_source.length
    ? e.friends_source
    : [""];

  return {
    discoverySources,
    friendEmails,
    selectedSports,
    firstName: e.first_name ?? "",
    middleName: e.middle_name ?? "",
    lastName: e.last_name ?? "",
    phoneNumber: e.phone ?? "",
    birthYear: e.birth_year != null ? String(e.birth_year) : "",
    birthMonth: e.birth_month != null ? String(e.birth_month) : "",
    birthDay: e.birth_day != null ? String(e.birth_day) : "",
    isStudent: e.being_student ?? false,
  };
}
