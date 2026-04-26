/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_MOCKS?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_API_MEDIA_URL?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_YM_COUNTER_ID?: string;
  readonly VITE_RELEASE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: {
    user?: TelegramWebAppUser;
    hash?: string;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
}

interface VkBridge {
  send<T = unknown>(method: string, params?: Record<string, unknown>): Promise<T>;
  supports(method: string): boolean;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
    vkBridge?: VkBridge;
  }
}

export {};
