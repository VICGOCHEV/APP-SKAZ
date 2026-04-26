import { createContext, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  getMe,
  loginWithEmail,
  loginWithTelegram,
  loginWithVk,
  logout as apiLogout,
  register,
  type RegisterInput,
} from '@/api/auth';
import { addToCart as apiAddToCart, getCart as apiGetCart } from '@/api/cart';
import { getAuthToken, USE_MOCKS } from '@/api/client';
import { queryKeys } from '@/hooks/queries/queryKeys';
import { useEnvironment } from '@/hooks/useEnvironment';
import { queryClient } from '@/lib/queryClient';
import { useCartStore } from '@/stores/cart';
import { useUserStore } from '@/stores/user';
import type { AuthStatus, User } from '@/types';

/**
 * After a user becomes authenticated, replay any locally-stored cart items
 * into the server cart, then clear the local store and prime the TanStack
 * cache with the authoritative server response.
 *
 * Best-effort: an individual item that fails to add (product gone, 422...)
 * is silently skipped — the rest still merge.
 */
async function syncLocalCartToServer() {
  const localItems = useCartStore.getState().items;
  if (localItems.length > 0) {
    for (const item of localItems) {
      try {
        await apiAddToCart({
          productId: item.dishId,
          quantity: item.quantity,
          modifiers: item.modifiers.map((id) => ({ modifierId: id })),
        });
      } catch {
        // skip failed item, continue merging
      }
    }
    useCartStore.getState().clear();
  }
  try {
    const fresh = await apiGetCart();
    queryClient.setQueryData(queryKeys.cart, fresh ?? []);
  } catch {
    queryClient.invalidateQueries({ queryKey: queryKeys.cart });
  }
}

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  error?: string;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { environment, isReady } = useEnvironment();
  const { user, status, error, setLoading, setUser, setError, clear } = useUserStore();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!isReady || bootstrapped.current) return;
    bootstrapped.current = true;

    // 1) TG/VK auto-login (mock-only for now)
    if (USE_MOCKS && (environment === 'tg' || environment === 'vk') && !user) {
      (async () => {
        setLoading();
        try {
          if (environment === 'tg') {
            const initData = window.Telegram?.WebApp?.initData ?? '';
            setUser(await loginWithTelegram(initData));
          } else {
            setUser(await loginWithVk());
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Не удалось войти');
        }
      })();
      return;
    }

    // 2) Real API: restore session via /me if token exists
    if (!USE_MOCKS) {
      if (!getAuthToken()) {
        useUserStore.setState({ status: 'unauthenticated' });
        return;
      }
      (async () => {
        setLoading();
        try {
          setUser(await getMe());
          await syncLocalCartToServer();
        } catch {
          // Token invalid — client interceptor already cleared it
          useUserStore.setState({ status: 'unauthenticated', user: null });
        }
      })();
      return;
    }

    // 3) Mock web — stay anonymous until user explicitly logs in
    if (!user) useUserStore.setState({ status: 'unauthenticated' });
  }, [isReady, environment, user, setLoading, setUser, setError]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading();
      try {
        const u = await loginWithEmail(email, password);
        setUser(u);
        if (!USE_MOCKS) await syncLocalCartToServer();
        return u;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неверный логин или пароль');
        throw err;
      }
    },
    [setLoading, setUser, setError],
  );

  const registerFn = useCallback(
    async (input: RegisterInput) => {
      setLoading();
      try {
        const u = await register(input);
        setUser(u);
        if (!USE_MOCKS) await syncLocalCartToServer();
        return u;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось зарегистрироваться');
        throw err;
      }
    },
    [setLoading, setUser, setError],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clear();
      // Drop cached server cart — the next mount will be in guest mode.
      queryClient.removeQueries({ queryKey: queryKeys.cart });
    }
  }, [clear]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, error, login, register: registerFn, logout }),
    [user, status, error, login, registerFn, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
