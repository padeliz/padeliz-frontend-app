import {
  findActiveProof,
  findLapsedApprovedProof,
  hasPriorSubmittedOrTerminalAssessment,
  levelAssessCta,
  studentProofCta,
} from '@/services/accountStatusCta';
import type { PlayerLevelAssessment, PlayerStudentProof } from '@/types/api';

function assessment(
  overrides: Partial<PlayerLevelAssessment> = {}
): PlayerLevelAssessment {
  return {
    id_player_level_assessment: 1,
    player_user_id: 1,
    player_custom_field_submission_id: null,
    submitted_at: null,
    resubmitted_at: null,
    ready_for_review: false,
    reviewed_at: null,
    review_status: 'pending',
    review_message: null,
    inserted_at: 1,
    updated_at: null,
    ...overrides,
  };
}

function proof(overrides: Partial<PlayerStudentProof> = {}): PlayerStudentProof {
  return {
    id_player_student_proof: 1,
    player_user_id: 1,
    student_until: '2027-08-20',
    ready_for_review: false,
    review_status: 'pending',
    review_message: null,
    submitted_at: null,
    reviewed_at: null,
    files: [],
    inserted_at: 1,
    updated_at: null,
    ...overrides,
  };
}

describe('levelAssessCta', () => {
  it('returns See pending when in review and includeSeePending', () => {
    const pending = assessment({ ready_for_review: true, submitted_at: 10 });
    expect(levelAssessCta({ pendingOrLatest: pending, assessmentsForHistory: [pending] })).toEqual({
      kind: 'see_pending',
      label: 'See your pending assessment',
    });
  });

  it('skips See pending for Account assess button', () => {
    const pending = assessment({ ready_for_review: true, submitted_at: 10 });
    expect(
      levelAssessCta({
        pendingOrLatest: pending,
        assessmentsForHistory: [pending],
        includeSeePending: false,
      }).label
    ).toBe('Assess My Level Again');
  });

  it('returns Assess My Level for sole unsubmitted draft', () => {
    const draft = assessment();
    expect(
      levelAssessCta({ pendingOrLatest: draft, assessmentsForHistory: [draft] })
    ).toEqual({ kind: 'first', label: 'Assess My Level' });
  });

  it('returns Again for terminal history', () => {
    expect(
      hasPriorSubmittedOrTerminalAssessment([
        assessment({ review_status: 'rejected', submitted_at: 1 }),
      ])
    ).toBe(true);
    expect(
      levelAssessCta({
        pendingOrLatest: null,
        assessmentsForHistory: [
          assessment({ review_status: 'approved', submitted_at: 1 }),
        ],
      }).label
    ).toBe('Assess My Level Again');
  });
});

describe('studentProofCta', () => {
  it('returns See pending when in review', () => {
    const pending = proof({ ready_for_review: true, submitted_at: 5 });
    expect(studentProofCta({ pending, items: [pending] }).label).toBe(
      'See your pending proof'
    );
  });

  it('returns New when a prior submitted proof exists', () => {
    expect(
      studentProofCta({
        pending: null,
        items: [proof({ submitted_at: 1, review_status: 'approved' })],
      }).label
    ).toBe('Submit New Student Proof');
  });

  it('returns first otherwise', () => {
    expect(studentProofCta({ pending: null, items: [] }).label).toBe(
      'Submit Student Proof'
    );
  });
});

describe('active / lapsed proofs', () => {
  it('finds active and lapsed approved proofs', () => {
    const active = proof({
      review_status: 'approved',
      student_until: '2027-08-20',
      submitted_at: 1,
    });
    const lapsed = proof({
      id_player_student_proof: 2,
      review_status: 'approved',
      student_until: '2020-01-01',
      submitted_at: 1,
    });
    expect(findActiveProof([active, lapsed], '2026-11-07')?.id_player_student_proof).toBe(1);
    expect(findLapsedApprovedProof([lapsed], '2026-11-07')?.student_until).toBe('2020-01-01');
  });
});
