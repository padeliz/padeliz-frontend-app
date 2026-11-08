import {
  progressItemSubtitle,
  progressItemTitle,
} from '@/services/levelProgressDisplay';
import { makeAssessment, makePlayerLevel } from '@/testing/fixtures';
import type { LevelProgressItem } from '@/types/api';

describe('levelProgressDisplay', () => {
  it('titles player_level by band and nests assessment status in subtitle', () => {
    const item: LevelProgressItem = {
      kind: 'player_level',
      inserted_at: 1_700_000_000,
      player_level: makePlayerLevel({
        band_name: 'Advanced',
        assessment: makeAssessment({ review_status: 'approved' }),
      }),
    };
    expect(progressItemTitle(item)).toBe('Advanced');
    expect(progressItemSubtitle(item)).toMatch(/Approved assessment/);
  });

  it('uses From event copy for participation rows', () => {
    const item: LevelProgressItem = {
      kind: 'player_level',
      inserted_at: 1_700_000_000,
      player_level: makePlayerLevel({
        band_name: 'Intermediate',
        player_level_assessment_id: null,
        assessment: null,
        participation: {
          id_participation: 1,
          event_id: 42,
          player_user_id: 9,
          inserted_at: 1_700_000_000,
          event: { id_event: 42, name: 'City Cup' },
        },
      }),
    };
    expect(progressItemSubtitle(item)).toMatch(/^From event: City Cup/);
  });

  it('titles standalone assessments by status', () => {
    const item: LevelProgressItem = {
      kind: 'level_assessment',
      inserted_at: 1_700_000_000,
      assessment: makeAssessment({
        review_status: 'pending',
        ready_for_review: true,
      }),
    };
    expect(progressItemTitle(item)).toBe('Assessment in review');
  });
});
