import { apiClient } from './client';
import { Customer, ApiResponse } from '@/types';

export async function getCustomerById(customerId: number): Promise<Customer> {
  const response = await apiClient.get<ApiResponse<Customer>>(`/api/customers/${customerId}`);
  if (!response.data) {
    throw new Error(`Customer with ID ${customerId} not found.`);
  }
  return response.data;
}
