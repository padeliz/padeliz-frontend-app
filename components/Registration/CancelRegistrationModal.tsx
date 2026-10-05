import { useEffect, useState } from 'react';
import { View, Text, Pressable, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { CANCEL_REASONS } from '@/services/registration';
import type { RegistrationCancelReason } from '@/types/api';

export type CancelableRegistration = {
  id: number;
  label: string;
};

type Props = {
  visible: boolean;
  submitting?: boolean;
  error?: string | null;
  /** When multiple regs exist, player multi-selects which to cancel. */
  registrations?: CancelableRegistration[];
  onClose: () => void;
  onConfirm: (reason: RegistrationCancelReason, registrationIds: number[]) => void;
};

/**
 * Reason picker for player self-cancel. Supports multi-select when cancelling
 * several active divisions at once. Confirm stays inert until a reason (and at
 * least one reg, when listed) is chosen.
 */
export default function CancelRegistrationModal({
  visible,
  submitting = false,
  error,
  registrations,
  onClose,
  onConfirm,
}: Props) {
  const hasRegistrations = (registrations?.length ?? 0) > 0;
  const [reason, setReason] = useState<RegistrationCancelReason | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!visible) return;
    setReason(null);
    setSelectedIds(registrations?.map((r) => r.id) ?? []);
  }, [visible, registrations]);

  const dismiss = () => {
    if (submitting) return;
    setReason(null);
    onClose();
  };

  const toggleId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const idsToCancel = hasRegistrations ? selectedIds : [];

  const canConfirm =
    Boolean(reason) &&
    !submitting &&
    (!hasRegistrations || idsToCancel.length > 0);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.sheet} testID="cancel-registration-modal">
          <Text style={styles.title}>Cancel Registration</Text>
          <Text style={styles.subtitle}>
            Choose which divisions to cancel. This frees those spots for other players.
          </Text>

          {hasRegistrations
            ? registrations!.map((reg) => {
                const isSelected = selectedIds.includes(reg.id);
                return (
                  <Pressable
                    key={reg.id}
                    testID={`cancel-reg-${reg.id}`}
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => toggleId(reg.id)}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                      {isSelected ? <View style={styles.checkboxInner} /> : null}
                    </View>
                    <Text style={styles.optionLabel}>{reg.label}</Text>
                  </Pressable>
                );
              })
            : null}

          {hasRegistrations ? <View style={styles.divider} testID="cancel-reg-divider" /> : null}

          <Text style={styles.reasonHeading}>
            Why you&apos;re cancelling your registration?
          </Text>

          {CANCEL_REASONS.map((option) => {
            const isSelected = reason === option.value;
            return (
              <Pressable
                key={option.value}
                testID={`cancel-reason-${option.value}`}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => setReason(option.value)}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            );
          })}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              style={[styles.secondaryButton, submitting && styles.secondaryButtonDisabled]}
              onPress={dismiss}
              disabled={submitting}
              testID="cancel-registration-dismiss"
            >
              <Text style={styles.secondaryLabel}>Keep Registration</Text>
            </Pressable>
            <Pressable
              testID="cancel-registration-confirm"
              style={[styles.dangerButton, !canConfirm && styles.dangerButtonDisabled]}
              disabled={!canConfirm}
              onPress={() => reason && onConfirm(reason, idsToCancel)}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.WHITE} />
              ) : (
                <Text style={styles.dangerLabel}>Cancel Registration</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.DARK_GRAY,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 8,
  },
  title: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
  },
  subtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 20,
    color: Colors.CREAM_60,
    marginBottom: 8,
  },
  reasonHeading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    marginTop: 4,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.CREAM_10,
    marginVertical: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.GRAY,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: Colors.BLUE,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.CREAM_40,
    alignItems: 'center',
    justifyContent: 'center',
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.CREAM_40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: Colors.BLUE,
    backgroundColor: Colors.BLUE,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.WHITE,
  },
  optionLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  error: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.RED,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: Colors.CREAM_10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonDisabled: {
    opacity: 0.5,
  },
  secondaryLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
  dangerButton: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: Colors.RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonDisabled: {
    opacity: 0.5,
  },
  dangerLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
});
