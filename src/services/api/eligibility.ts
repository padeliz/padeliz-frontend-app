import { apiClient } from './client';
import { EligibilityRequest, EligibilityStatus, PhotoSubmission } from '@/types/api/eligibility';

export const eligibilityService = {
  async submitEligibility(data: EligibilityRequest): Promise<EligibilityStatus> {
    const response = await apiClient.post<EligibilityStatus>('/players/eligibility', data);
    return response.data;
  },

  async checkEligibilityStatus(): Promise<EligibilityStatus> {
    const response = await apiClient.get<EligibilityStatus>('/players/eligibility/status');
    return response.data;
  },

  async submitPhotos(photos: FormData): Promise<PhotoSubmission[]> {
    const response = await apiClient.post<PhotoSubmission[]>('/players/profile/photos', photos, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async checkPhotoStatus(): Promise<PhotoSubmission[]> {
    const response = await apiClient.get<PhotoSubmission[]>('/players/profile/photos/status');
    return response.data;
  },
};
