import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PhotoUploadForm } from '@/components/eligibility/forms/PhotoUploadForm';
import { useToast } from '@/context/toast/ToastContext';
import { useEligibility as useEligibilityContext } from '@/context/eligibility/EligibilityContext';
import { useEligibility as useEligibilityApi } from '@/hooks/api/useEligibility';
import { useLoading } from '@/context/loading/LoadingContext';

export default function PhotosScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { formData, resetFormData } = useEligibilityContext();
  const { submitEligibility, submitPhotos } = useEligibilityApi();
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async (photos: FormData) => {
    try {
      showLoading();

      // First submit the eligibility form data
      const eligibilityResponse = await submitEligibility(formData as any);

      // Then submit the photos
      await submitPhotos(photos);

      // Reset form data and navigate to status screen
      resetFormData();
      router.push('/status');

      showToast('Eligibility check submitted successfully', 'success');
    } catch (error) {
      showToast('Failed to submit eligibility check', 'error');
    } finally {
      hideLoading();
    }
  };

  return (
    <View style={styles.container}>
      <PhotoUploadForm onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
