import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SportsBackgroundForm } from '@/components/eligibility/forms/SportsBackgroundForm';
import { useToast } from '@/context/toast/ToastContext';

export default function SportsScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (sportsBackground: {
    sports: Array<{
      name: string;
      experienceYears: number;
      frequency: string;
      lastPlayed: string;
    }>;
  }) => {
    try {
      // Store the sports background data for later submission
      router.push('/personal');
    } catch (error) {
      showToast('Failed to save sports background', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <SportsBackgroundForm onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
