import { useQuery } from '@tanstack/react-query';
import { getCategories, getCuisines } from '@/api/categories';
import { queryKeys } from './queryKeys';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCuisines() {
  return useQuery({
    queryKey: queryKeys.cuisines,
    queryFn: getCuisines,
    staleTime: 5 * 60 * 1000,
  });
}
