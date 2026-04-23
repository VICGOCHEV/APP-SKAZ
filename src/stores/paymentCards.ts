import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PaymentCardBrand = 'visa' | 'mastercard' | 'mir' | 'other';

export type PaymentCard = {
  id: string;
  brand: PaymentCardBrand;
  last4: string;
  expiry: string;
  holder?: string;
  isDefault?: boolean;
};

type CardsStore = {
  list: PaymentCard[];
  add: (card: Omit<PaymentCard, 'id'>) => PaymentCard;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
};

function makeId() {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function detectBrand(pan: string): PaymentCardBrand {
  const digits = pan.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^220[0-4]/.test(digits)) return 'mir';
  return 'other';
}

export const usePaymentCardsStore = create<CardsStore>()(
  persist(
    (set) => ({
      list: [],
      add: (card) => {
        const created: PaymentCard = { ...card, id: makeId() };
        set((s) => {
          const list = s.list.map((c) => ({ ...c, isDefault: false }));
          return { list: [{ ...created, isDefault: true }, ...list] };
        });
        return created;
      },
      remove: (id) =>
        set((s) => {
          const list = s.list.filter((c) => c.id !== id);
          if (list.length && !list.some((c) => c.isDefault)) {
            list[0] = { ...list[0], isDefault: true };
          }
          return { list };
        }),
      setDefault: (id) =>
        set((s) => ({
          list: s.list.map((c) => ({ ...c, isDefault: c.id === id })),
        })),
    }),
    { name: 'skazka:payment-cards' },
  ),
);
