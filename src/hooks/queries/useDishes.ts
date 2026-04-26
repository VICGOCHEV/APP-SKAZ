import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getDishById,
  getDishes,
  getDishesByCategory,
  searchDishes,
} from '@/api/dishes';
import type { Dish } from '@/types';
import { queryKeys } from './queryKeys';

export function useDishes() {
  return useQuery({
    queryKey: queryKeys.dishes,
    queryFn: getDishes,
  });
}

/**
 * Single-dish query.
 *
 * Hydrates synchronously from the cached `useDishes` list when possible —
 * the menu/home screens already load the full product list, so the dish
 * sheet should open with the photo already rendered while a fresh
 * /products/:id call refines the data in the background.
 */
export function useDish(id: string | undefined) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: id ? queryKeys.dish(id) : queryKeys.dish(''),
    queryFn: () => getDishById(id!),
    enabled: Boolean(id),
    placeholderData: () => {
      if (!id) return undefined;
      const list = qc.getQueryData<Dish[]>(queryKeys.dishes);
      return list?.find((d) => d.id === id);
    },
  });
}

export function useDishesByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: categoryId ? queryKeys.dishesByCategory(categoryId) : queryKeys.dishesByCategory(''),
    queryFn: () => getDishesByCategory(categoryId!),
    enabled: Boolean(categoryId),
  });
}

export function useDishesSearch(query: string) {
  return useQuery({
    queryKey: queryKeys.dishesSearch(query),
    queryFn: () => searchDishes(query),
    enabled: query.trim().length > 0,
  });
}
