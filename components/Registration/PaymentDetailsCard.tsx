import { View, Text, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  divisionName: string;
  fee: number;
  discount?: number;
  discountLabel?: string;
  totalLabel?: string; // "Total" or "Total paid"
};

export default function PaymentDetailsCard({
  divisionName,
  fee,
  discount,
  discountLabel = 'Student Discount',
  totalLabel = 'Total',
}: Props) {
  const total = fee - (discount ?? 0);
  const showBreakdown = discount !== undefined && discount > 0;

  return (
    <View style={styles.card}>
      {/* Fee row */}
      <View style={styles.row}>
        <Text style={styles.label}>{divisionName} Fee</Text>
        <Text style={styles.amount}>RON {fee}</Text>
      </View>

      {showBreakdown && (
        <>
          {/* Discount row */}
          <View style={[styles.row, { marginTop: 12 }]}>
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{discountLabel}</Text>
            </View>
            <Text style={styles.amount}>- RON {discount}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Total row */}
          <View style={styles.row}>
            <Text style={styles.totalLabel}>{totalLabel}</Text>
            <Text style={styles.totalAmount}>RON {total}</Text>
          </View>
        </>
      )}
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
    backgroundColor: Colors.CREAM_10,
    marginVertical: 12,
  },
  totalLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.WHITE,
  },
  totalAmount: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.WHITE,
  },
});
