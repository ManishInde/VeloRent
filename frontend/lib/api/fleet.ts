import { apiClient } from './client';
import {
  ApiResponse,
  ApiCollectionResponse,
  VehicleAllocationRequest,
  VehicleAllocationResult,
  MaintenanceTask,
  MaintenanceScheduleRequest,
  MaintenanceStatus,
} from '@/types';

/**
 * Invokes C++ VehicleAllocationEngine via POST /api/vehicles/allocate
 */
export async function allocateVehicle(req: VehicleAllocationRequest): Promise<VehicleAllocationResult> {
  const response = await apiClient.post<ApiResponse<VehicleAllocationResult>>('/api/vehicles/allocate', req);
  if (!response.data) {
    throw new Error(response.error?.message || 'No suitable vehicle allocation found.');
  }
  return response.data;
}

/**
 * Fetches open or vehicle-specific maintenance tasks via GET /api/maintenance
 */
export async function getMaintenanceTasks(vehicleId?: number): Promise<MaintenanceTask[]> {
  const endpoint = vehicleId ? `/api/maintenance?vehicleId=${vehicleId}` : '/api/maintenance';
  const response = await apiClient.get<ApiCollectionResponse<MaintenanceTask>>(endpoint);
  return response.data ?? [];
}

/**
 * Schedules a new maintenance task via POST /api/maintenance
 */
export async function scheduleMaintenance(payload: MaintenanceScheduleRequest): Promise<MaintenanceTask> {
  const response = await apiClient.post<ApiResponse<MaintenanceTask>>('/api/maintenance', payload);
  if (!response.data) {
    throw new Error(response.error?.message || 'Failed to schedule maintenance task.');
  }
  return response.data;
}

/**
 * Updates operational status of a maintenance task via PATCH /api/maintenance/:id/status
 */
export async function updateMaintenanceStatus(id: number, status: MaintenanceStatus): Promise<MaintenanceTask> {
  const response = await apiClient.patch<ApiResponse<MaintenanceTask>>(`/api/maintenance/${id}/status`, { status });
  if (!response.data) {
    throw new Error(response.error?.message || `Failed to update status for maintenance task #${id}.`);
  }
  return response.data;
}

/**
 * Fetches a single maintenance task by ID via GET /api/maintenance/:id
 */
export async function getMaintenanceTaskById(id: number): Promise<MaintenanceTask> {
  const response = await apiClient.get<ApiResponse<MaintenanceTask>>(`/api/maintenance/${id}`);
  if (!response.data) {
    throw new Error(response.error?.message || `Maintenance task #${id} not found.`);
  }
  return response.data;
}

/**
 * Completes a maintenance task via POST /api/maintenance/:id/complete
 */
export async function completeMaintenanceTask(
  id: number,
  totalCost: number,
  notes?: string
): Promise<MaintenanceTask> {
  const response = await apiClient.post<ApiResponse<MaintenanceTask>>(`/api/maintenance/${id}/complete`, {
    totalCost,
    notes: notes || 'Completed via Maintenance Workbench',
  });
  if (!response.data) {
    throw new Error(response.error?.message || `Failed to complete maintenance task #${id}.`);
  }
  return response.data;
}

