import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { DiscoverySourceForm } from '@/components/eligibility/forms/DiscoverySourceForm';
import { useToast } from '@/context/toast/ToastContext';
import { useEligibility } from '@/context/eligibility/EligibilityContext';
import { useAuth } from '@/context/auth/AuthContext';
import { useEffect } from 'react';

export default function DiscoveryScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { updateFormData } = useEligibility();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  const handleSubmit = async (discoverySource: {
    type: 'online' | 'friends';
    platform?: string;
    referrals?: string[];
  }) => {
    try {
      updateFormData({ discoverySource });
      router.push('/sports');
    } catch (error) {
      showToast('Failed to save discovery source', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <DiscoverySourceForm onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
