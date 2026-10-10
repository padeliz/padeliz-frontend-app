import { View, Text, StyleSheet } from 'react-native';
import StatusBanner from '@/components/Feedback/StatusBanner';
import Button from '@/components/Buttons/Button';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import {
  isDraftEditable,
  isLockedForReview,
  isTerminalAssessment,
} from '@/services/levelAssessmentForm';
import type { PlayerLevelAssessment } from '@/types/api';

type Props = {
  assessment: PlayerLevelAssessment;
  reopening?: boolean;
  creating?: boolean;
  submitting?: boolean;
  discarding?: boolean;
  onReopen?: () => void;
  onSubmitForReview?: () => void;
  onCreateNew?: () => void;
  onDiscard?: () => void;
  onFinishLater: () => void;
};

function shouldShowReviewMessage(
  assessment: Pick<PlayerLevelAssessment, 'review_status' | 'review_message'>
): boolean {
  if (!assessment.review_message?.trim()) return false;
  return assessment.review_status === 'approved' || assessment.review_status === 'rejected';
}

/**
 * Status step body. Bottom StepNavButtons are never rendered for this step by the wizard.
 */
export default function AssessmentStatusView({
  assessment,
  reopening,
  creating,
  submitting,
  discarding,
  onReopen,
  onSubmitForReview,
  onCreateNew,
  onDiscard,
  onFinishLater,
}: Props) {
  const editable = isDraftEditable(assessment);
  const locked = isLockedForReview(assessment);
  const terminal = isTerminalAssessment(assessment);
  const showMessage = shouldShowReviewMessage(assessment);

  let heading = 'Ready to send?';
  let body =
    'You can submit as it is. Once submitted the assessment is locked while our team reviews it.';

  if (locked) {
    heading = 'Your level assessment is in review';
    body =
      'Our team is reviewing your answers. This typically takes 1-2 business days. You will get your level once it is approved.';
  } else if (assessment.review_status === 'approved') {
    heading = 'Assessment approved';
    body = 'Your level has been set from this assessment.';
  } else if (assessment.review_status === 'rejected') {
    heading = 'Assessment rejected';
    body = 'This assessment was not approved. You can start a new one when you are ready.';
  } else if (assessment.review_status === 'discarded') {
    heading = 'Assessment discarded';
    body = 'This assessment was discarded. You can start a new one when you are ready.';
  }

  return (
    <View style={styles.container} testID="assessment-status">
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.body}>{body}</Text>

      {showMessage ? (
        <View testID="assessment-review-message">
          <StatusBanner
            style={styles.banner}
            variant={assessment.review_status === 'approved' ? 'success' : 'error'}
            message={assessment.review_message!.trim()}
          />
        </View>
      ) : null}

      {locked ? (
        <StatusBanner
          style={styles.banner}
          variant="warning"
          message="Locked while in review. Reopen it if you need to change something."
        />
      ) : null}

      <View style={styles.actions}>
        {editable && onSubmitForReview ? (
          <Button
            label="Submit for Review"
            onPress={onSubmitForReview}
            loading={submitting}
            testID="assessment-submit-for-review"
          />
        ) : null}

        {locked && onReopen ? (
          <Button
            label="Reopen to edit"
            variant="secondary"
            onPress={onReopen}
            loading={reopening}
            testID="assessment-reopen"
          />
        ) : null}

        {terminal && onCreateNew ? (
          <Button
            label="Create new assessment"
            onPress={onCreateNew}
            loading={creating}
            testID="assessment-create-new"
          />
        ) : null}

        {editable && onDiscard ? (
          <Button
            label="Discard assessment"
            variant="secondary"
            onPress={onDiscard}
            loading={discarding}
            testID="assessment-discard"
            style={styles.discard}
            labelStyle={styles.discardLabel}
          />
        ) : null}
      </View>

      <View style={styles.stickyFooter}>
        <Button
          label="Finish it later"
          variant="secondary"
          onPress={onFinishLater}
          testID="assessment-finish-later"
        />
      </View>
    </View>
  );
}

export { shouldShowReviewMessage };

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    flex: 1,
  },
  heading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_2,
    lineHeight: 26,
    color: Colors.WHITE,
  },
  body: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 20,
    color: Colors.CREAM,
    marginTop: 12,
  },
  banner: {
    marginTop: 20,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  discard: {
    backgroundColor: Colors.RED_T,
    borderWidth: 1,
    borderColor: Colors.RED,
  },
  discardLabel: {
    color: Colors.RED,
  },
  stickyFooter: {
    marginTop: 32,
    paddingTop: 12,
  },
});
