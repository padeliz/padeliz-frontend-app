export interface PaymentDetails {
  amount: number;
  currency: string;
  method: 'credit_card' | 'paypal';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  errorMessage?: string;
}

export interface PaymentResponse {
  id: string;
  registrationId: string;
  details: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}
