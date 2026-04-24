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
import { getAuthToken, USE_MOCKS } from '@/api/client';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useUserStore } from '@/stores/user';
import type { AuthStatus, User } from '@/types';

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
    }
  }, [clear]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, error, login, register: registerFn, logout }),
    [user, status, error, login, registerFn, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
