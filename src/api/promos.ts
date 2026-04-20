import { mockDelay, USE_MOCKS } from './client';
import { promos as mockPromos } from '@/mocks/promos';
import type { Promo } from '@/types';

export async function getPromos(): Promise<Promo[]> {
  if (USE_MOCKS) return mockDelay(mockPromos, 200);
  throw new Error('Real /promos endpoint not wired yet');
}

export async function getPromoById(id: string): Promise<Promo> {
  if (USE_MOCKS) {
    const promo = mockPromos.find((p) => p.id === id);
    if (!promo) throw new Error(`Акция ${id} не найдена`);
    return mockDelay(promo, 150);
  }
  throw new Error('Real /promos/:id endpoint not wired yet');
}
