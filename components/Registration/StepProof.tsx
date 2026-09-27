import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EventDetails } from '@/types/types';
import EventSummaryCard from './EventSummaryCard';
import PaymentDetailsCard from './PaymentDetailsCard';
import PhotoUploadSlot from '@/components/Eligibility/PhotoUploadSlot';

type Props = {
  event: EventDetails;
  divisionName: string;
  fee: number;
  discount: number;
  voucherCode: string;
  paymentProofUri: string | null;
  onVoucherChange: (code: string) => void;
  onApplyVoucher: () => void;
  onSelectProof: (uri: string) => void;
};

export default function StepProof({
  event,
  divisionName,
  fee,
  discount,
  voucherCode,
  paymentProofUri,
  onVoucherChange,
  onApplyVoucher,
  onSelectProof,
}: Props) {
  return (
    <View style={styles.container}>
      <EventSummaryCard event={event} />

      {/* Payment Details */}
      <Text style={styles.sectionHeading}>Payment Details</Text>
      <PaymentDetailsCard
        divisionName={divisionName}
        fee={fee}
        discount={discount}
        totalLabel="Total"
      />

      {/* Voucher */}
      <Text style={styles.voucherLabel}>Have a voucher code?</Text>
      <View style={styles.voucherRow}>
        <TextInput
          style={styles.voucherInput}
          placeholder="Enter code"
          placeholderTextColor={Colors.INACTIVE}
          value={voucherCode}
          onChangeText={onVoucherChange}
        />
        <Pressable style={styles.voucherButton} onPress={onApplyVoucher}>
          <Text style={styles.voucherButtonText}>Apply</Text>
        </Pressable>
      </View>

      {/* Upload Payment Proof */}
      <Text style={styles.sectionHeading}>Upload Payment Proof</Text>
      <PhotoUploadSlot
        uri={paymentProofUri}
        onSelect={onSelectProof}
        fill
        fillHeight={128}
        label="Click to upload proof of payment"
        hint="PNG, JPG up to 5MB"
        allowsEditing={false}
        aspect={[3, 1]}
      />
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
  voucherLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM,
  },
  voucherRow: {
    flexDirection: 'row',
    gap: 9,
  },
  voucherInput: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.WHITE_05,
    borderWidth: 1,
    borderColor: Colors.CREAM_10,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  voucherButton: {
    width: 92,
    height: 50,
    backgroundColor: Colors.BLUE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voucherButtonText: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
});
