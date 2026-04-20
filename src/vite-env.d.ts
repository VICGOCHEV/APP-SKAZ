/// <reference types="vite/client" />

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
