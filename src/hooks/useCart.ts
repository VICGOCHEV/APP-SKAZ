import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { selectCartCount, selectCartTotal, useCartStore } from '@/stores/cart';
import { queryKeys } from '@/hooks/queries/queryKeys';
import { useServerCartMutations, useServerCartQuery } from '@/hooks/queries/useServerCart';
import { useUserStore } from '@/stores/user';
import { trackEvent } from '@/lib/analytics';
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

  const qc = useQueryClient();
  const serverQuery = useServerCartQuery();
  const { addMutation, removeMutation, changeQuantityMutation } = useServerCartMutations();

  const serverItems = useMemo(() => serverQuery.data ?? [], [serverQuery.data]);
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
      trackEvent('add_to_cart', {
        dish_id: dish.id,
        dish_name: dish.name,
        price: dish.price,
        quantity: portions,
        weighted: dish.isWeighted,
      });
    },
    [addMutation],
  );

  /**
   * Set absolute quantity for a cart line via PATCH /cart/item — the proper
   * "change quantity" endpoint exposed by `cart.changeQuantity` on the backend.
   * Cache is patched optimistically so the stepper feels instant; on failure
   * we invalidate to resync with the server.
   *
   * A quantity of 0 deletes the line (PATCH would 422 — use DELETE instead).
   */
  const setQuantityServer = useCallback(
    async (index: number, dish: Dish, quantity: number) => {
      const item = serverItems[index];
      if (!item?.serverId) return;

      qc.setQueryData<CartItem[]>(queryKeys.cart, (prev) => {
        if (!prev) return prev;
        if (quantity <= 0) return prev.filter((_, i) => i !== index);
        return prev.map((it, i) =>
          i === index ? { ...it, quantity, price: dish.price * quantity } : it,
        );
      });

      try {
        if (quantity <= 0) {
          await removeMutation.mutateAsync([item.serverId]);
        } else {
          await changeQuantityMutation.mutateAsync({
            cartItemId: item.serverId,
            quantity,
          });
        }
      } catch {
        qc.invalidateQueries({ queryKey: queryKeys.cart });
      }
    },
    [serverItems, removeMutation, changeQuantityMutation, qc],
  );

  /**
   * Weight slider — for weighted dishes (мангал, гриль) the cart line stores
   * integer portions in `quantity`, displayed as grams = portions × baseWeight.
   * Adjusting weight = adjusting portion count via the same PATCH endpoint.
   */
  const setWeightServer = useCallback(
    async (index: number, dish: Dish, weight: number) => {
      const item = serverItems[index];
      if (!item?.serverId || !dish.baseWeight) return;
      const portions = Math.max(1, Math.round(weight / dish.baseWeight));

      qc.setQueryData<CartItem[]>(queryKeys.cart, (prev) => {
        if (!prev) return prev;
        return prev.map((it, i) =>
          i === index
            ? {
                ...it,
                weight: dish.baseWeight * portions,
                price: dish.price * portions,
              }
            : it,
        );
      });

      try {
        await changeQuantityMutation.mutateAsync({
          cartItemId: item.serverId,
          quantity: portions,
        });
      } catch {
        qc.invalidateQueries({ queryKey: queryKeys.cart });
      }
    },
    [serverItems, changeQuantityMutation, qc],
  );

  const removeAtServer = useCallback(
    (index: number) => {
      const item = serverItems[index];
      if (!item?.serverId) return;
      // Optimistic: drop the row from cache so the row exits immediately
      qc.setQueryData<CartItem[]>(queryKeys.cart, (prev) =>
        prev ? prev.filter((_, i) => i !== index) : prev,
      );
      removeMutation.mutate([item.serverId], {
        onError: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
      });
    },
    [serverItems, removeMutation, qc],
  );

  const clearServer = useCallback(() => {
    const ids = serverItems.map((it) => it.serverId).filter((id): id is string => Boolean(id));
    if (ids.length === 0) return;
    removeMutation.mutate(ids);
  }, [serverItems, removeMutation]);

  const addDishLocal = useCallback(
    (dish: Dish, opts?: AddOpts) => {
      localAddDish(dish, opts);
      trackEvent('add_to_cart', {
        dish_id: dish.id,
        dish_name: dish.name,
        price: dish.price,
        quantity: opts?.quantity ?? 1,
        weighted: dish.isWeighted,
      });
    },
    [localAddDish],
  );

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
      isMutating:
        addMutation.isPending ||
        removeMutation.isPending ||
        changeQuantityMutation.isPending,
    };
  }

  return {
    items: localItems,
    count: localCount,
    total: localTotal,
    addDish: addDishLocal,
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
