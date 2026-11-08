import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AssessmentStatusView, {
  leaveLabelForAssessment,
  shouldShowReviewMessage,
} from '@/components/LevelAssessment/AssessmentStatusView';
import { makeAssessment } from '@/testing/fixtures';

describe('shouldShowReviewMessage', () => {
  it('shows only for approved/rejected with non-empty message', () => {
    expect(
      shouldShowReviewMessage({
        review_status: 'approved',
        review_message: 'Nice',
      })
    ).toBe(true);
    expect(
      shouldShowReviewMessage({
        review_status: 'rejected',
        review_message: 'No',
      })
    ).toBe(true);
    expect(
      shouldShowReviewMessage({
        review_status: 'pending',
        review_message: 'Hidden',
      })
    ).toBe(false);
    expect(
      shouldShowReviewMessage({
        review_status: 'discarded',
        review_message: 'Hidden',
      })
    ).toBe(false);
    expect(
      shouldShowReviewMessage({
        review_status: 'approved',
        review_message: '   ',
      })
    ).toBe(false);
  });
});

describe('leaveLabelForAssessment', () => {
  it('uses Finish it later for editable drafts and Close otherwise', () => {
    expect(leaveLabelForAssessment(makeAssessment())).toBe('Finish it later');
    expect(
      leaveLabelForAssessment(makeAssessment({ ready_for_review: true }))
    ).toBe('Close');
    expect(
      leaveLabelForAssessment(makeAssessment({ review_status: 'approved' }))
    ).toBe('Close');
    expect(
      leaveLabelForAssessment(makeAssessment({ review_status: 'rejected' }))
    ).toBe('Close');
    expect(
      leaveLabelForAssessment(makeAssessment({ review_status: 'discarded' }))
    ).toBe('Close');
  });
});

describe('AssessmentStatusView', () => {
  it('renders Submit and Discard for editable pending drafts', () => {
    render(
      <AssessmentStatusView
        assessment={makeAssessment()}
        onSubmitForReview={jest.fn()}
        onDiscard={jest.fn()}
      />
    );
    expect(screen.getByTestId('assessment-submit-for-review')).toBeTruthy();
    expect(screen.getByTestId('assessment-discard')).toBeTruthy();
    expect(screen.queryByText('Done')).toBeNull();
    expect(screen.queryByTestId('assessment-status-meta')).toBeNull();
    expect(screen.queryByText(/Everything is optional/i)).toBeNull();
    expect(screen.queryByTestId('assessment-reopen')).toBeNull();
    expect(screen.queryByTestId('assessment-create-new')).toBeNull();
  });

  it('renders Reopen when ready for review', () => {
    render(
      <AssessmentStatusView
        assessment={makeAssessment({ ready_for_review: true })}
        onReopen={jest.fn()}
      />
    );
    expect(screen.getByTestId('assessment-reopen')).toBeTruthy();
    expect(screen.queryByTestId('assessment-submit-for-review')).toBeNull();
  });

  it('renders Create new and review_message when approved', () => {
    render(
      <AssessmentStatusView
        assessment={makeAssessment({
          review_status: 'approved',
          review_message: 'Band set',
        })}
        onCreateNew={jest.fn()}
      />
    );
    expect(screen.getByTestId('assessment-create-new')).toBeTruthy();
    expect(screen.getByTestId('assessment-review-message')).toBeTruthy();
    expect(screen.getByText('Band set')).toBeTruthy();
  });

  it('exposes loading on Discard / Submit / Reopen / Create', () => {
    const { rerender } = render(
      <AssessmentStatusView
        assessment={makeAssessment()}
        onSubmitForReview={jest.fn()}
        onDiscard={jest.fn()}
        submitting
        discarding
      />
    );
    expect(screen.getByTestId('assessment-submit-for-review-loading')).toBeTruthy();
    expect(screen.getByTestId('assessment-discard-loading')).toBeTruthy();

    rerender(
      <AssessmentStatusView
        assessment={makeAssessment({ ready_for_review: true })}
        onReopen={jest.fn()}
        reopening
      />
    );
    expect(screen.getByTestId('assessment-reopen-loading')).toBeTruthy();

    rerender(
      <AssessmentStatusView
        assessment={makeAssessment({ review_status: 'approved' })}
        onCreateNew={jest.fn()}
        creating
      />
    );
    expect(screen.getByTestId('assessment-create-new-loading')).toBeTruthy();
  });
});
