import { useState, useCallback } from 'react';
import { paymentService } from '@/services/api/payment';
import { PaymentResponse } from '@/types/api/payment';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [payment, setPayment] = useState<PaymentResponse | null>(null);

  const processPayment = useCallback(async (registrationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.processPayment(registrationId);
      setPayment(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Payment processing failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPaymentStatus = useCallback(async (paymentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getPaymentStatus(paymentId);
      setPayment(response);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check payment status'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    payment,
    processPayment,
    checkPaymentStatus,
  };
}
