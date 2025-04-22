import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PersonalDetailsForm } from '@/components/eligibility/forms/PersonalDetailsForm';
import { useToast } from '@/context/toast/ToastContext';
import { useEligibility } from '@/context/eligibility/EligibilityContext';

export default function PersonalScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { updateFormData } = useEligibility();

  const handleSubmit = async (personalDetails: {
    fullName: string;
    middleName?: string;
    birthDate: string;
    isStudent: boolean;
    studentId?: string;
  }) => {
    try {
      updateFormData({ personalDetails });
      router.push('/photos');
    } catch (error) {
      showToast('Failed to save personal details', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <PersonalDetailsForm onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
