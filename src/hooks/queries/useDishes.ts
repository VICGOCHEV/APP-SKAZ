import { useQuery } from '@tanstack/react-query';
import {
  getDishById,
  getDishes,
  getDishesByCategory,
  searchDishes,
} from '@/api/dishes';
import { queryKeys } from './queryKeys';

export function useDishes() {
  return useQuery({
    queryKey: queryKeys.dishes,
    queryFn: getDishes,
  });
}

export function useDish(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.dish(id) : queryKeys.dish(''),
    queryFn: () => getDishById(id!),
    enabled: Boolean(id),
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
