import { apiClient } from './client';
import { Profile, ProfileUpdateRequest, GoogleAccountLink } from '@/types/api/profile';
import { GoogleUser } from '@/services/auth/google';

export const profileService = {
  async getProfile(): Promise<Profile> {
    const response = await apiClient.get<Profile>('/players/profile');
    return response.data;
  },

  async updateProfile(data: ProfileUpdateRequest): Promise<Profile> {
    const response = await apiClient.patch<Profile>('/players/profile', data);
    return response.data;
  },

  async linkGoogleAccount(googleUser: GoogleUser): Promise<GoogleAccountLink> {
    const response = await apiClient.post<GoogleAccountLink>('/players/profile/google-accounts', {
      accessToken: googleUser.accessToken,
    });
    return response.data;
  },

  async unlinkGoogleAccount(accountId: string): Promise<void> {
    await apiClient.delete(`/players/profile/google-accounts/${accountId}`);
  },
};
