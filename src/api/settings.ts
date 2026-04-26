import { apiClient, mockDelay, USE_MOCKS } from './client';
import type { ApiSetting, ApiSettingKey } from './schema';

/** Mock-mode placeholder values (used when no backend is available). */
const MOCK_SETTINGS: ApiSetting[] = [
  { key: 'PHONE', label: 'Контактный телефон ресторана', value: '+7 (342) 294-16-26', exists: true },
  { key: 'EMAIL', label: 'Электронная почта ресторана', value: 'skazka.vostoka59@mail.ru', exists: true },
  { key: 'ADDRESS', label: 'Адрес ресторана', value: 'город Пермь, улица Подлесная, 6, АБ', exists: true },
  {
    key: 'WORKING_HOURS',
    label: 'Часы работы ресторана',
    value: ['вс-чт: 12:00 – 00:00', 'пт-сб: 12:00 – 02:00'],
    exists: true,
  },
];

export async function getSettings(): Promise<ApiSetting[]> {
  if (USE_MOCKS) return mockDelay(MOCK_SETTINGS, 100);
  const { data } = await apiClient.get<ApiSetting[]>('/settings');
  return data ?? [];
}

export async function getSetting(key: ApiSettingKey): Promise<ApiSetting | null> {
  if (USE_MOCKS) {
    const found = MOCK_SETTINGS.find((s) => s.key === key);
    return mockDelay(found ?? null, 100);
  }
  const { data } = await apiClient.get<ApiSetting>(`/settings/${encodeURIComponent(key)}`);
  return data ?? null;
}

/** Pick value(s) from an ApiSetting, with type guards. */
export function asString(setting: ApiSetting | null | undefined): string | null {
  if (!setting?.value) return null;
  if (typeof setting.value === 'string') return setting.value;
  return setting.value[0] ?? null;
}

export function asArray(setting: ApiSetting | null | undefined): string[] {
  if (!setting?.value) return [];
  return Array.isArray(setting.value) ? setting.value : [setting.value];
}
