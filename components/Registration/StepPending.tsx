import { View, Text, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EventDetails } from '@/types/types';
import EventSummaryCard from './EventSummaryCard';
import PaymentDetailsCard from './PaymentDetailsCard';

type Props = {
  event: EventDetails;
  divisionName: string;
  fee: number;
  discount: number;
};

export default function StepPending({ event, divisionName, fee, discount }: Props) {
  return (
    <View style={styles.container}>
      <EventSummaryCard event={event} />

      {/* Payment Details */}
      <Text style={styles.sectionHeading}>Payment Details</Text>
      <PaymentDetailsCard
        divisionName={divisionName}
        fee={fee}
        discount={discount}
        totalLabel="Total paid"
      />

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Pending Review</Text>
          </View>
        </View>
        <Text style={styles.statusDescription}>
          Your payment proof is being reviewed. We'll notify you once it's approved.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  sectionHeading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.WHITE,
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 16,
    height: 116,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  statusBadge: {
    backgroundColor: Colors.AMBER_T,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.AMBER,
  },
  statusDescription: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
    marginTop: 16,
    lineHeight: 20,
  },
});
