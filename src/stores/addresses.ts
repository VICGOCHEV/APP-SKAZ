import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Address } from '@/types';

type AddressesStore = {
  list: Address[];
  add: (address: Omit<Address, 'id'>) => Address;
  update: (id: string, patch: Partial<Address>) => void;
  remove: (id: string) => void;
};

function makeId() {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useAddressesStore = create<AddressesStore>()(
  persist(
    (set) => ({
      list: [],
      add: (address) => {
        const created: Address = { ...address, id: makeId() };
        set((s) => ({ list: [created, ...s.list] }));
        return created;
      },
      update: (id, patch) =>
        set((s) => ({
          list: s.list.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),
      remove: (id) => set((s) => ({ list: s.list.filter((a) => a.id !== id) })),
    }),
    { name: 'skazka:addresses' },
  ),
);
