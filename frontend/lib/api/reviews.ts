import { apiClient } from './client';
import { Review, ApiResponse, ApiCollectionResponse, ReviewCreateRequest } from '@/types';

export async function submitReview(rentalId: number, rating: number, comment: string = ''): Promise<Review> {
  const payload: ReviewCreateRequest = { rentalId, rating, comment };
  const response = await apiClient.post<ApiResponse<Review>>('/api/reviews', payload);
  if (!response.data) {
    throw new Error('Failed to submit review.');
  }
  return response.data;
}

export async function getCustomerReviews(customerId: number): Promise<Review[]> {
  const response = await apiClient.get<ApiCollectionResponse<Review>>(`/api/customers/${customerId}/reviews`);
  return response.data ?? [];
}

export async function getVehicleReviews(vehicleId: number): Promise<Review[]> {
  const response = await apiClient.get<ApiCollectionResponse<Review>>(`/api/vehicles/${vehicleId}/reviews`);
  return response.data ?? [];
}
