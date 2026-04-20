import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthStatus, User } from '@/types';

type UserStore = {
  user: User | null;
  status: AuthStatus;
  error?: string;
  setLoading: () => void;
  setUser: (user: User) => void;
  clear: () => void;
  setError: (error: string) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      status: 'idle',
      setLoading: () => set({ status: 'loading', error: undefined }),
      setUser: (user) => set({ user, status: 'authenticated', error: undefined }),
      clear: () => set({ user: null, status: 'unauthenticated', error: undefined }),
      setError: (error) => set({ status: 'unauthenticated', error }),
    }),
    {
      name: 'skazka:user',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
