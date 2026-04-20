import { useQuery } from '@tanstack/react-query';
import { getPromoById, getPromos } from '@/api/promos';
import { queryKeys } from './queryKeys';

export function usePromos() {
  return useQuery({
    queryKey: queryKeys.promos,
    queryFn: getPromos,
  });
}

export function usePromo(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.promo(id) : queryKeys.promo(''),
    queryFn: () => getPromoById(id!),
    enabled: Boolean(id),
  });
}
