import {
  buildCustomFields,
  buildRacketExperience,
  dirtyFieldKeys,
  formReducer,
  hydrateFromAssessment,
  initialFormState,
  initialStepForAssessment,
  isDraftEditable,
  isLockedForReview,
  isTerminalAssessment,
  stepHasData,
  stepIsDirty,
  yearOfBirthError,
  yearOfBirthOptions,
  type AssessmentFormState,
} from '@/services/levelAssessmentForm';
import { makeAssessment } from '@/testing/fixtures';

function withPadel(patch: Partial<AssessmentFormState['racket'][string]>) {
  let state = formReducer(initialFormState, { type: 'TOGGLE_SPORT', sport: 'padel' });
  state = formReducer(state, { type: 'SET_RACKET', sport: 'padel', patch });
  return state;
}

describe('racket_experience json', () => {
  it('builds sport + level + at least one metric per entry', () => {
    let state = withPadel({ level: 'advanced', years_of_playing: '2.5', matches_played: '40' });
    state = formReducer(state, { type: 'TOGGLE_SPORT', sport: 'tennis' });
    state = formReducer(state, {
      type: 'SET_RACKET',
      sport: 'tennis',
      patch: { level: 'amateur', lessons_had: '12' },
    });

    expect(buildRacketExperience(state)).toEqual({
      entries: [
        { sport: 'padel', level: 'advanced', years_of_playing: 2.5, matches_played: 40 },
        { sport: 'tennis', level: 'amateur', lessons_had: 12 },
      ],
      errors: {},
    });
  });

  it('rejects an entry without a level or without any metric', () => {
    expect(buildRacketExperience(withPadel({ matches_played: '3' })).errors.padel).toMatch(/level/i);
    expect(buildRacketExperience(withPadel({ level: 'amateur' })).errors.padel).toMatch(
      /at least one/i
    );
    expect(
      buildRacketExperience(withPadel({ level: 'amateur', matches_played: '-1' })).errors.padel
    ).toMatch(/positive/i);
  });

  it('drops a sport (and its draft) when toggled off', () => {
    const state = formReducer(withPadel({ level: 'amateur' }), {
      type: 'TOGGLE_SPORT',
      sport: 'padel',
    });
    expect(state.selectedSports).toEqual([]);
    expect(state.racket.padel).toBeUndefined();
  });
});

describe('buildCustomFields', () => {
  it('is empty for an empty draft (marking ready empty is allowed)', () => {
    expect(buildCustomFields(initialFormState)).toEqual({});
  });

  it('maps every assessment field and nothing about names or phone', () => {
    let state = withPadel({ level: 'amateur', years_of_playing: '1' });
    state = {
      ...state,
      bigTournamentDivision: '12',
      yearOfBirth: '1999',
      playtomicId: '12345',
      rankedinId: '678',
      gender: 'female',
      instagramUsername: '@ana',
      facebookUsername: 'ana.pop',
    };
    const fields = buildCustomFields(state);
    expect(fields).toEqual({
      racket_experience: [{ sport: 'padel', level: 'amateur', years_of_playing: 1 }],
      big_tournament_division: 12,
      year_of_birth: 1999,
      playtomic_id: '12345',
      rankedin_id: '678',
      gender: expect.any(Number),
      instagram_username: 'ana',
      facebook_username: 'ana.pop',
    });
    expect(Object.keys(fields)).not.toContain('first_name');
    expect(Object.keys(fields)).not.toContain('last_name');
    expect(Object.keys(fields)).not.toContain('phone');
  });

  it('sends big_tournament_division as an integer level id only', () => {
    expect(
      buildCustomFields({ ...initialFormState, bigTournamentDivision: '42' })
    ).toEqual({ big_tournament_division: 42 });
    expect(
      buildCustomFields({ ...initialFormState, bigTournamentDivision: 'Div 2' })
    ).toEqual({});
  });

  it('skips an incomplete racket entry and an invalid year', () => {
    const state = { ...withPadel({ level: 'amateur' }), yearOfBirth: '99' };
    expect(buildCustomFields(state)).toEqual({});
    expect(yearOfBirthError('99')).toBeTruthy();
    expect(yearOfBirthError('1999')).toBeNull();
    expect(yearOfBirthError('')).toBeNull();
  });
});

