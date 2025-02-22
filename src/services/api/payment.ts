import { apiClient } from './client';
import { PaymentResponse } from '@/types/api/payment';

export const paymentService = {
  async processPayment(registrationId: string): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>('/payments', { registrationId });
    return response.data;
  },

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    const response = await apiClient.get<PaymentResponse>(`/payments/${paymentId}`);
    return response.data;
  },
};
