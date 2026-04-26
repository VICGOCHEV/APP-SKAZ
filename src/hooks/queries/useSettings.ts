import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { asArray, asString, getSettings } from '@/api/settings';
import type { ApiSetting, ApiSettingKey } from '@/api/schema';
import { queryKeys } from './queryKeys';

export function useSettings() {
  return useQuery<ApiSetting[]>({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    staleTime: 10 * 60 * 1000, // settings rarely change
  });
}

/**
 * Convenience hook returning typed accessors for the well-known keys
 * we use across the app. Returns nullish values until /settings resolves.
 */
export function useRestaurantInfo() {
  const { data } = useSettings();
  return useMemo(() => {
    const byKey = (k: ApiSettingKey) => data?.find((s) => s.key === k);
    return {
      phone: asString(byKey('PHONE')),
      email: asString(byKey('EMAIL')),
      emailForms: asString(byKey('EMAIL_FORMS')),
      address: asString(byKey('ADDRESS')),
      workingHours: asArray(byKey('WORKING_HOURS')),
      policyDocs: asString(byKey('POLICY_DOCS')),
      offerDocs: asString(byKey('OFFER_DOCS')),
    };
  }, [data]);
}
