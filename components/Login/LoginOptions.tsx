/**
 * Reusable Google sign-in control. Structured so additional providers can be
 * added beside the Google button without changing consumers.
 */
import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useAuth } from '@/context/auth';
import Button from '@/components/Buttons/Button';
import StatusBanner from '@/components/Feedback/StatusBanner';
import { GOOGLE_SIGN_IN_CANCEL_MESSAGE } from '@/constants/authMessages';
import { ApiError } from '@/services/apiError';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';

type Props = {
  style?: StyleProp<ViewStyle>;
  /** Fired after a successful sign-in (e.g. close a modal). */
  onAuthSuccess?: () => void;
  /** Busy state for parent dismiss guards. */
  onBusyChange?: (busy: boolean) => void;
};

function isCancelError(error: Error): boolean {
  return (
    error.message === GOOGLE_SIGN_IN_CANCEL_MESSAGE ||
    /sign-in was cancelled|sign-in was canceled|cancelled|canceled/i.test(
      error.message
    )
  );
}

export default function LoginOptions({
  style,
  onAuthSuccess,
  onBusyChange,
}: Props) {
  const { signIn, user, error } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    onBusyChange?.(signingIn);
  }, [signingIn, onBusyChange]);

  useEffect(() => {
    if (!signingIn) return;
    if (user) {
      setSigningIn(false);
      onAuthSuccess?.();
    }
  }, [user, signingIn, onAuthSuccess]);

  useEffect(() => {
    if (signingIn && error) {
      setSigningIn(false);
    }
  }, [error, signingIn]);

  const handleGoogle = () => {
    setSigningIn(true);
    void signIn().catch(() => {
      setSigningIn(false);
    });
  };

  const banner =
    error == null
      ? null
      : isCancelError(error)
        ? {
            variant: 'warning' as const,
            message: GOOGLE_SIGN_IN_CANCEL_MESSAGE,
          }
        : {
            variant: 'error' as const,
            message:
              error instanceof ApiError || error.message
                ? error.message
                : 'Something went wrong. Please try again.',
          };

  return (
    <View style={[styles.container, style]} testID="login-options">
      {banner ? (
        <StatusBanner
          testID="login-status-banner"
          variant={banner.variant}
          message={banner.message}
          style={styles.banner}
        />
      ) : null}
      <Button
        label="Sign in with Google"
        onPress={handleGoogle}
        loading={signingIn}
        loadingColor={Colors.DARK_GRAY}
        testID="login-google-button"
        icon={
          <Image
            source={require('@/assets/images/google-icon.png')}
            style={styles.googleIcon}
          />
        }
        style={styles.googleButton}
        labelStyle={styles.googleLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  banner: {
    marginBottom: 12,
    maxWidth: 320,
  },
  googleButton: {
    backgroundColor: Colors.WHITE,
    width: '100%',
    maxWidth: 320,
    height: 56,
  },
  googleLabel: {
    color: Colors.DARK_GRAY,
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
  },
  googleIcon: {
    width: 19,
    height: 20,
    tintColor: Colors.DARK_GRAY,
  },
});
