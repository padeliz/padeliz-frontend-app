/**
 * Bottom-sheet login prompt (CancelRegistrationModal-style).
 */
import { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import LoginOptions from '@/components/Login/LoginOptions';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
};

export default function LoginModal({
  visible,
  onClose,
  title = 'Sign in to continue',
  subtitle = 'Sign in with Google to register for events, track payments, and manage your account.',
}: Props) {
  const [signingIn, setSigningIn] = useState(false);

  const requestClose = () => {
    if (signingIn) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={requestClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={requestClose}
          testID="login-modal-backdrop"
          accessibilityRole="button"
          accessibilityState={{ disabled: signingIn }}
        />
        <View style={styles.sheet} testID="login-modal">
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          <LoginOptions
            onAuthSuccess={onClose}
            onBusyChange={setSigningIn}
            style={styles.options}
          />

          <Pressable
            style={[styles.secondaryButton, signingIn && styles.secondaryDisabled]}
            onPress={requestClose}
            disabled={signingIn}
            testID="login-modal-cancel"
          >
            <Text style={styles.secondaryLabel}>Cancel</Text>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.DARK_GRAY,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 8,
    paddingBottom: 24,
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
  options: {
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 16,
    height: 52,
    borderRadius: 8,
    backgroundColor: Colors.CREAM_10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryDisabled: {
    opacity: 0.5,
  },
  secondaryLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
  },
});
