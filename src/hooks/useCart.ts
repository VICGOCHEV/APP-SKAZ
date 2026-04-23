import { selectCartCount, selectCartTotal, useCartStore } from '@/stores/cart';

export function useCart() {
  const items = useCartStore((s) => s.items);
  const addDish = useCartStore((s) => s.addDish);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const setWeight = useCartStore((s) => s.setWeight);
  const removeAt = useCartStore((s) => s.removeAt);
  const updateAt = useCartStore((s) => s.updateAt);
  const clear = useCartStore((s) => s.clear);
  const count = useCartStore(selectCartCount);
  const total = useCartStore(selectCartTotal);
  return { items, addDish, setQuantity, setWeight, removeAt, updateAt, clear, count, total };
}

export const useCartCount = () => useCartStore(selectCartCount);
