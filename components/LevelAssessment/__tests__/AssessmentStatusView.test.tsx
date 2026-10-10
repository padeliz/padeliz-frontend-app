import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AssessmentStatusView, {
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

describe('AssessmentStatusView', () => {
  const finishLater = jest.fn();

  it('renders Submit, Discard, and Finish later for editable pending drafts', () => {
    render(
      <AssessmentStatusView
        assessment={makeAssessment()}
        onSubmitForReview={jest.fn()}
        onDiscard={jest.fn()}
        onFinishLater={finishLater}
      />
    );
    expect(screen.getByTestId('assessment-submit-for-review')).toBeTruthy();
    expect(screen.getByTestId('assessment-discard')).toBeTruthy();
    expect(screen.getByTestId('assessment-finish-later')).toBeTruthy();
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
        onFinishLater={finishLater}
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
        onFinishLater={finishLater}
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
        onFinishLater={finishLater}
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
        onFinishLater={finishLater}
        reopening
      />
    );
    expect(screen.getByTestId('assessment-reopen-loading')).toBeTruthy();

    rerender(
      <AssessmentStatusView
        assessment={makeAssessment({ review_status: 'approved' })}
        onCreateNew={jest.fn()}
        onFinishLater={finishLater}
        creating
      />
    );
    expect(screen.getByTestId('assessment-create-new-loading')).toBeTruthy();
  });
});
