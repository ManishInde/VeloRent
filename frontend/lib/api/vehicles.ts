import { apiClient } from './client';
import { ApiResponse, ApiCollectionResponse, Vehicle, VehicleHealth, Review, VehicleFilterParams } from '@/types';

export async function getVehicles(filters?: VehicleFilterParams): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.fuelType) params.set('fuelType', filters.fuelType);
  if (filters?.transmission) params.set('transmission', filters.transmission);
  if (filters?.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters?.categoryId) params.set('categoryId', String(filters.categoryId));

  const qs = params.toString();
  const endpoint = qs ? `/api/vehicles?${qs}` : '/api/vehicles';
  const res = await apiClient.get<ApiCollectionResponse<Vehicle>>(endpoint);
  return res.data ?? [];
}

export async function getVehicleById(id: number): Promise<Vehicle> {
  const res = await apiClient.get<ApiResponse<Vehicle>>(`/api/vehicles/${id}`);
  return res.data!;
}

export async function getVehicleHealth(id: number): Promise<VehicleHealth> {
  const res = await apiClient.get<ApiResponse<VehicleHealth>>(`/api/vehicles/${id}/health`);
  return res.data!;
}

export async function getVehicleReviews(id: number): Promise<Review[]> {
  const res = await apiClient.get<ApiCollectionResponse<Review>>(`/api/vehicles/${id}/reviews`);
  return res.data ?? [];
}
