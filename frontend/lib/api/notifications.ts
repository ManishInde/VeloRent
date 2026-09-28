import { apiClient } from './client';
import { Notification, ApiResponse, ApiCollectionResponse } from '@/types';

export async function getUserNotifications(userId: number, unreadOnly: boolean = false): Promise<Notification[]> {
  const query = unreadOnly ? '?unreadOnly=true' : '';
  const response = await apiClient.get<ApiCollectionResponse<Notification>>(`/api/customers/${userId}/notifications${query}`);
  return response.data ?? [];
}

export async function markNotificationAsRead(notificationId: number): Promise<Notification> {
  const response = await apiClient.patch<ApiResponse<Notification>>(`/api/notifications/${notificationId}/read`);
  if (!response.data) {
    throw new Error('Failed to mark notification as read.');
  }
  return response.data;
}
