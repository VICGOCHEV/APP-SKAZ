import { type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import BottomTabBar from './BottomTabBar';
import { isFullscreenPath } from '@/lib/navigation';

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const hideTabBar = isFullscreenPath(location.pathname);

  return (
    <div className="relative mx-auto min-h-[100dvh] w-full max-w-[480px] bg-paper">
      <main className="bg-paper pb-[96px]">{children}</main>
      {!hideTabBar && (
        <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-ink-100 bg-paper/95 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <BottomTabBar />
        </div>
      )}
    </div>
  );
}
