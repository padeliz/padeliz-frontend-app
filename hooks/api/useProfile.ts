import { useState, useCallback } from 'react';
import { profileService } from '@/services/api/profile';
import { Profile, ProfileUpdateRequest } from '@/types/api/profile';
import { GoogleUser } from '@/services/auth/google';

export function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdateRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const linkGoogleAccount = useCallback(async (googleUser: GoogleUser) => {
    setLoading(true);
    setError(null);
    try {
      const linked = await profileService.linkGoogleAccount(googleUser);
      await fetchProfile(); // Refresh profile data
      return linked;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to link Google account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  const unlinkGoogleAccount = useCallback(async (accountId: string) => {
    setLoading(true);
    setError(null);
    try {
      await profileService.unlinkGoogleAccount(accountId);
      await fetchProfile(); // Refresh profile data
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unlink Google account'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  return {
    loading,
    error,
    profile,
    fetchProfile,
    updateProfile,
    linkGoogleAccount,
    unlinkGoogleAccount,
  };
}
