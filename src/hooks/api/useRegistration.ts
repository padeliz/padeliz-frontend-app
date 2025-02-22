import { useState, useCallback } from 'react';
import { registrationService } from '@/services/api/registration';
import { RegistrationRequest, RegistrationResponse } from '@/types/api/registration';

export function useRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [registration, setRegistration] = useState<RegistrationResponse | null>(null);

  const registerForEvent = useCallback(async (data: RegistrationRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registrationService.registerForEvent(data);
      setRegistration(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Registration failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkRegistrationStatus = useCallback(async (registrationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registrationService.getRegistrationStatus(registrationId);
      setRegistration(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check registration status'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    registration,
    registerForEvent,
    checkRegistrationStatus,
  };
}
