import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import type { PaymentCoverageItem } from '@/types/api';

export type PaymentRecordDetail = {
  kind: 'attempt' | 'proof';
  title: string;
  amount?: number;
  status: string;
  orderId?: string | null;
  ntpId?: string | null;
  startedAt?: number | null;
  submittedAt?: number | null;
  reviewedAt?: number | null;
  reviewedLabel?: 'Approved' | 'Rejected';
  errorMessage?: string | null;
  reviewMessage?: string | null;
  proofUrl?: string | null;
  coverage: PaymentCoverageItem[];
  /** Bank transfer proof still awaiting review; modal offers Cancel proof. */
  canCancelProof?: boolean;
};

type Props = {
  visible: boolean;
  detail: PaymentRecordDetail | null;
  onClose: () => void;
  onCancelProof?: () => void;
  cancelling?: boolean;
};

function formatWhen(ts: number | null | undefined): string | null {
  if (ts == null || ts <= 0) return null;
  return new Date(ts * 1000).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Field({ label, value, testID }: { label: string; value: string; testID?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue} testID={testID}>
        {value}
      </Text>
    </View>
  );
}

export default function PaymentRecordDetailModal({
  visible,
  detail,
  onClose,
  onCancelProof,
  cancelling = false,
}: Props) {
  if (!detail) {
    return (
      <Modal visible={false} transparent onRequestClose={onClose}>
        <View />
      </Modal>
    );
  }

  const started = formatWhen(detail.startedAt);
  const submitted = formatWhen(detail.submittedAt);
  const reviewed = formatWhen(detail.reviewedAt);

  const dismiss = () => {
    if (cancelling) return;
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} testID="payment-record-detail-modal">
          <Text style={styles.title}>{detail.title}</Text>
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {detail.amount != null ? (
              <Field label="Amount" value={`RON ${detail.amount}`} testID="detail-amount" />
            ) : null}
            <Field label="Status" value={detail.status} testID="detail-status" />
            {detail.orderId ? (
              <Field label="Order ID" value={detail.orderId} testID="detail-order-id" />
            ) : null}
            {detail.ntpId ? (
              <Field label="NTP ID" value={detail.ntpId} testID="detail-ntp-id" />
            ) : null}
            {started ? (
              <Field label="Started" value={started} testID="detail-started" />
            ) : null}
            {submitted ? (
              <Field label="Submitted" value={submitted} testID="detail-submitted" />
            ) : null}
            {reviewed && detail.reviewedLabel ? (
              <Field
                label={detail.reviewedLabel}
                value={reviewed}
                testID="detail-reviewed"
              />
            ) : null}
            {detail.errorMessage ? (
              <Field
                label="Error"
                value={detail.errorMessage}
                testID="detail-error-message"
              />
            ) : null}
            {detail.reviewMessage ? (
              <Field
                label="Review message"
                value={detail.reviewMessage}
                testID="detail-review-message"
              />
            ) : null}
            {detail.proofUrl ? (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Proof</Text>
                <Image
                  source={{ uri: detail.proofUrl }}
                  style={styles.proofImage}
                  testID="detail-proof-image"
                />
              </View>
            ) : null}
            {detail.coverage.length > 0 ? (
              <View style={styles.field} testID="detail-divisions">
                <Text style={styles.fieldLabel}>Divisions</Text>
                <View style={styles.badges}>
                  {detail.coverage.map((c) => (
                    <View
                      key={`${c.registration_id}-${c.division_title}`}
                      style={[
                        styles.badge,
                        { backgroundColor: c.division_color || Colors.GRAY },
                      ]}
                    >
                      <Text style={styles.badgeText}>{c.division_title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </ScrollView>
          {detail.canCancelProof ? (
            <Pressable
              style={[
                styles.cancelProofBtn,
                (cancelling || !onCancelProof) && styles.btnDisabled,
              ]}
              onPress={onCancelProof}
              disabled={cancelling || !onCancelProof}
              testID="payment-record-cancel-proof"
            >
              <Text style={styles.cancelProofBtnText}>
                {cancelling ? 'Cancelling…' : 'Cancel proof'}
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.closeBtn, cancelling && styles.btnDisabled]}
            onPress={dismiss}
            disabled={cancelling}
            testID="payment-record-detail-close"
          >
            <Text style={styles.closeBtnText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  sheet: {
    backgroundColor: Colors.DARK_GRAY,
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.CREAM_10,
  },
  title: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
    marginBottom: 12,
  },
  body: { maxHeight: 360 },
  bodyContent: { gap: 12, paddingBottom: 8 },
  field: { gap: 4 },
  fieldLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  fieldValue: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  proofImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: Colors.GRAY,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_XS,
    color: Colors.WHITE,
  },
  cancelProofBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelProofBtnText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  closeBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
});
