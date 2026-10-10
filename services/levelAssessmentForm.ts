/**
 * Level assessment form state + mapping to/from the backend custom-field answers.
 *
 * Only the assessment custom fields live here (names / phone stay Account-only):
 *   racket_experience (json: sport + level + ≥1 metric), big_tournament_division,
 *   year_of_birth, playtomic_id, rankedin_id, gender, instagram_username, facebook_username.
 */
import type {
  AssessmentFieldCode,
  PlayerLevelAssessment,
  RacketExperienceEntry,
} from "@/types/api";
import type { CustomFieldsPayload } from "@/services/levelAssessment";

export const RACKET_SPORTS = [
  { id: "padel", label: "Padel" },
  { id: "tennis", label: "Tennis" },
  { id: "badminton", label: "Badminton" },
  { id: "squash", label: "Squash" },
  { id: "ping-pong", label: "Ping-Pong" },
  { id: "pickleball", label: "Pickleball" },
] as const;

export const RACKET_LEVELS = [
  { label: "Amateur", value: "amateur" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
  { label: "Professional", value: "professional" },
] as const;

export const RACKET_MEASURES = [
  { key: "years_of_playing", label: "Years playing", decimal: true },
  { key: "matches_played", label: "Matches played", decimal: false },
  { key: "lessons_had", label: "Lessons had", decimal: false },
] as const;

export type RacketMeasureKey = (typeof RACKET_MEASURES)[number]["key"];

export type RacketDraft = {
  level: string;
} & Record<RacketMeasureKey, string>;

export type Gender = "" | "female" | "male";

/**
 * The `gender` field is a single_select: the API wants an option id, which no app endpoint
 * exposes. These mirror the seeded options (female, male); keep in sync with the backend.
 */
export const GENDER_OPTION_IDS: Record<Exclude<Gender, "">, number> = {
  female: 1,
  male: 2,
};

export type AssessmentFormState = {
  selectedSports: string[];
  racket: Record<string, RacketDraft>;
  bigTournamentDivision: string;
  yearOfBirth: string;
  playtomicId: string;
  rankedinId: string;
  gender: Gender;
  instagramUsername: string;
  facebookUsername: string;
};

export type TextFieldKey =
  | "bigTournamentDivision"
  | "yearOfBirth"
  | "playtomicId"
  | "rankedinId"
  | "instagramUsername"
  | "facebookUsername";

export type FormAction =
  | { type: "TOGGLE_SPORT"; sport: string }
  | { type: "SET_RACKET"; sport: string; patch: Partial<RacketDraft> }
  | { type: "SET_FIELD"; field: TextFieldKey; value: string }
  | { type: "SET_GENDER"; value: Gender }
  | { type: "HYDRATE"; payload: Partial<AssessmentFormState> };

const EMPTY_RACKET: RacketDraft = {
  level: "",
  years_of_playing: "",
  matches_played: "",
  lessons_had: "",
};

export const initialFormState: AssessmentFormState = {
  selectedSports: [],
  racket: {},
  bigTournamentDivision: "",
  yearOfBirth: "",
  playtomicId: "",
  rankedinId: "",
  gender: "",
  instagramUsername: "",
  facebookUsername: "",
};

export function formReducer(
  state: AssessmentFormState,
  action: FormAction
): AssessmentFormState {
  switch (action.type) {
    case "TOGGLE_SPORT": {
      const has = state.selectedSports.includes(action.sport);
      const selectedSports = has
        ? state.selectedSports.filter((s) => s !== action.sport)
        : [...state.selectedSports, action.sport];
      const racket = { ...state.racket };
      if (has) delete racket[action.sport];
      else racket[action.sport] = { ...EMPTY_RACKET };
      return { ...state, selectedSports, racket };
    }
    case "SET_RACKET": {
      const current = state.racket[action.sport] ?? EMPTY_RACKET;
      return {
        ...state,
        racket: {
          ...state.racket,
          [action.sport]: { ...current, ...action.patch },
        },
      };
    }
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_GENDER":
      return { ...state, gender: action.value };
    case "HYDRATE":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

// ---------- Racket experience json ----------

function parseMeasure(raw: string, decimal: boolean): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return NaN;
  return decimal ? n : Math.floor(n);
}

export type RacketBuild = {
  entries: RacketExperienceEntry[];
  /** sport id → problem (missing level, no metric, invalid number). */
  errors: Record<string, string>;
};

/** Build the `racket_experience` json: sport + level + at least one metric per entry. */
export function buildRacketExperience(state: AssessmentFormState): RacketBuild {
  const entries: RacketExperienceEntry[] = [];
  const errors: Record<string, string> = {};

  for (const sport of state.selectedSports) {
    const draft = state.racket[sport] ?? EMPTY_RACKET;
    if (!draft.level) {
      errors[sport] = "Choose a level.";
      continue;
    }

    const entry: RacketExperienceEntry = { sport, level: draft.level };
    let invalid = false;
    let metrics = 0;
    for (const m of RACKET_MEASURES) {
      const parsed = parseMeasure(draft[m.key], m.decimal);
      if (parsed === null) continue;
      if (Number.isNaN(parsed)) {
        invalid = true;
        break;
      }
      entry[m.key] = parsed;
      metrics += 1;
    }
    if (invalid) errors[sport] = "Use positive numbers only.";
    else if (metrics === 0) errors[sport] = "Fill in at least one number.";
    else entries.push(entry);
  }

  return { entries, errors };
}

export function racketErrors(state: AssessmentFormState): Record<string, string> {
  return buildRacketExperience(state).errors;
}

// ---------- Year of birth ----------

/** Dropdown options: current year − 6 down to current year − 80. */
export function yearOfBirthOptions(now = new Date()): { label: string; value: string }[] {
  const current = now.getFullYear();
  const newest = current - 6;
  const oldest = current - 80;
  const options: { label: string; value: string }[] = [];
  for (let y = newest; y >= oldest; y -= 1) {
    options.push({ label: String(y), value: String(y) });
  }
  return options;
}

export function yearOfBirthError(raw: string, now = new Date()): string | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  const newest = now.getFullYear() - 6;
  const oldest = now.getFullYear() - 80;
  if (!/^\d{4}$/.test(trimmed) || n < oldest || n > newest) {
    return "Choose a year from the list.";
  }
  return null;
}

// ---------- To / from the backend ----------

/**
 * Answers to PATCH. Empty fields are skipped (an empty draft is a valid draft), as is the
 * racket field while no sport is selected.
 */
export function buildCustomFields(
  state: AssessmentFormState,
  only?: AssessmentFieldCode[]
): CustomFieldsPayload {
  const out: CustomFieldsPayload = {};
  const include = (code: AssessmentFieldCode) => !only || only.includes(code);

  const { entries } = buildRacketExperience(state);
  if (include("racket_experience") && entries.length > 0) {
    out.racket_experience = entries;
  }

  const text = (code: AssessmentFieldCode, raw: string) => {
    const v = raw.trim();
    if (include(code) && v !== "") out[code] = v;
  };
  if (include("big_tournament_division")) {
    const levelId = state.bigTournamentDivision.trim();
    if (levelId !== "" && /^\d+$/.test(levelId)) {
      out.big_tournament_division = Number(levelId);
    }
  }
  text("playtomic_id", state.playtomicId);
  text("rankedin_id", state.rankedinId);
  text("instagram_username", state.instagramUsername.replace(/^@/, ""));
  text("facebook_username", state.facebookUsername);

  const yob = state.yearOfBirth.trim();
  if (include("year_of_birth") && yob !== "" && yearOfBirthError(yob) === null) {
    out.year_of_birth = Number(yob);
  }

  if (include("gender") && state.gender) {
    out.gender = GENDER_OPTION_IDS[state.gender];
  }

  return out;
}

function asString(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function measureToString(v: unknown): string {
  if (v === null || v === undefined || v === "") return "";
  return String(v);
}

/** Reverse-map the pending assessment's saved answers into form fields. */
export function hydrateFromAssessment(
  assessment: PlayerLevelAssessment
): Partial<AssessmentFormState> {
  const values = assessment.submission?.values ?? [];
  const patch: Partial<AssessmentFormState> = {};

  for (const v of values) {
    const code = v.field?.code;
    if (!code) continue;
    const raw = v.value ?? v.value_json ?? v.value_integer ?? v.value_text;

    switch (code) {
      case "racket_experience": {
        if (!Array.isArray(raw)) break;
        const selectedSports: string[] = [];
        const racket: Record<string, RacketDraft> = {};
        for (const item of raw as RacketExperienceEntry[]) {
          if (!item?.sport) continue;
          selectedSports.push(item.sport);
          racket[item.sport] = {
            level: item.level ?? "",
            years_of_playing: measureToString(item.years_of_playing),
            matches_played: measureToString(item.matches_played),
            lessons_had: measureToString(item.lessons_had),
          };
        }
        patch.selectedSports = selectedSports;
        patch.racket = racket;
        break;
      }
      case "big_tournament_division":
        // Prefer foreign id; fall back to legacy free-text name (matched later in the UI).
        patch.bigTournamentDivision = asString(
          v.value_integer ?? (typeof raw === "number" ? raw : v.value_text ?? raw)
        );
        break;
      case "year_of_birth":
        patch.yearOfBirth = asString(v.value_integer ?? raw);
        break;
      case "playtomic_id":
        patch.playtomicId = asString(raw);
        break;
      case "rankedin_id":
        patch.rankedinId = asString(raw);
        break;
      case "gender": {
        const g = asString(raw).toLowerCase();
        patch.gender = g === "female" || g === "male" ? g : "";
        break;
      }
      case "instagram_username":
        patch.instagramUsername = asString(raw);
        break;
      case "facebook_username":
        patch.facebookUsername = asString(raw);
        break;
      default:
        break;
    }
  }

  return patch;
}

/** True when the assessment can still be edited (pending and not in the review queue). */
export function isDraftEditable(
  assessment: Pick<PlayerLevelAssessment, "review_status" | "ready_for_review">
): boolean {
  return assessment.review_status === "pending" && !assessment.ready_for_review;
}

/** True when the assessment is pending and waiting for the team (locked status view). */
export function isLockedForReview(
  assessment: Pick<PlayerLevelAssessment, "review_status" | "ready_for_review">
): boolean {
  return assessment.review_status === "pending" && assessment.ready_for_review;
}

/** Approved / rejected / discarded — closed; create a new pending instead of reopening. */
export function isTerminalAssessment(
  assessment: Pick<PlayerLevelAssessment, "review_status">
): boolean {
  return (
    assessment.review_status === "approved" ||
    assessment.review_status === "rejected" ||
    assessment.review_status === "discarded"
  );
}

/** Wizard opens on Status for ready / terminal assessments; Sports for editable drafts. */
export function initialStepForAssessment(
  assessment: Pick<PlayerLevelAssessment, "review_status" | "ready_for_review">
): number {
  return isDraftEditable(assessment) ? 1 : 4;
}

export type DirtyFieldKey =
  | TextFieldKey
  | "gender"
  | "selectedSports"
  | `racket:${string}`;

/** Field keys that differ from the last saved snapshot (for yellow borders). */
export function dirtyFieldKeys(
  current: AssessmentFormState,
  baseline: AssessmentFormState
): Set<DirtyFieldKey> {
  const dirty = new Set<DirtyFieldKey>();
  const textKeys: TextFieldKey[] = [
    "bigTournamentDivision",
    "yearOfBirth",
    "playtomicId",
    "rankedinId",
    "instagramUsername",
    "facebookUsername",
  ];
  for (const key of textKeys) {
    if (current[key] !== baseline[key]) dirty.add(key);
  }
  if (current.gender !== baseline.gender) dirty.add("gender");

  const sportsA = [...current.selectedSports].sort().join(",");
  const sportsB = [...baseline.selectedSports].sort().join(",");
  if (sportsA !== sportsB) dirty.add("selectedSports");

  const allSports = new Set([
    ...current.selectedSports,
    ...baseline.selectedSports,
  ]);
  for (const sport of allSports) {
    const a = current.racket[sport];
    const b = baseline.racket[sport];
    if (JSON.stringify(a ?? null) !== JSON.stringify(b ?? null)) {
      dirty.add(`racket:${sport}`);
    }
  }
  return dirty;
}

/**
 * Whether a previous wizard step has real content (for stepper checkmarks).
 * Not the same as stepIsValid — empty Sports is valid to skip but has no content.
 */
export function stepHasData(
  step: number,
  state: AssessmentFormState,
  assessment?: Pick<PlayerLevelAssessment, "profile_images"> | null
): boolean {
  if (step === 1) {
    if (state.selectedSports.length === 0) return false;
    return Object.keys(racketErrors(state)).length === 0;
  }
  if (step === 2) {
    return (
      state.bigTournamentDivision.trim() !== "" ||
      state.yearOfBirth.trim() !== "" ||
      state.playtomicId.trim() !== "" ||
      state.rankedinId.trim() !== "" ||
      state.instagramUsername.trim() !== "" ||
      state.facebookUsername.trim() !== "" ||
      state.gender !== ""
    );
  }
  if (step === 3) {
    return (assessment?.profile_images?.length ?? 0) > 0;
  }
  return false;
}

/** True when the given wizard step has unsaved local edits. */
export function stepIsDirty(
  step: number,
  dirty: ReadonlySet<DirtyFieldKey>
): boolean {
  if (step === 1) {
    if (dirty.has("selectedSports")) return true;
    for (const key of dirty) {
      if (typeof key === "string" && key.startsWith("racket:")) return true;
    }
    return false;
  }
  if (step === 2) {
    return (
      dirty.has("bigTournamentDivision") ||
      dirty.has("yearOfBirth") ||
      dirty.has("playtomicId") ||
      dirty.has("rankedinId") ||
      dirty.has("instagramUsername") ||
      dirty.has("facebookUsername") ||
      dirty.has("gender")
    );
  }
  // Photo uploads immediately; Status has no local form fields.
  return false;
}

/** Custom-field codes owned by a wizard step (for scoped PATCH). */
export function fieldCodesForStep(step: number): AssessmentFieldCode[] | undefined {
  if (step === 1) return ["racket_experience"];
  if (step === 2) {
    return [
      "big_tournament_division",
      "year_of_birth",
      "playtomic_id",
      "rankedin_id",
      "gender",
      "instagram_username",
      "facebook_username",
    ];
  }
  return undefined;
}
