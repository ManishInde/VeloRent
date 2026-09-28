import { apiClient } from './client';
import { Payment, ApiResponse, PaymentProcessRequest } from '@/types';

export async function processPayment(
  rentalId: number,
  amount: number,
  method: string = 'CARD',
  type: string = 'RENTAL_FEE'
): Promise<Payment> {
  const payload: PaymentProcessRequest = { rentalId, amount, method, type };
  const response = await apiClient.post<ApiResponse<Payment>>('/api/payments', payload);
  if (!response.data) {
    throw new Error('Payment processing failed.');
  }
  return response.data;
}
