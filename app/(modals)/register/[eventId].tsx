import { View, StyleSheet } from 'react-native';
import { Text, Button, RadioButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useRegistration } from '@/hooks/api/useRegistration';
import { useAuth } from '@/context/auth/AuthContext';
import { useToast } from '@/context/toast/ToastContext';
import { spacing } from '@/theme/spacing';
import { getErrorMessage } from '@/utils/error';
import { useLoading } from '@/context/loading/LoadingContext';

export default function RegisterScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { loading, registerForEvent } = useRegistration();
  const { showToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'paypal'>('credit_card');
  const { showLoading, hideLoading } = useLoading();

  const handleRegister = async () => {
    if (!user) {
      showToast('Please sign in to continue', 'error');
      router.push('/login');
      return;
    }

    try {
      showLoading();
      const registration = await registerForEvent({
        eventId,
        userId: user.id,
        paymentMethod,
      });

      showToast('Registration successful! Proceeding to payment...', 'success');
      router.push(`/payment-confirmation/${registration.id}`);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
      console.error('Registration failed:', error);
    } finally {
      hideLoading();
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Choose Payment Method
      </Text>

      <RadioButton.Group
        onValueChange={value => setPaymentMethod(value as 'credit_card' | 'paypal')}
        value={paymentMethod}
      >
        <View style={styles.radioOption}>
          <RadioButton value="credit_card" />
          <Text>Credit Card</Text>
        </View>
        <View style={styles.radioOption}>
          <RadioButton value="paypal" />
          <Text>PayPal</Text>
        </View>
      </RadioButton.Group>

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
      >
        Continue to Payment
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: spacing.xl,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.xl,
  },
});
