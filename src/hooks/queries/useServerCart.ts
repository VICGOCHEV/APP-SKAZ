import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addToCart as apiAddToCart,
  getCart as apiGetCart,
  removeFromCart as apiRemoveFromCart,
  type AddToCartInput,
} from '@/api/cart';
import { getAuthToken } from '@/api/client';
import type { CartItem } from '@/types';
import { queryKeys } from './queryKeys';

/**
 * Server cart query — only enabled when a token is present.
 * Returns CartItem[] (already adapted) or [] when unauthenticated.
 */
export function useServerCartQuery() {
  return useQuery<CartItem[]>({
    queryKey: queryKeys.cart,
    queryFn: async () => (await apiGetCart()) ?? [],
    enabled: Boolean(getAuthToken()),
    staleTime: 30 * 1000,
  });
}

export function useServerCartMutations() {
  const qc = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (input: AddToCartInput) => apiAddToCart(input),
    onSuccess: (items) => qc.setQueryData(queryKeys.cart, items),
  });

  const removeMutation = useMutation({
    mutationFn: (cartItemIds: string[]) => apiRemoveFromCart(cartItemIds),
    onSuccess: (items) => qc.setQueryData(queryKeys.cart, items),
  });

  return { addMutation, removeMutation };
}
