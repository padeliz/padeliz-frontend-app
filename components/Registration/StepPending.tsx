import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EventDetails } from '@/types/types';
import EventSummaryCard from './EventSummaryCard';
import DivisionColorBadge from '@/components/Events/DivisionColorBadge';

export type StatusDivisionLine = {
  id: number;
  name: string;
  playingTime: string;
  amount: number;
  color?: string | null;
};

type Props = {
  event: EventDetails;
  registered: StatusDivisionLine[];
  totalPaid: number;
  pending: StatusDivisionLine[];
  pendingDue: number;
  onCancelRegistrations?: () => void;
};

function DivisionLine({ line }: { line: StatusDivisionLine }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, gap: 4 }}>
        <DivisionColorBadge
          name={line.name}
          color={line.color}
          testID={`status-division-badge-${line.id}`}
        />
        <Text style={[styles.meta, line.color ? { color: line.color } : null]}>
          {line.playingTime}
        </Text>
      </View>
      <Text style={[styles.amount, line.color ? { color: line.color } : null]}>
        RON {line.amount}
      </Text>
    </View>
  );
}

export default function StepPending({
  event,
  registered,
  totalPaid,
  pending,
  pendingDue,
  onCancelRegistrations,
}: Props) {
  return (
    <View style={styles.container} testID="registration-status-summary">
      <EventSummaryCard event={event} />

      <Text style={styles.sectionHeading}>Registration status</Text>

      {registered.length > 0 ? (
        <View style={styles.card} testID="status-registered-block">
          <Text style={styles.blockTitle}>Registered</Text>
          {registered.map((line) => (
            <DivisionLine key={line.id} line={line} />
          ))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total paid</Text>
            <Text style={styles.totalAmount} testID="status-total-paid">
              RON {totalPaid}
            </Text>
          </View>
        </View>
      ) : null}

      {pending.length > 0 ? (
        <View style={styles.card} testID="status-pending-block">
          <Text style={styles.blockTitle}>Pending</Text>
          {pending.map((line) => (
            <DivisionLine key={line.id} line={line} />
          ))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Amount due</Text>
            <Text style={styles.totalAmount} testID="status-pending-due">
              RON {pendingDue}
            </Text>
          </View>
        </View>
      ) : null}

      {onCancelRegistrations ? (
        <Pressable
          style={styles.dangerBtn}
          onPress={onCancelRegistrations}
          testID="open-cancel-registrations"
        >
          <Text style={styles.dangerBtnText}>Cancel registration</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  sectionHeading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  card: {
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  blockTitle: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meta: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  amount: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.CREAM_10,
    marginVertical: 4,
  },
  totalLabel: {
    flex: 1,
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  totalAmount: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  dangerBtn: {
    marginTop: 8,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.CREAM_10,
  },
  dangerBtnText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.RED,
  },
});
