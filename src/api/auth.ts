import { apiClient, getAuthToken, mockDelay, setAuthToken, USE_MOCKS } from './client';
import { apiUserToUser } from './adapters';
import type { ApiLoginResponse, ApiUser } from './schema';
import type { User } from '@/types';

const MOCK_CODE = '1234';

export type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

function mockUser(partial: Partial<User> & Pick<User, 'id'>): User {
  return {
    name: 'Гость',
    bonusPoints: 340,
    ...partial,
  };
}

/** Normalize "+7 900 555-14-23" → "79005551423" for backend-friendly format. */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^8/, '7');
  return digits.slice(0, 11);
}

/* ================================
 * Email + password (backend API)
 * ================================ */

export async function loginWithEmail(email: string, password: string): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 500);
    if (!email.includes('@')) throw new Error('Введите email');
    if (password.length < 8) throw new Error('Неверный логин или пароль');
    setAuthToken('mock-token');
    return mockUser({
      id: `user-${email}`,
      name: email.split('@')[0],
      email,
      phone: '+7 900 555-14-23',
    });
  }
  const { data } = await apiClient.post<ApiLoginResponse>('/login', { email, password });
  setAuthToken(data.access_token);
  return getMe();
}

export async function register(input: RegisterInput): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 500);
    if (input.password !== input.password_confirmation) {
      throw new Error('Пароли не совпадают');
    }
    setAuthToken('mock-token');
    return mockUser({
      id: `user-${input.email}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      bonusPoints: 0,
    });
  }
  await apiClient.post('/register', {
    ...input,
    phone: normalizePhone(input.phone),
  });
  // API /register returns UserData but no token — login right after
  return loginWithEmail(input.email, input.password);
}

export async function getMe(): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 200);
    return mockUser({
      id: 'mock-user',
      name: 'Гость',
      email: 'guest@example.com',
      phone: '+7 900 555-14-23',
    });
  }
  const { data } = await apiClient.get<ApiUser>('/me');
  return apiUserToUser(data);
}

export async function logout(): Promise<void> {
  try {
    if (!USE_MOCKS && getAuthToken()) {
      await apiClient.post('/logout');
    } else if (USE_MOCKS) {
      await mockDelay(undefined, 200);
    }
  } finally {
    setAuthToken(null);
  }
}

/* ================================
 * TG / VK auto-login (mock-only for now — API doesn't have these endpoints)
 * ================================ */

export async function loginWithTelegram(initData: string): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 400);
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    setAuthToken('mock-tg-token');
    return mockUser({
      id: tgUser?.id ? `tg-${tgUser.id}` : 'tg-mock',
      name: tgUser?.first_name ?? 'Telegram-гость',
      avatarUrl: tgUser?.photo_url,
    });
  }
  throw new Error(`Telegram auto-login пока не реализован на бэке: ${initData.slice(0, 8)}…`);
}

export async function loginWithVk(): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 400);
    setAuthToken('mock-vk-token');
    return mockUser({ id: 'vk-mock', name: 'VK-гость' });
  }
  throw new Error('VK auto-login пока не реализован на бэке');
}

/* ================================
 * Legacy SMS flow (kept as mock-only stub for dev; not in API)
 * ================================ */

export async function requestSmsCode(_phone: string): Promise<void> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 400);
    return;
  }
  throw new Error('SMS-авторизация не поддерживается. Используйте email.');
}

export async function verifySmsCode(phone: string, code: string): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 600);
    if (code !== MOCK_CODE) throw new Error('Неверный код');
    setAuthToken('mock-sms-token');
    return mockUser({ id: `user-${phone.replace(/\D/g, '')}`, phone });
  }
  throw new Error('SMS-авторизация не поддерживается. Используйте email.');
}
