import { AuthProvider } from '@/providers/AuthProvider';
import { EnvironmentProvider } from '@/providers/EnvironmentProvider';
import AppRouter from '@/router';

export default function App() {
  return (
    <EnvironmentProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </EnvironmentProvider>
  );
}
