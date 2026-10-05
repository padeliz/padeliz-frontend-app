import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import type {
  EventRegistrationCheckout,
  PaymentCoverageItem,
  RegistrationPaymentAttempt,
  RegistrationPaymentProof,
} from '@/types/api';
import PaymentRecordDetailModal, {
  type PaymentRecordDetail,
} from './PaymentRecordDetailModal';

const COLLAPSED_ROW_COUNT = 2;

type HistoryRow = {
  kind: 'attempt' | 'proof';
  id: string;
  inserted_at: number;
  amount?: number;
  status: string;
  coverage: PaymentCoverageItem[];
  attempt?: RegistrationPaymentAttempt;
  proof?: RegistrationPaymentProof;
};

function rowsFromCheckouts(checkouts: EventRegistrationCheckout[]): HistoryRow[] {
  const rows: HistoryRow[] = [];
  for (const checkout of checkouts) {
    for (const attempt of checkout.payment_attempts ?? []) {
      rows.push({
        kind: 'attempt',
        id: `attempt-${attempt.id_payment_attempt}`,
        inserted_at: attempt.inserted_at,
        amount: attempt.amount,
        status: String(attempt.status),
        coverage: attempt.coverage ?? [],
        attempt,
      });
    }
    for (const proof of checkout.payment_proofs ?? []) {
      rows.push({
        kind: 'proof',
        id: `proof-${proof.id_payment_proof}`,
        inserted_at: proof.inserted_at ?? proof.reviewed_at ?? 0,
        status: String(proof.review_status),
        coverage: proof.coverage ?? [],
        proof,
      });
    }
  }
  return rows.sort((a, b) => b.inserted_at - a.inserted_at);
}

