import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Dish } from '@/types';

type AddOpts = {
  quantity?: number;
  weight?: number;
  modifiers?: string[];
};

type CartStore = {
  items: CartItem[];
  addDish: (dish: Dish, opts?: AddOpts) => void;
  removeAt: (index: number) => void;
  updateAt: (index: number, patch: Partial<CartItem>) => void;
  clear: () => void;
};

function computePrice(dish: Dish, quantity: number, weight?: number): number {
  if (dish.isWeighted) {
    const w = weight ?? dish.baseWeight;
    const perGram = dish.price / dish.baseWeight;
    return Math.round((perGram * w) / 10) * 10;
  }
  return dish.price * quantity;
}

function sameInstance(a: CartItem, b: Pick<CartItem, 'dishId' | 'weight' | 'modifiers'>): boolean {
  if (a.dishId !== b.dishId) return false;
  if ((a.weight ?? null) !== (b.weight ?? null)) return false;
  if (a.modifiers.length !== b.modifiers.length) return false;
  return a.modifiers.every((m) => b.modifiers.includes(m));
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addDish: (dish, opts) =>
        set((state) => {
          const quantity = opts?.quantity ?? 1;
          const weight = dish.isWeighted ? (opts?.weight ?? dish.baseWeight) : undefined;
          const modifiers = opts?.modifiers ?? [];
          const key = { dishId: dish.id, weight, modifiers };
          const existingIndex = state.items.findIndex((it) => sameInstance(it, key));

          if (existingIndex >= 0 && !dish.isWeighted) {
            const next = [...state.items];
            const it = next[existingIndex];
            const nextQty = it.quantity + quantity;
            next[existingIndex] = {
              ...it,
              quantity: nextQty,
              price: computePrice(dish, nextQty, it.weight),
            };
            return { items: next };
          }

          return {
            items: [
              ...state.items,
              {
                dishId: dish.id,
                quantity,
                weight,
                modifiers,
                price: computePrice(dish, quantity, weight),
              },
            ],
          };
        }),
      removeAt: (index) =>
        set((state) => ({ items: state.items.filter((_, i) => i !== index) })),
      updateAt: (index, patch) =>
        set((state) => {
          const next = [...state.items];
          next[index] = { ...next[index], ...patch };
          return { items: next };
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'skazka:cart',
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

export function selectCartCount(state: CartStore): number {
  return state.items.reduce((sum, it) => sum + it.quantity, 0);
}

export function selectCartTotal(state: CartStore): number {
  return state.items.reduce((sum, it) => sum + it.price, 0);
}
