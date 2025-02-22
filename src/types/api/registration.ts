export interface RegistrationRequest {
  eventId: string;
  userId: string;
  paymentMethod: 'credit_card' | 'paypal';
}

export interface RegistrationResponse {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
