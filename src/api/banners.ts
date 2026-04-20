import { mockDelay, USE_MOCKS } from './client';
import { banners as mockBanners } from '@/mocks/banners';
import type { Banner } from '@/types';

export async function getBanners(): Promise<Banner[]> {
  if (USE_MOCKS) return mockDelay(mockBanners, 200);
  throw new Error('Real /banners endpoint not wired yet');
}
