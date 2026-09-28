import { apiClient } from './client';
import { ApiResponse, ApiCollectionResponse, Booking, BookingCreateRequest } from '@/types';

export async function createBooking(req: BookingCreateRequest): Promise<Booking> {
  const res = await apiClient.post<ApiResponse<Booking>>('/api/bookings', req);
  return res.data!;
}

export async function getBookingById(id: number): Promise<Booking> {
  const res = await apiClient.get<ApiResponse<Booking>>(`/api/bookings/${id}`);
  return res.data!;
}

export async function cancelBooking(id: number, reason?: string): Promise<Booking> {
  const body = reason ? { reason } : undefined;
  const res = await apiClient.post<ApiResponse<Booking>>(`/api/bookings/${id}/cancel`, body);
  return res.data!;
}

export async function getMyBookings(customerId: number): Promise<Booking[]> {
  const res = await apiClient.get<ApiCollectionResponse<Booking>>(`/api/customers/${customerId}/bookings`);
  return res.data ?? [];
}
