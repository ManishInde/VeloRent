import { apiClient } from './client';
import { ApiCollectionResponse, Recommendation, RecommendationRequest } from '@/types';

export async function getRecommendations(prefs?: RecommendationRequest): Promise<Recommendation[]> {
  if (prefs && Object.values(prefs).some(v => v !== undefined && v !== '' && v !== 0)) {
    const res = await apiClient.post<ApiCollectionResponse<Recommendation>>('/api/recommendations', prefs);
    return res.data ?? [];
  }
  const res = await apiClient.get<ApiCollectionResponse<Recommendation>>('/api/recommendations');
  return res.data ?? [];
}
