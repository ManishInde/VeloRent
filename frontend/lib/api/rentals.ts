import { apiClient } from './client';
import { Rental, ApiResponse, ApiCollectionResponse, RentalReturnRequest, RentalStartRequest } from '@/types';

export async function getCustomerRentals(customerId: number): Promise<Rental[]> {
  const response = await apiClient.get<ApiCollectionResponse<Rental>>(`/api/customers/${customerId}/rentals`);
  return response.data ?? [];
}

export async function getRentalById(rentalId: number): Promise<Rental> {
  const response = await apiClient.get<ApiResponse<Rental>>(`/api/rentals/${rentalId}`);
  if (!response.data) {
    throw new Error(`Rental with ID ${rentalId} not found.`);
  }
  return response.data;
}

export async function startRental(bookingId: number, startOdometerKm?: number): Promise<Rental> {
  const payload: RentalStartRequest = startOdometerKm !== undefined ? { startOdometerKm } : {};
  const response = await apiClient.post<ApiResponse<Rental>>(`/api/rentals/${bookingId}/start`, payload);
  if (!response.data) {
    throw new Error('Failed to start rental.');
  }
  return response.data;
}

export async function returnRental(rentalId: number, returnOdometerKm: number): Promise<Rental> {
  const payload: RentalReturnRequest = { returnOdometerKm };
  const response = await apiClient.post<ApiResponse<Rental>>(`/api/rentals/${rentalId}/return`, payload);
  if (!response.data) {
    throw new Error('Failed to return vehicle.');
  }
  return response.data;
}
