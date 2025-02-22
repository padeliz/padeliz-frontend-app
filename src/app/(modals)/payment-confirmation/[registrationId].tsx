import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePayment } from '@/hooks/api/usePayment';
import { spacing } from '@/theme/spacing';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useToast } from '@/context/toast/ToastContext';
import { getErrorMessage, isNetworkError } from '@/utils/error';
import { ProgressIndicator } from '@/components/common/ProgressIndicator';

export default function PaymentConfirmation() {
  const { registrationId } = useLocalSearchParams<{ registrationId: string }>();
  const router = useRouter();
  const { loading, error, payment, processPayment } = usePayment();
  const [processingComplete, setProcessingComplete] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    handlePayment();
  }, []);

  const handlePayment = async () => {
    try {
      const result = await processPayment(registrationId);
      if (result.details.status === 'completed') {
        setProcessingComplete(true);
        showToast('Payment successful!', 'success');
      } else if (result.details.status === 'failed') {
        throw new Error(result.details.errorMessage || 'Payment failed');
      }
    } catch (error) {
      const errorMessage = isNetworkError(error)
        ? 'Network error. Please check your connection and try again.'
        : getErrorMessage(error);
      showToast(errorMessage, 'error');
      console.error('Payment processing failed:', error);
    }
  };

  const handleClose = () => {
    // Navigate back to the events list
    router.push('/upcoming-events');
  };

  if (loading && !processingComplete) {
    return <ProgressIndicator message="Processing your payment..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#B00020" />
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.message}>{error.message}</Text>
        <Button mode="contained" onPress={handlePayment} style={styles.button}>
          Retry Payment
        </Button>
        <Button mode="outlined" onPress={handleClose} style={styles.button}>
          Cancel
        </Button>
      </View>
    );
  }

  if (processingComplete) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.message}>
          Your registration has been confirmed. You will receive a confirmation email shortly.
        </Text>
        <Button mode="contained" onPress={handleClose} style={styles.button}>
          Done
        </Button>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#fff',
  },
  loader: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.lg,
    color: '#666',
  },
  button: {
    marginTop: spacing.md,
    minWidth: 200,
  },
});
