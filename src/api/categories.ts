import { apiClient, mockDelay, USE_MOCKS } from './client';
import { apiCategoryToCategory } from './adapters';
import { categories as mockCategories } from '@/mocks/categories';
import { cuisines as mockCuisines } from '@/mocks/cuisines';
import type { ApiCategory } from './schema';
import type { Category, Cuisine } from '@/types';

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCKS) return mockDelay(mockCategories, 200);
  const { data } = await apiClient.get<ApiCategory[]>('/categories');
  return (data ?? []).map((c, i) => apiCategoryToCategory(c, i));
}

export async function getCuisines(): Promise<Cuisine[]> {
  // API has no cuisines concept — always use mock single-cuisine.
  if (USE_MOCKS) return mockDelay(mockCuisines, 150);
  return mockCuisines;
}
