import { mockDelay, USE_MOCKS } from './client';
import { categories as mockCategories } from '@/mocks/categories';
import { cuisines as mockCuisines } from '@/mocks/cuisines';
import type { Category, Cuisine } from '@/types';

export async function getCategories(): Promise<Category[]> {
  if (USE_MOCKS) return mockDelay(mockCategories, 200);
  throw new Error('Real /categories endpoint not wired yet');
}

export async function getCuisines(): Promise<Cuisine[]> {
  if (USE_MOCKS) return mockDelay(mockCuisines, 150);
  throw new Error('Real /cuisines endpoint not wired yet');
}