describe('hydrateFromAssessment', () => {
  it('restores a saved draft into form fields', () => {
    const assessment = makeAssessment({
      submission: {
        id_player_custom_field_submission: 77,
        values: [
          {
            id_player_custom_field_value: 1,
            player_custom_field_id: 1,
            field: { id_player_custom_field: 1, code: 'racket_experience' },
            value: [{ sport: 'padel', level: 'advanced', matches_played: 30 }],
          },
          {
            id_player_custom_field_value: 2,
            player_custom_field_id: 3,
            field: { id_player_custom_field: 3, code: 'year_of_birth' },
            value: 1999,
            value_integer: 1999,
          },
          {
            id_player_custom_field_value: 3,
            player_custom_field_id: 6,
            field: { id_player_custom_field: 6, code: 'gender' },
            value: 'Female',
          },
          {
            id_player_custom_field_value: 4,
            player_custom_field_id: 2,
            field: { id_player_custom_field: 2, code: 'big_tournament_division' },
            value: 'Division 3 Mid',
            value_integer: 32,
            value_text: 'Division 3 Mid',
          },
        ],
      },
    });

    const patch = hydrateFromAssessment(assessment);
    expect(patch.selectedSports).toEqual(['padel']);
    expect(patch.racket?.padel).toMatchObject({ level: 'advanced', matches_played: '30' });
    expect(patch.yearOfBirth).toBe('1999');
    expect(patch.gender).toBe('female');
    expect(patch.bigTournamentDivision).toBe('32');
  });
});

describe('stepHasData', () => {
  it('treats empty Sports as incomplete even though skip is allowed', () => {
    expect(stepHasData(1, initialFormState)).toBe(false);
  });

  it('rejects partial racket entries', () => {
    expect(stepHasData(1, withPadel({ level: 'amateur' }))).toBe(false);
  });

  it('accepts valid sports content', () => {
    expect(stepHasData(1, withPadel({ level: 'amateur', matches_played: '3' }))).toBe(true);
  });

  it('detects Details content and Photo gallery images', () => {
    expect(stepHasData(2, { ...initialFormState, playtomicId: '1' })).toBe(true);
    expect(stepHasData(2, initialFormState)).toBe(false);
    expect(
      stepHasData(3, initialFormState, {
        profile_images: [{ id: 1, url: 'https://cdn.example/a.png' }],
      })
    ).toBe(true);
    expect(stepHasData(3, initialFormState, { profile_images: [] })).toBe(false);
    expect(stepHasData(4, initialFormState)).toBe(false);
  });
});

describe('draft vs locked', () => {
  it('is editable only while pending and not ready for review', () => {
    expect(isDraftEditable(makeAssessment())).toBe(true);
    expect(isDraftEditable(makeAssessment({ ready_for_review: true }))).toBe(false);
    expect(isDraftEditable(makeAssessment({ review_status: 'approved' }))).toBe(false);
  });

  it('is locked when pending and ready for review', () => {
    expect(isLockedForReview(makeAssessment({ ready_for_review: true }))).toBe(true);
    expect(isLockedForReview(makeAssessment())).toBe(false);
  });

  it('treats approved/rejected/discarded as terminal', () => {
    expect(isTerminalAssessment(makeAssessment({ review_status: 'approved' }))).toBe(true);
    expect(isTerminalAssessment(makeAssessment({ review_status: 'rejected' }))).toBe(true);
    expect(isTerminalAssessment(makeAssessment({ review_status: 'discarded' }))).toBe(true);
    expect(isTerminalAssessment(makeAssessment())).toBe(false);
  });

  it('opens Sports for drafts and Status otherwise', () => {
    expect(initialStepForAssessment(makeAssessment())).toBe(1);
    expect(initialStepForAssessment(makeAssessment({ ready_for_review: true }))).toBe(4);
    expect(initialStepForAssessment(makeAssessment({ review_status: 'approved' }))).toBe(4);
  });
});

describe('dirty tracking', () => {
  it('flags changed details fields and step dirtiness', () => {
    const baseline = initialFormState;
    const current = { ...initialFormState, playtomicId: 'https://playtomic.com/profile/user/1' };
    const dirty = dirtyFieldKeys(current, baseline);
    expect(dirty.has('playtomicId')).toBe(true);
    expect(stepIsDirty(2, dirty)).toBe(true);
    expect(stepIsDirty(1, dirty)).toBe(false);
  });

  it('YOB options span now-6 .. now-80', () => {
    const opts = yearOfBirthOptions(new Date('2026-01-01T00:00:00Z'));
    expect(opts[0].value).toBe('2020');
    expect(opts[opts.length - 1].value).toBe('1946');
    expect(yearOfBirthError('2020', new Date('2026-01-01'))).toBeNull();
    expect(yearOfBirthError('2021', new Date('2026-01-01'))).toBeTruthy();
  });
});
