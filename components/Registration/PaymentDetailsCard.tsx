import { View, Text, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

export type PaymentRedemptionLine = {
  name: string;
  amount_ron: number;
};

export type PaymentLine = {
  label: string;
  /** Base entry fee before benefits. */
  fee: number;
  /** Named benefit redemptions (student, referred, …). */
  redemptions?: PaymentRedemptionLine[];
};

type Props = {
  lines?: PaymentLine[];
  divisionName?: string;
  fee?: number;
  redemptions?: PaymentRedemptionLine[];
  totalLabel?: string;
  /** Checkout chrome */
  statusLabel?: string;
  dateLabel?: string;
  overdueMessage?: string | null;
  testID?: string;
};

export default function PaymentDetailsCard({
  lines,
  divisionName,
  fee = 0,
  redemptions,
  totalLabel = 'Total',
  statusLabel,
  dateLabel,
  overdueMessage = null,
  testID = 'payment-details-card',
}: Props) {
  const resolvedLines: PaymentLine[] =
    lines && lines.length > 0
      ? lines
      : [{ label: divisionName ?? 'Registration', fee, redemptions }];

  const totalFee = resolvedLines.reduce((sum, line) => sum + (Number(line.fee) || 0), 0);
  const allRedemptions = resolvedLines.flatMap((line) => line.redemptions ?? []);
  const totalRedemptions = allRedemptions.reduce(
    (sum, r) => sum + (Number(r.amount_ron) || 0),
    0
  );
  const total = Math.max(0, totalFee - totalRedemptions);

  return (
    <View style={styles.card} testID={testID}>
      {(statusLabel || dateLabel) && (
        <View style={styles.metaRow}>
          {statusLabel ? (
            <Text style={styles.statusText} testID={`${testID}-status`}>
              {statusLabel}
            </Text>
          ) : (
            <View />
          )}
          {dateLabel ? <Text style={styles.dateText}>{dateLabel}</Text> : null}
        </View>
      )}

      {resolvedLines.map((line, index) => (
        <View key={`${line.label}-${index}`}>
          <View style={[styles.row, index > 0 && { marginTop: 12 }]}>
            <Text style={styles.label}>{line.label}</Text>
            <Text style={styles.amount}>RON {line.fee}</Text>
          </View>
          {(line.redemptions ?? []).map((redemption, rIndex) => (
            <View
              key={`${line.label}-${redemption.name}-${rIndex}`}
              style={[styles.row, { marginTop: 8 }]}
              testID={`payment-redemption-${redemption.name}`}
            >
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{redemption.name}</Text>
              </View>
              <Text style={styles.amount}>- RON {redemption.amount_ron}</Text>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>{totalLabel}</Text>
        <Text style={styles.totalAmount} testID="payment-details-total">
          RON {total}
        </Text>
      </View>

      {overdueMessage ? (
        <Text style={styles.overdue} testID="payment-overdue">
          {overdueMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  dateText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.CREAM,
  },
  amount: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.WHITE,
  },
  discountBadge: {
    backgroundColor: Colors.BADGE_GREEN,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    justifyContent: 'center',
  },
  discountBadgeText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.WHITE,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.CREAM_20,
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  totalAmount: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  overdue: {
    marginTop: 12,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.RED,
  },
});
