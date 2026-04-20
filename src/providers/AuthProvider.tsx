import { createContext, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  loginWithTelegram,
  loginWithVk,
  logout as apiLogout,
  requestSmsCode,
  verifySmsCode,
} from '@/api/auth';
import { useEnvironment } from '@/hooks/useEnvironment';
import { useUserStore } from '@/stores/user';
import type { AuthStatus, User } from '@/types';

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  error?: string;
  requestSms: (phone: string) => Promise<void>;
  verifySms: (phone: string, code: string) => Promise<User>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { environment, isReady } = useEnvironment();
  const { user, status, error, setLoading, setUser, setError, clear } = useUserStore();
  const autoLoginTried = useRef(false);

  useEffect(() => {
    if (!isReady) return;
    if (autoLoginTried.current) return;
    if (user) return;
    if (environment !== 'tg' && environment !== 'vk') return;

    autoLoginTried.current = true;
    (async () => {
      setLoading();
      try {
        if (environment === 'tg') {
          const initData = window.Telegram?.WebApp?.initData ?? '';
          const tgUser = await loginWithTelegram(initData);
          setUser(tgUser);
        } else if (environment === 'vk') {
          const vkUser = await loginWithVk();
          setUser(vkUser);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось войти');
      }
    })();
  }, [environment, isReady, user, setLoading, setUser, setError]);

  useEffect(() => {
    if (!user && status === 'idle') {
      useUserStore.setState({ status: 'unauthenticated' });
    }
    if (user && status !== 'authenticated') {
      useUserStore.setState({ status: 'authenticated' });
    }
  }, [user, status]);

  const requestSms = useCallback(async (phone: string) => {
    setLoading();
    try {
      await requestSmsCode(phone);
      useUserStore.setState({ status: 'unauthenticated', error: undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки кода');
      throw err;
    }
  }, [setLoading, setError]);

  const verifySms = useCallback(
    async (phone: string, code: string) => {
      setLoading();
      try {
        const nextUser = await verifySmsCode(phone, code);
        setUser(nextUser);
        return nextUser;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неверный код');
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
    () => ({ user, status, error, requestSms, verifySms, logout }),
    [user, status, error, requestSms, verifySms, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
