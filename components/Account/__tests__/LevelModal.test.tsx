import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import LevelModal from '@/components/Account/LevelModal';
import { makeAssessment, makePlayerLevel } from '@/testing/fixtures';
import type { LevelProgressItem } from '@/types/api';

const mockProgressItems: LevelProgressItem[] = [];
jest.mock('@/services/hooks/useLevelAssessment', () => ({
  useLevelProgress: () => ({
    data: { items: mockProgressItems },
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

function renderModal(
  overrides: Partial<React.ComponentProps<typeof LevelModal>> = {}
) {
  const props: React.ComponentProps<typeof LevelModal> = {
    level: makePlayerLevel({ band_name: 'Advanced', level: '4.50' }),
    levels: null,
    visible: true,
    starting: false,
    error: null,
    pendingOrLatest: null,
    assessmentsForHistory: [],
    onClose: jest.fn(),
    onAssess: jest.fn(),
    onSeePending: jest.fn(),
    ...overrides,
  };
  return { ...render(<LevelModal {...props} />), props };
}

beforeEach(() => {
  mockProgressItems.length = 0;
});

describe('LevelModal', () => {
  it('shows My Level / My Progress tabs', () => {
    renderModal();
    expect(screen.getByTestId('level-modal-tab-level')).toBeTruthy();
    expect(screen.getByText('My Level')).toBeTruthy();
    expect(screen.getByTestId('level-modal-tab-progress')).toBeTruthy();
    expect(screen.getByText('My Progress')).toBeTruthy();
  });

  it('uses See your pending assessment CTA when in review', () => {
    const pending = makeAssessment({
      ready_for_review: true,
      review_status: 'pending',
      submitted_at: 10,
    });
    const { props } = renderModal({
      pendingOrLatest: pending,
      assessmentsForHistory: [pending],
    });

    fireEvent.press(screen.getByText('See your pending assessment'));
    expect(props.onSeePending).toHaveBeenCalled();
    expect(props.onAssess).not.toHaveBeenCalled();
  });

  it('uses Assess My Level Again when history has submitted/terminal', () => {
    const terminal = makeAssessment({
      review_status: 'approved',
      submitted_at: 10,
      ready_for_review: false,
    });
    const { props } = renderModal({
      pendingOrLatest: terminal,
      assessmentsForHistory: [terminal],
    });

    fireEvent.press(screen.getByText('Assess My Level Again'));
    expect(props.onAssess).toHaveBeenCalled();
  });

  it('uses Assess My Level for first-time / unsubmitted draft', () => {
    const draft = makeAssessment();
    renderModal({ pendingOrLatest: draft, assessmentsForHistory: [draft] });
    expect(screen.getByText('Assess My Level')).toBeTruthy();
  });

  it('renders nested assessment and From event progress rows', () => {
    mockProgressItems.push(
      {
        kind: 'player_level',
        inserted_at: 1_700_000_100,
        player_level: makePlayerLevel({
          band_name: 'Advanced',
          assessment: makeAssessment({ review_status: 'approved' }),
        }),
      },
      {
        kind: 'player_level',
        inserted_at: 1_700_000_050,
        player_level: makePlayerLevel({
          band_name: 'Intermediate',
          player_level_assessment_id: null,
          assessment: null,
          participation: {
            id_participation: 1,
            event_id: 42,
            player_user_id: 9,
            inserted_at: 1_700_000_050,
            event: { id_event: 42, name: 'Spring Open' },
          },
        }),
      },
      {
        kind: 'level_assessment',
        inserted_at: 1_700_000_000,
        assessment: makeAssessment({
          review_status: 'rejected',
          ready_for_review: false,
        }),
      }
    );
    renderModal();
    fireEvent.press(screen.getByTestId('level-modal-tab-progress'));

    expect(screen.getByText('Advanced')).toBeTruthy();
    expect(screen.getByText(/Approved assessment/)).toBeTruthy();
    expect(screen.getByText(/From event: Spring Open/)).toBeTruthy();
    expect(screen.getByText('Assessment rejected')).toBeTruthy();
  });

  it('shows 3 progress rows then Show more adds up to 2 and hides when exhausted', () => {
    for (let i = 0; i < 6; i += 1) {
      mockProgressItems.push({
        kind: 'level_assessment',
        inserted_at: 1_700_000_000 - i,
        assessment: makeAssessment({
          id_player_level_assessment: i + 1,
          review_status: 'rejected',
        }),
      });
    }
    renderModal();
    fireEvent.press(screen.getByTestId('level-modal-tab-progress'));

    expect(screen.getByTestId('level-progress-row-0')).toBeTruthy();
    expect(screen.getByTestId('level-progress-row-2')).toBeTruthy();
    expect(screen.queryByTestId('level-progress-row-3')).toBeNull();
    expect(screen.getByTestId('level-progress-show-more')).toBeTruthy();

    fireEvent.press(screen.getByTestId('level-progress-show-more'));
    expect(screen.getByTestId('level-progress-row-4')).toBeTruthy();
    expect(screen.queryByTestId('level-progress-row-5')).toBeNull();

    fireEvent.press(screen.getByTestId('level-progress-show-more'));
    expect(screen.getByTestId('level-progress-row-5')).toBeTruthy();
    expect(screen.queryByTestId('level-progress-show-more')).toBeNull();
  });
});
