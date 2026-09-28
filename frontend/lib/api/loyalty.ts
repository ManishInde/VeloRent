import { apiClient } from './client';
import { LoyaltyAccount, ApiResponse, LoyaltyRedeemRequest, LoyaltyRedeemResponse } from '@/types';

export async function getCustomerLoyalty(customerId: number): Promise<LoyaltyAccount> {
  const response = await apiClient.get<ApiResponse<LoyaltyAccount>>(`/api/customers/${customerId}/loyalty`);
  if (!response.data) {
    return {
      id: 0,
      customerId,
      currentPoints: 0,
      totalPointsEarned: 0,
      tier: 'BRONZE',
      lastUpdated: new Date().toISOString(),
    };
  }
  return response.data;
}

export async function redeemLoyaltyPoints(
  customerId: number,
  points: number,
  rentalSubtotal: number
): Promise<LoyaltyRedeemResponse> {
  const payload: LoyaltyRedeemRequest = { points, rentalSubtotal };
  const response = await apiClient.post<ApiResponse<LoyaltyRedeemResponse>>(
    `/api/customers/${customerId}/loyalty/redeem`,
    payload
  );
  if (!response.data) {
    throw new Error('Loyalty points redemption failed.');
  }
  return response.data;
}
