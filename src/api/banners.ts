import { apiClient, mockDelay, USE_MOCKS } from './client';
import { apiBannerToBanner } from './adapters';
import { banners as mockBanners } from '@/mocks/banners';
import type { ApiBanner, ApiBannerFilter, ApiBannerType } from './schema';
import type { Banner } from '@/types';

/**
 * GET /banners — backend technically marks the request body as required
 * (FilterBannerRequest), but accepts an empty object too. Pass nothing
 * by default; the optional `type` arg filters MAIN/ADDITIONAL/CATALOG.
 */
export async function getBanners(type?: ApiBannerType): Promise<Banner[]> {
  if (USE_MOCKS) return mockDelay(mockBanners, 200);
  const filter: ApiBannerFilter = type ? { type } : {};
  const { data } = await apiClient.get<ApiBanner[]>('/banners', { data: filter });
  // Sort by `position` ascending when set so the slider matches admin order.
  const sorted = [...(data ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  return sorted.map((b, idx) => apiBannerToBanner(b, idx));
}
