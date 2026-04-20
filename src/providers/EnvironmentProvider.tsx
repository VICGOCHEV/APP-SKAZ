import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Environment } from '@/types';

type EnvironmentContextValue = {
  environment: Environment;
  isReady: boolean;
};

export const EnvironmentContext = createContext<EnvironmentContextValue | undefined>(undefined);

const FORCE_ENV_KEY = 'skazka:env';
const TELEGRAM_SDK_SRC = 'https://telegram.org/js/telegram-web-app.js';
const VK_BRIDGE_SRC = 'https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js';

function detectInitial(): Environment {
  if (typeof window === 'undefined') return 'web';
  const forced = window.localStorage.getItem(FORCE_ENV_KEY) as Environment | null;
  if (forced === 'tg' || forced === 'vk' || forced === 'max' || forced === 'web') {
    return forced;
  }
  if (window.Telegram?.WebApp) return 'tg';
  if (window.vkBridge) return 'vk';
  const url = new URL(window.location.href);
  if (url.hash.includes('tgWebAppData') || url.searchParams.has('tgWebAppStartParam')) {
    return 'tg';
  }
  if (url.searchParams.has('vk_app_id') || url.searchParams.has('vk_user_id')) {
    return 'vk';
  }
  const ua = window.navigator.userAgent;
  if (/\bMAX\b/i.test(ua)) return 'max';
  return 'web';
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(el);
  });
}

async function hydrateSdks(environment: Environment): Promise<void> {
  if (environment === 'tg' && !window.Telegram?.WebApp) {
    try {
      await loadScript(TELEGRAM_SDK_SRC);
      window.Telegram?.WebApp?.ready?.();
      window.Telegram?.WebApp?.expand?.();
    } catch (err) {
      console.warn('[env] Telegram SDK load failed', err);
    }
  }
  if (environment === 'vk') {
    const globalWindow = window as Window;
    if (!globalWindow.vkBridge) {
      try {
        await loadScript(VK_BRIDGE_SRC);
      } catch (err) {
        console.warn('[env] VK Bridge load failed', err);
      }
    }
    try {
      await globalWindow.vkBridge?.send('VKWebAppInit');
    } catch (err) {
      console.warn('[env] VKWebAppInit failed', err);
    }
  }
}

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [environment] = useState<Environment>(detectInitial);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    hydrateSdks(environment).finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [environment]);

  const value = useMemo<EnvironmentContextValue>(
    () => ({ environment, isReady }),
    [environment, isReady],
  );

  return <EnvironmentContext.Provider value={value}>{children}</EnvironmentContext.Provider>;
}
