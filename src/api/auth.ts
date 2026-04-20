import { mockDelay, USE_MOCKS } from './client';
import type { User } from '@/types';

const MOCK_CODE = '1234';

function buildMockUser(partial: Partial<User> & Pick<User, 'id' | 'phone'>): User {
  return {
    bonusPoints: 340,
    name: partial.name ?? 'Гость',
    ...partial,
  };
}

export async function requestSmsCode(_phone: string): Promise<void> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 400);
    return;
  }
  throw new Error('Real SMS endpoint not wired yet');
}

export async function verifySmsCode(phone: string, code: string): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 600);
    if (code !== MOCK_CODE) throw new Error('Неверный код');
    return buildMockUser({ id: `user-${phone.replace(/\D/g, '')}`, phone });
  }
  throw new Error('Real SMS endpoint not wired yet');
}

export async function loginWithTelegram(initData: string): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 400);
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    return buildMockUser({
      id: tgUser?.id ? `tg-${tgUser.id}` : 'tg-mock',
      phone: '+7•••••••••••',
      name: tgUser?.first_name ?? 'Telegram-гость',
      avatarUrl: tgUser?.photo_url,
    });
  }
  throw new Error(`Real Telegram login not wired yet: initData=${initData.slice(0, 8)}…`);
}

export async function loginWithVk(): Promise<User> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 400);
    return buildMockUser({ id: 'vk-mock', phone: '+7•••••••••••', name: 'VK-гость' });
  }
  throw new Error('Real VK login not wired yet');
}

export async function logout(): Promise<void> {
  if (USE_MOCKS) {
    await mockDelay(undefined, 200);
    return;
  }
  throw new Error('Real logout endpoint not wired yet');
}
