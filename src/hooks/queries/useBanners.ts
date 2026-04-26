import { useQuery } from '@tanstack/react-query';
import { getBanners } from '@/api/banners';
import { queryKeys } from './queryKeys';

export function useBanners() {
  return useQuery({
    queryKey: queryKeys.banners,
    queryFn: () => getBanners(),
  });
}
