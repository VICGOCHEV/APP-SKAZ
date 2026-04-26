import { apiClient, getAuthToken, mockDelay, USE_MOCKS } from './client';
import { apiCartToCartItems } from './adapters';
import type {
  ApiAddModifierToCartItemRequest,
  ApiAddToCartRequest,
  ApiCart,
  ApiCartRemoveRequest,
} from './schema';
import type { CartItem } from '@/types';

/**
 * Fetch server cart for authenticated user.
 * Returns null if user is not authenticated (no token) — caller falls back
 * to the local Zustand store.
 *
 * Backend returns CartData { total, items[] } — total is recomputed server-side
 * after every mutation, so it's the source of truth. We adapt it to frontend
 * CartItem[] with `serverId` set so subsequent mutations can target the right row.
 */
export async function getCart(): Promise<CartItem[] | null> {
  if (!getAuthToken()) return null;
  if (USE_MOCKS) return mockDelay([], 100);
  const { data } = await apiClient.get<ApiCart>('/cart');
  return apiCartToCartItems(data);
}

export type AddToCartInput = {
  productId: string;
  quantity?: number;
  modifiers?: { modifierId: string; quantity?: number }[];
};

/**
 * Add (or set quantity for) a product in the server cart.
 * Backend "Add product to cart, and change quantity" — POST with the same
 * product_id replaces the quantity for that product line.
 *
 * After the POST we re-fetch /cart so we get the authoritative shape back
 * (including the new cart_item_id and recomputed total).
 */
export async function addToCart(input: AddToCartInput): Promise<CartItem[]> {
  if (USE_MOCKS) return mockDelay([], 200);
  const body: ApiAddToCartRequest = {
    product_id: input.productId,
    quantity: input.quantity ?? 1,
    modifiers: input.modifiers?.map((m) => ({
      modifier_id: m.modifierId,
      quantity: m.quantity ?? 1,
    })),
  };
  await apiClient.post('/cart', body);
  return (await getCart()) ?? [];
}

/** Remove one or more items from the cart by cart_item_id. */
export async function removeFromCart(cartItemIds: string[]): Promise<CartItem[]> {
  if (USE_MOCKS) return mockDelay([], 200);
  if (cartItemIds.length === 0) return (await getCart()) ?? [];
  const body: ApiCartRemoveRequest = { cart_item_ids: cartItemIds };
  await apiClient.delete('/cart', { data: body });
  return (await getCart()) ?? [];
}

/** Attach a modifier to an existing cart item (edits an already-added item). */
export async function addModifierToCartItem(input: {
  cartItemId: string;
  modifierId: string;
  quantity?: number;
}): Promise<CartItem[]> {
  if (USE_MOCKS) return mockDelay([], 200);
  const body: ApiAddModifierToCartItemRequest = {
    cart_item_id: input.cartItemId,
    modifier_id: input.modifierId,
    quantity: input.quantity ?? 1,
  };
  await apiClient.post(`/cart/item/${encodeURIComponent(input.cartItemId)}`, body);
  return (await getCart()) ?? [];
}

/** Wipe the server cart (called after order is created or on logout). */
export async function clearServerCart(): Promise<void> {
  const items = await getCart();
  if (!items || items.length === 0) return;
  const ids = items.map((it) => it.serverId).filter((id): id is string => Boolean(id));
  if (ids.length === 0) return;
  await removeFromCart(ids);
}
