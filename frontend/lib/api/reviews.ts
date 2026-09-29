import { apiClient } from './client';
import { Review, ApiResponse, ApiCollectionResponse, ReviewCreateRequest, StaffReview } from '@/types';

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

export async function getRentalReview(rentalId: number): Promise<Review | null> {
  try {
    const response = await apiClient.get<ApiResponse<Review>>(`/api/rentals/${rentalId}/review`);
    return response.data ?? null;
  } catch {
    return null;
  }
}

export interface ReviewFilters {
  vehicleId?: number;
  rating?: number;
  search?: string;
}

export async function getAllReviews(filters?: ReviewFilters): Promise<StaffReview[]> {
  const params = new URLSearchParams();
  if (filters?.vehicleId) params.append('vehicleId', String(filters.vehicleId));
  if (filters?.rating) params.append('rating', String(filters.rating));
  if (filters?.search) params.append('search', filters.search);

  const qs = params.toString();
  const endpoint = qs ? `/api/reviews?${qs}` : '/api/reviews';
  const response = await apiClient.get<ApiCollectionResponse<StaffReview>>(endpoint);
  return response.data ?? [];
}
