import { apiClient, getAuthToken, mockDelay, USE_MOCKS } from './client';
import { apiAddressToAddress } from './adapters';
import type {
  ApiAddress,
  ApiCheckAddressRequest,
  ApiCheckAddressResponse,
  ApiCreateAddressInline,
} from './schema';
import type { Address } from '@/types';

/** GET /addresses — returns null when unauthenticated (caller falls back to local). */
export async function getAddresses(): Promise<Address[] | null> {
  if (!getAuthToken()) return null;
  if (USE_MOCKS) return mockDelay([], 100);
  const { data } = await apiClient.get<ApiAddress[]>('/addresses');
  return (data ?? []).map(apiAddressToAddress);
}

export type CreateAddressInput = {
  street: string;
  house: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
};

/** POST /addresses — backend returns the full updated list. */
export async function createAddress(input: CreateAddressInput): Promise<Address[]> {
  if (USE_MOCKS) return mockDelay([], 200);
  const body: ApiCreateAddressInline = {
    street: input.street,
    house: input.house,
    entrance: input.entrance,
    floor: input.floor,
    apartment: input.apartment,
  };
  const { data } = await apiClient.post<ApiAddress[]>('/addresses', body);
  return (data ?? []).map(apiAddressToAddress);
}

export async function deleteAddress(id: string): Promise<void> {
  if (USE_MOCKS) return;
  await apiClient.delete(`/addresses/${encodeURIComponent(id)}`);
}

/**
 * POST /addresses/check — verify the address falls in the delivery zone
 * before submitting an order. Returns delivery price when in zone, or
 * an error string when out of zone.
 */
export async function checkAddress(input: ApiCheckAddressRequest): Promise<ApiCheckAddressResponse> {
  if (USE_MOCKS) return mockDelay({ error: null, price: 250 }, 200);
  const { data } = await apiClient.post<ApiCheckAddressResponse>('/addresses/check', input);
  return data;
}
