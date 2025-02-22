import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useEligibilityCheck } from '@/hooks/api/useEligibilityCheck';
import { useEligibility } from '@/hooks/api/useEligibility';
import { EligibilityStatus } from '@/components/eligibility/EligibilityStatus';
import { EligibilityStatus as Status } from '@/types/api/eligibility';
import { spacing } from '@/theme/spacing';

export default function RegisterCheckScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const { checking, checkEligibility } = useEligibilityCheck();
  const { status } = useEligibility();
  const [eligibilityStatus, setEligibilityStatus] = useState<Status | null>(null);

  useEffect(() => {
    handleEligibilityCheck();
  }, []);

  const handleEligibilityCheck = async () => {
    const isEligible = await checkEligibility();
    if (isEligible) {
      router.push(`/register/${eventId}`);
    }
  };

  const handleStartCheck = () => {
    router.push('/eligibility/discovery');
  };

  return (
    <View style={styles.container}>
      <EligibilityStatus
        status={status || { status: 'rejected', updatedAt: new Date().toISOString() }}
        loading={checking}
        onRetry={handleEligibilityCheck}
        onStartCheck={handleStartCheck}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});
