import { useCallback } from 'react';
import { selectCartCount, selectCartTotal, useCartStore } from '@/stores/cart';
import { useServerCartMutations, useServerCartQuery } from '@/hooks/queries/useServerCart';
import { useUserStore } from '@/stores/user';
import type { CartItem, Dish } from '@/types';

type AddOpts = {
  quantity?: number;
  weight?: number;
  modifiers?: string[];
};

type CartFacade = {
  items: CartItem[];
  count: number;
  total: number;
  addDish: (dish: Dish, opts?: AddOpts) => void;
  setQuantity: (index: number, dish: Dish, quantity: number) => void;
  setWeight: (index: number, dish: Dish, weight: number) => void;
  removeAt: (index: number) => void;
  updateAt: (index: number, patch: Partial<CartItem>) => void;
  clear: () => void;
  /** Whether mutations are flying to the server right now. */
  isMutating: boolean;
};

/**
 * Unified cart hook.
 *
 * Picks one of two backends based on auth status:
 *   - authenticated → server cart via /cart endpoints (TanStack Query)
 *   - guest         → local Zustand store (persisted to localStorage)
 *
 * The interface is identical so screens don't need to know which mode
 * they're in. The `setWeight` op is a no-op in server mode because
 * the backend has no concept of weight-based products (all real products
 * use integer quantity); weighted UI exists only for the legacy mock data.
 */
export function useCart(): CartFacade {
  const isAuthed = useUserStore((s) => s.status === 'authenticated');

  const localItems = useCartStore((s) => s.items);
  const localAddDish = useCartStore((s) => s.addDish);
  const localSetQuantity = useCartStore((s) => s.setQuantity);
  const localSetWeight = useCartStore((s) => s.setWeight);
  const localRemoveAt = useCartStore((s) => s.removeAt);
  const localUpdateAt = useCartStore((s) => s.updateAt);
  const localClear = useCartStore((s) => s.clear);
  const localCount = useCartStore(selectCartCount);
  const localTotal = useCartStore(selectCartTotal);

  const serverQuery = useServerCartQuery();
  const { addMutation, removeMutation } = useServerCartMutations();

  const serverItems = serverQuery.data ?? [];
  const serverCount = serverItems.reduce((s, it) => s + it.quantity, 0);
  const serverTotal = serverItems.reduce((s, it) => s + it.price, 0);

  const addDishServer = useCallback(
    (dish: Dish, opts?: AddOpts) => {
      const portions = dish.isWeighted && opts?.weight && dish.baseWeight
        ? Math.max(1, Math.round(opts.weight / dish.baseWeight))
        : (opts?.quantity ?? 1);
      addMutation.mutate({
        productId: dish.id,
        quantity: portions,
        modifiers: (opts?.modifiers ?? []).map((id) => ({ modifierId: id })),
      });
    },
    [addMutation],
  );

  const setQuantityServer = useCallback(
    (index: number, dish: Dish, quantity: number) => {
      const item = serverItems[index];
      if (!item) return;
      if (quantity <= 0 && item.serverId) {
        removeMutation.mutate([item.serverId]);
        return;
      }
      addMutation.mutate({
        productId: dish.id,
        quantity,
        modifiers: item.modifiers.map((id) => ({ modifierId: id })),
      });
    },
    [serverItems, addMutation, removeMutation],
  );

  const setWeightServer = useCallback(
    (index: number, dish: Dish, weight: number) => {
      const item = serverItems[index];
      if (!item || !dish.baseWeight) return;
      const portions = Math.max(1, Math.round(weight / dish.baseWeight));
      addMutation.mutate({
        productId: dish.id,
        quantity: portions,
        modifiers: item.modifiers.map((id) => ({ modifierId: id })),
      });
    },
    [serverItems, addMutation],
  );

  const removeAtServer = useCallback(
    (index: number) => {
      const item = serverItems[index];
      if (!item?.serverId) return;
      removeMutation.mutate([item.serverId]);
    },
    [serverItems, removeMutation],
  );

  const clearServer = useCallback(() => {
    const ids = serverItems.map((it) => it.serverId).filter((id): id is string => Boolean(id));
    if (ids.length === 0) return;
    removeMutation.mutate(ids);
  }, [serverItems, removeMutation]);

  if (isAuthed) {
    return {
      items: serverItems,
      count: serverCount,
      total: serverTotal,
      addDish: addDishServer,
      setQuantity: setQuantityServer,
      setWeight: setWeightServer,
      removeAt: removeAtServer,
      updateAt: () => {
        /* not used in server mode */
      },
      clear: clearServer,
      isMutating: addMutation.isPending || removeMutation.isPending,
    };
  }

  return {
    items: localItems,
    count: localCount,
    total: localTotal,
    addDish: localAddDish,
    setQuantity: localSetQuantity,
    setWeight: localSetWeight,
    removeAt: localRemoveAt,
    updateAt: localUpdateAt,
    clear: localClear,
    isMutating: false,
  };
}

/**
 * Lightweight count-only hook used by the bottom nav badge.
 * Avoids triggering the full server cart fetch chain when the user
 * is anonymous — falls back to the local store count instead.
 */
export function useCartCount(): number {
  const isAuthed = useUserStore((s) => s.status === 'authenticated');
  const localCount = useCartStore(selectCartCount);
  const serverQuery = useServerCartQuery();
  if (isAuthed) {
    return (serverQuery.data ?? []).reduce((s, it) => s + it.quantity, 0);
  }
  return localCount;
}