function formatWhen(ts: number): string {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type RowBadge =
  | { type: 'pill'; label: string; tone: 'yellow' | 'gray' }
  | { type: 'label'; label: string };

type RowView = {
  badge: RowBadge;
  detail: PaymentRecordDetail;
};

function attemptDetail(attempt: RegistrationPaymentAttempt): PaymentRecordDetail {
  return {
    kind: 'attempt',
    title: 'Online card',
    amount: attempt.amount,
    status: String(attempt.status),
    orderId: attempt.order_id,
    ntpId: attempt.ntp_id,
    startedAt: attempt.inserted_at,
    errorMessage: attempt.error_message,
    coverage: attempt.coverage ?? [],
  };
}

function proofDetail(proof: RegistrationPaymentProof): PaymentRecordDetail {
  const reviewedLabel =
    proof.review_status === 'approved'
      ? 'Approved'
      : proof.review_status === 'rejected'
        ? 'Rejected'
        : undefined;
  return {
    kind: 'proof',
    title: 'Bank transfer',
    status: String(proof.review_status),
    submittedAt: proof.inserted_at ?? null,
    reviewedAt: proof.reviewed_at,
    reviewedLabel,
    reviewMessage: proof.review_message,
    proofUrl: proof.url,
    coverage: proof.coverage ?? [],
    canCancelProof: proof.review_status === 'pending',
  };
}

function rowView(row: HistoryRow): RowView | null {
  if (row.kind === 'attempt' && row.attempt) {
    const detail = attemptDetail(row.attempt);
    switch (row.status) {
      case 'started':
      case 'pending':
        return { detail, badge: { type: 'pill', label: 'Pending', tone: 'yellow' } };
      case 'succeeded':
        return { detail, badge: { type: 'pill', label: 'Paid', tone: 'gray' } };
      case 'failed':
        return { detail, badge: { type: 'pill', label: 'Failed', tone: 'gray' } };
      default:
        return { detail, badge: { type: 'label', label: row.status } };
    }
  }

  if (row.kind === 'proof' && row.proof) {
    const detail = proofDetail(row.proof);
    switch (row.status) {
      case 'pending':
        return { detail, badge: { type: 'pill', label: 'Pending', tone: 'yellow' } };
      case 'approved':
        return { detail, badge: { type: 'pill', label: 'Paid', tone: 'gray' } };
      case 'rejected':
        return { detail, badge: { type: 'pill', label: 'Rejected', tone: 'gray' } };
      default:
        return { detail, badge: { type: 'label', label: row.status } };
    }
  }

  return null;
}

type Props = {
  checkouts: EventRegistrationCheckout[];
  onReset?: () => void;
  resetting?: boolean;
};

export default function CheckoutPaymentsList({
  checkouts,
  onReset,
  resetting = false,
}: Props) {
  const rows = useMemo(() => rowsFromCheckouts(checkouts), [checkouts]);
  const [detail, setDetail] = useState<PaymentRecordDetail | null>(null);
  const [expanded, setExpanded] = useState(false);

  const canCollapse = rows.length > COLLAPSED_ROW_COUNT;
  const visibleRows = canCollapse && !expanded ? rows.slice(0, COLLAPSED_ROW_COUNT) : rows;

  return (
    <View style={styles.container} testID="checkout-payments-list">
      <Text style={styles.heading}>Payments</Text>
      {rows.length === 0 ? (
        <Text style={styles.empty}>No payment attempts or proofs yet.</Text>
      ) : (
        visibleRows.map((row) => {
          const view = rowView(row);
          const methodLabel = row.kind === 'attempt' ? 'Online card' : 'Bank transfer';
          return (
            <Pressable
              key={row.id}
              style={styles.card}
              onPress={view ? () => setDetail(view.detail) : undefined}
              disabled={!view}
              accessibilityRole="button"
              testID={row.id}
            >
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <Text style={styles.kind}>{methodLabel}</Text>
                  <Text style={styles.when}>{formatWhen(row.inserted_at)}</Text>
                </View>
                {view?.badge.type === 'pill' ? (
                  <View
                    style={[
                      styles.actionBtn,
                      view.badge.tone === 'yellow' ? styles.actionYellow : styles.actionGray,
                    ]}
                    testID={`${row.id}-action`}
                  >
                    <Text style={styles.actionBtnText}>{view.badge.label}</Text>
                  </View>
                ) : view?.badge.type === 'label' ? (
                  <Text style={styles.statusOnly} testID={`${row.id}-status`}>
                    {view.badge.label}
                  </Text>
                ) : null}
              </View>

              {row.amount != null ? (
                <Text style={styles.amount}>RON {row.amount}</Text>
              ) : null}

              {row.coverage.length > 0 ? (
                <View style={styles.badges} testID={`${row.id}-coverage`}>
                  {row.coverage.map((c) => (
                    <View
                      key={`${row.id}-${c.registration_id}`}
                      style={[
                        styles.badge,
                        { backgroundColor: c.division_color || Colors.GRAY },
                      ]}
                    >
                      <Text style={styles.badgeText}>{c.division_title}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Pressable>
          );
        })
      )}

      {canCollapse && !expanded ? (
        <Pressable
          style={styles.seeMoreBtn}
          onPress={() => setExpanded(true)}
          testID="payments-see-more"
        >
          <Text style={styles.seeMoreText}>See more</Text>
        </Pressable>
      ) : null}

      <PaymentRecordDetailModal
        visible={detail != null}
        detail={detail}
        onClose={() => setDetail(null)}
        cancelling={resetting}
        onCancelProof={
          onReset
            ? () => {
                setDetail(null);
                onReset();
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  heading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  empty: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  card: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  kind: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  when: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  amount: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
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
  actionBtn: {
    minWidth: 88,
    height: 32,
    borderRadius: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionYellow: {
    backgroundColor: Colors.YELLOW,
  },
  actionGray: {
    backgroundColor: Colors.CREAM_20,
  },
  actionBtnText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_XS,
    color: Colors.DARK_GRAY,
  },
  seeMoreBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  seeMoreText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.BLUE,
  },
  statusOnly: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
    textTransform: 'capitalize',
  },
});
