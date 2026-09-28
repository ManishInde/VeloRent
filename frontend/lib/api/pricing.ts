import { apiClient } from './client';
import { ApiResponse, PricingQuote, PricingQuoteRequest } from '@/types';

export async function getPricingQuote(req: PricingQuoteRequest): Promise<PricingQuote> {
  const res = await apiClient.post<ApiResponse<PricingQuote>>('/api/pricing/quote', req);
  return res.data!;
}
