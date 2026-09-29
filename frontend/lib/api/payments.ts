import { apiClient } from './client';
import { Payment, ApiResponse, ApiCollectionResponse, PaymentProcessRequest } from '@/types';

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

export async function getRentalPayments(rentalId: number): Promise<Payment[]> {
  const response = await apiClient.get<ApiCollectionResponse<Payment>>(`/api/rentals/${rentalId}/payments`, {
    cache: 'no-store',
  });
  return response.data ?? [];
}

export async function getCustomerPayments(customerId: number): Promise<Payment[]> {
  const response = await apiClient.get<ApiCollectionResponse<Payment>>(`/api/customers/${customerId}/payments`, {
    cache: 'no-store',
  });
  return response.data ?? [];
}
