/**
 * Choose payment method; bank continues inside with transfer details + proof upload.
 */
import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import type { BankTransferSettings, RegistrationPaymentMethod } from '@/types/api';
import PhotoUploadSlot from '@/components/LevelAssessment/PhotoUploadSlot';

type Props = {
  visible: boolean;
  bankSettings: BankTransferSettings | null;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onStartNetopia: () => void;
  onSubmitBankProof: (uri: string) => void;
};

const METHODS: {
  id: RegistrationPaymentMethod;
  name: string;
  description: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}[] = [
  { id: 'bank_transfer', name: 'Bank Transfer', description: 'Manual transfer and proof upload', icon: 'bank' },
  { id: 'netopia', name: 'Netopia Payments', description: 'Direct payment gateway', icon: 'credit-card' },
];

function bankRows(settings: BankTransferSettings): { label: string; value: string }[] {
  return [
    { label: 'IBAN', value: settings.iban },
    { label: 'Beneficiary', value: settings.beneficiary_name },
    { label: 'Bank', value: settings.bank_name ?? '' },
    { label: 'Reference', value: settings.payment_reference ?? '' },
  ].filter((r) => r.value !== '' && r.value != null);
}

export default function PaymentMethodModal({
  visible,
  bankSettings,
  busy = false,
  error = null,
  onClose,
  onStartNetopia,
  onSubmitBankProof,
}: Props) {
  const [phase, setPhase] = useState<'method' | 'bank'>('method');
  const [proofUri, setProofUri] = useState<string | null>(null);

  const close = () => {
    if (busy) return;
    setPhase('method');
    setProofUri(null);
    onClose();
  };

  const pick = (method: RegistrationPaymentMethod) => {
    if (method === 'netopia') {
      onStartNetopia();
      return;
    }
    setPhase('bank');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} testID="payment-method-modal">
          <Text style={styles.title}>
            {phase === 'method' ? 'Select Payment Method' : 'Bank Transfer'}
          </Text>

          {error ? (
            <Text style={styles.error} testID="payment-method-error">
              {error}
            </Text>
          ) : null}

          {busy ? (
            <ActivityIndicator color={Colors.BLUE} style={{ marginVertical: 24 }} />
          ) : (
            <ScrollView contentContainerStyle={styles.content}>
              {phase === 'method'
                ? METHODS.map((method) => (
                    <Pressable
                      key={method.id}
                      style={styles.methodCard}
                      onPress={() => pick(method.id)}
                      testID={`pay-method-${method.id}`}
                    >
                      <MaterialCommunityIcons name={method.icon} size={18} color={Colors.WHITE} />
                      <View style={styles.methodInfo}>
                        <Text style={styles.methodName}>{method.name}</Text>
                        <Text style={styles.methodDescription}>{method.description}</Text>
                      </View>
                    </Pressable>
                  ))
                : (
                  <>
                    {bankSettings ? (
                      <View style={styles.bankCard} testID="bank-transfer-details">
                        {bankRows(bankSettings).map((row) => (
                          <View key={row.label} style={styles.bankRow}>
                            <Text style={styles.bankLabel}>{row.label}</Text>
                            <Text style={styles.bankValue} selectable>
                              {row.value}
                            </Text>
                          </View>
                        ))}
                        {bankSettings.extra_instructions ? (
                          <Text style={styles.bankNote}>{bankSettings.extra_instructions}</Text>
                        ) : null}
                      </View>
                    ) : (
                      <Text style={styles.bankMissing}>
                        Bank transfer details are not available yet.
                      </Text>
                    )}

                    <Text style={styles.section}>Upload Payment Proof</Text>
                    <PhotoUploadSlot
                      testID="payment-proof-upload"
                      uri={proofUri}
                      onSelect={setProofUri}
                      fill
                      fillHeight={128}
                      label="Click to upload proof of payment"
                      hint="PNG, JPG up to 5MB"
                      allowsEditing={false}
                      aspect={[3, 1]}
                    />

                    <Pressable
                      style={[styles.primaryBtn, !proofUri && styles.btnDisabled]}
                      disabled={!proofUri}
                      onPress={() => proofUri && onSubmitBankProof(proofUri)}
                      testID="submit-bank-proof"
                    >
                      <Text style={styles.primaryBtnText}>Submit proof</Text>
                    </Pressable>

                    <Pressable onPress={() => setPhase('method')} style={styles.backLink}>
                      <Text style={styles.backLinkText}>Back to methods</Text>
                    </Pressable>
                  </>
                  )}
            </ScrollView>
          )}

          <Pressable
            style={[styles.closeBtn, busy && styles.btnDisabled]}
            onPress={close}
            disabled={busy}
            testID="close-payment-method"
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  sheet: {
    backgroundColor: Colors.DARK_GRAY,
    borderRadius: 12,
    maxHeight: '85%',
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
    paddingHorizontal: 16,
  },
  error: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.RED,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 14,
  },
  methodInfo: { flex: 1, gap: 4 },
  methodName: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  methodDescription: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  bankCard: {
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  bankRow: { gap: 2 },
  bankLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
  },
  bankValue: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  bankNote: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: Colors.CREAM_60,
    marginTop: 4,
  },
  bankMissing: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM_60,
  },
  section: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    marginTop: 4,
  },
  primaryBtn: {
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  btnDisabled: { opacity: 0.45 },
  backLink: { alignItems: 'center', paddingVertical: 8 },
  backLinkText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.BLUE,
  },
  closeBtn: {
    marginTop: 8,
    marginHorizontal: 16,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.CREAM_20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
});
