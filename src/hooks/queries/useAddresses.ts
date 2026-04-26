import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  checkAddress,
  createAddress,
  deleteAddress,
  getAddresses,
  type CreateAddressInput,
} from '@/api/addresses';
import { getAuthToken } from '@/api/client';
import type { Address } from '@/types';
import { queryKeys } from './queryKeys';

/** GET /addresses — only enabled for authenticated users. */
export function useAddresses() {
  return useQuery<Address[]>({
    queryKey: queryKeys.addresses,
    queryFn: async () => (await getAddresses()) ?? [],
    enabled: Boolean(getAuthToken()),
    staleTime: 60 * 1000,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAddressInput) => createAddress(input),
    onSuccess: (list) => qc.setQueryData(queryKeys.addresses, list),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }),
  });
}

/**
 * Imperative zone-check mutation — used by CheckoutScreen to validate
 * the address right before submitting an order. Caching is fine but
 * mutation form keeps the call site explicit.
 */
export function useCheckAddress() {
  return useMutation({
    mutationFn: (input: { street: string; house: string }) => checkAddress(input),
  });
}
