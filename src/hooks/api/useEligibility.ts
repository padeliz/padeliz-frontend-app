import { useState, useCallback } from 'react';
import { eligibilityService } from '@/services/api/eligibility';
import { EligibilityRequest, EligibilityStatus, PhotoSubmission } from '@/types/api/eligibility';

export function useEligibility() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<EligibilityStatus | null>(null);
  const [photos, setPhotos] = useState<PhotoSubmission[]>([]);

  const submitEligibility = useCallback(async (data: EligibilityRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await eligibilityService.submitEligibility(data);
      setStatus(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit eligibility'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eligibilityService.checkEligibilityStatus();
      setStatus(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check eligibility status'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitPhotos = useCallback(async (photoData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await eligibilityService.submitPhotos(photoData);
      setPhotos(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit photos'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPhotoStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eligibilityService.checkPhotoStatus();
      setPhotos(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check photo status'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    status,
    photos,
    submitEligibility,
    checkStatus,
    submitPhotos,
    checkPhotoStatus,
  };
}
