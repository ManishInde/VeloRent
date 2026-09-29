import { apiClient } from './client';
import {
  FleetAnalyticsReport,
  FleetInsight,
  CustomerRiskResult,
  Vehicle,
  VehicleCreateRequest,
  VehicleUpdateRequest,
  VehicleStatus,
  Notification,
  NotificationCreateRequest,
  ApiResponse,
  ApiCollectionResponse,
} from '@/types';

export async function getFleetAnalytics(): Promise<FleetAnalyticsReport> {
  const response = await apiClient.get<ApiResponse<FleetAnalyticsReport>>('/api/fleet/analytics', {
    cache: 'no-store',
  });
  if (!response.data) {
    throw new Error('Failed to load fleet analytics report.');
  }
  return response.data;
}

export async function getFleetInsights(): Promise<FleetInsight[]> {
  const response = await apiClient.get<ApiCollectionResponse<FleetInsight>>('/api/fleet/insights', {
    cache: 'no-store',
  });
  return response.data ?? [];
}

export async function createVehicle(payload: VehicleCreateRequest): Promise<Vehicle> {
  const response = await apiClient.post<ApiResponse<Vehicle>>('/api/vehicles', payload);
  if (!response.data) {
    throw new Error('Failed to create vehicle.');
  }
  return response.data;
}

export async function updateVehicle(id: number, payload: VehicleUpdateRequest): Promise<Vehicle> {
  const response = await apiClient.put<ApiResponse<Vehicle>>(`/api/vehicles/${id}`, payload);
  if (!response.data) {
    throw new Error(`Failed to update vehicle #${id}.`);
  }
  return response.data;
}

export async function updateVehicleStatus(id: number, status: VehicleStatus): Promise<Vehicle> {
  const response = await apiClient.patch<ApiResponse<Vehicle>>(`/api/vehicles/${id}/status`, { status });
  if (!response.data) {
    throw new Error(`Failed to update status for vehicle #${id}.`);
  }
  return response.data;
}

export async function deleteVehicle(id: number): Promise<boolean> {
  await apiClient.delete<ApiResponse<unknown>>(`/api/vehicles/${id}`);
  return true;
}

export async function getCustomerRiskScore(customerId: number): Promise<CustomerRiskResult> {
  const response = await apiClient.get<ApiResponse<CustomerRiskResult>>(`/api/customers/${customerId}/risk`);
  if (!response.data) {
    throw new Error(`Failed to evaluate risk for Customer #${customerId}.`);
  }
  return response.data;
}

export async function sendNotification(payload: NotificationCreateRequest): Promise<Notification> {
  const response = await apiClient.post<ApiResponse<Notification>>('/api/notifications', payload);
  if (!response.data) {
    throw new Error('Failed to send system notification.');
  }
  return response.data;
}
