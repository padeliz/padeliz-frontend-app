import { apiClient } from './client';
import { RegistrationRequest, RegistrationResponse } from '@/types/api/registration';

export const registrationService = {
  async registerForEvent(data: RegistrationRequest): Promise<RegistrationResponse> {
    const response = await apiClient.post<RegistrationResponse>('/registrations', data);
    return response.data;
  },

  async getRegistrationStatus(registrationId: string): Promise<RegistrationResponse> {
    const response = await apiClient.get<RegistrationResponse>(`/registrations/${registrationId}`);
    return response.data;
  },
};
