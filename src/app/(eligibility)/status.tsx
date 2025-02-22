import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useEligibility } from '@/hooks/api/useEligibility';
import { spacing } from '@/theme/spacing';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StatusScreen() {
  const router = useRouter();
  const { loading, error, status, checkStatus } = useEligibility();

  useEffect(() => {
    checkStatus();
  }, []);

  const handleClose = () => {
    router.push('/upcoming-events');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Checking eligibility status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={status?.status === 'approved' ? 'check-circle' : 'clock-outline'}
        size={64}
        color={status?.status === 'approved' ? '#4CAF50' : '#FFA000'}
      />
      <Text style={styles.title}>
        {status?.status === 'approved'
          ? 'Eligibility Approved!'
          : 'Application Under Review'}
      </Text>
      <Text style={styles.message}>{status?.message}</Text>
      <Button mode="contained" onPress={handleClose} style={styles.button}>
        Done
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#fff',
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
    marginTop: spacing.xl,
    minWidth: 200,
  },
});
