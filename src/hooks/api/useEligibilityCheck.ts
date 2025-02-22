import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useEligibility } from '@/services/api/eligibility';
import { useToast } from '@/context/toast/ToastContext';

export function useEligibilityCheck() {
  const [checking, setChecking] = useState(false);
  const router = useRouter();
  const { checkEligibilityStatus } = useEligibility();
  const { showToast } = useToast();

  const checkEligibility = useCallback(async () => {
    setChecking(true);
    try {
      const status = await checkEligibilityStatus();

      switch (status.status) {
        case 'approved':
          return true;
        case 'pending':
          showToast('Your eligibility check is still pending', 'info');
          router.push('/eligibility/status');
          return false;
        case 'rejected':
          showToast('Please complete eligibility check', 'info');
          router.push('/eligibility/discovery');
          return false;
        default:
          router.push('/eligibility/discovery');
          return false;
      }
    } catch (error) {
      showToast('Failed to check eligibility status', 'error');
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    checking,
    checkEligibility,
  };
}
