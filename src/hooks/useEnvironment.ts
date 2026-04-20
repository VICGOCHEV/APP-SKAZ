import { useContext } from 'react';
import { EnvironmentContext } from '@/providers/EnvironmentProvider';

export function useEnvironment() {
  const ctx = useContext(EnvironmentContext);
  if (!ctx) {
    throw new Error('useEnvironment must be used inside <EnvironmentProvider>');
  }
  return ctx;
}
