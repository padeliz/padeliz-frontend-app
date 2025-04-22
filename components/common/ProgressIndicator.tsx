import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { spacing } from '@/theme/spacing';

interface ProgressIndicatorProps {
  message?: string;
}

export function ProgressIndicator({ message }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" style={styles.spinner} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    marginBottom: spacing.sm,
  },
  message: {
    color: '#666',
  },
});
