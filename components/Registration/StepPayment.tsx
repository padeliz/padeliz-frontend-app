import { View, Text, Pressable, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EventDetails } from '@/types/types';
import EventSummaryCard from './EventSummaryCard';

type PaymentMethod = 'bank_transfer' | 'netopia';

type Props = {
  event: EventDetails;
  divisionName: string;
  fee: number;
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
};

const PAYMENT_METHODS: { id: PaymentMethod; name: string; description: string; icon: string }[] = [
  { id: 'bank_transfer', name: 'Bank Transfer', description: 'Manual transfer and proof upload', icon: 'bank' },
  { id: 'netopia', name: 'Netopia Payments', description: 'Direct payment gateway', icon: 'credit-card' },
];

export default function StepPayment({ event, divisionName, fee, selectedMethod, onSelectMethod }: Props) {
  return (
    <View style={styles.container}>
      <EventSummaryCard event={event} />

      {/* Payment Details */}
      <Text style={styles.sectionHeading}>Payment Details</Text>
      <View style={styles.feeCard}>
        <Text style={styles.feeLabel}>{divisionName} Fee</Text>
        <Text style={styles.feeAmount}>RON {fee}</Text>
      </View>

      {/* Payment Method */}
      <Text style={styles.heading}>Select Payment Method</Text>

      {PAYMENT_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <Pressable
            key={method.id}
            style={styles.methodCard}
            onPress={() => onSelectMethod(method.id)}
          >
            {/* Radio */}
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>

            {/* Info */}
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodDescription}>{method.description}</Text>
            </View>

            {/* Icon */}
            <FontAwesome name={method.icon as any} size={20} color={Colors.CREAM} />
          </Pressable>
        );
      })}
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
  feeCard: {
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  feeLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.CREAM,
  },
  feeAmount: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    lineHeight: 16,
    color: Colors.WHITE,
  },
  heading: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.HEADING_3,
    lineHeight: 18,
    color: Colors.WHITE,
    marginTop: 4,
  },
  methodCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.CREAM_40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.BLUE,
    backgroundColor: Colors.BLUE,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.WHITE,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  methodDescription: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM,
    marginTop: 4,
  },
});
