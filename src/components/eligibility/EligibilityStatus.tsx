import { View, StyleSheet } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { spacing } from '@/theme/spacing';
import { EligibilityStatus as Status } from '@/types/api/eligibility';

interface EligibilityStatusProps {
  status: Status;
  loading?: boolean;
  onRetry?: () => void;
  onStartCheck?: () => void;
}

export function EligibilityStatus({
  status,
  loading,
  onRetry,
  onStartCheck,
}: EligibilityStatusProps) {
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
        name={getStatusIcon(status.status)}
        size={64}
        color={getStatusColor(status.status)}
      />
      <Text style={styles.title}>{getStatusTitle(status.status)}</Text>
      <Text style={styles.message}>{status.message}</Text>
      {status.status === 'rejected' && onStartCheck && (
        <Button mode="contained" onPress={onStartCheck} style={styles.button}>
          Start Eligibility Check
        </Button>
      )}
      {onRetry && (
        <Button mode="outlined" onPress={onRetry} style={styles.button}>
          Retry Check
        </Button>
      )}
    </View>
  );
}

function getStatusIcon(status: Status['status']) {
  switch (status) {
    case 'approved':
      return 'check-circle';
    case 'rejected':
      return 'close-circle';
    default:
      return 'clock-outline';
  }
}

function getStatusColor(status: Status['status']) {
  switch (status) {
    case 'approved':
      return '#4CAF50';
    case 'rejected':
      return '#B00020';
    default:
      return '#FFA000';
  }
}

function getStatusTitle(status: Status['status']) {
  switch (status) {
    case 'approved':
      return 'Eligibility Approved';
    case 'rejected':
      return 'Eligibility Check Required';
    default:
      return 'Application Under Review';
  }
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#666',
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
    minWidth: 200,
  },
});
