import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type TabBarItem = {
  key: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

export type TabBarProps = {
  items: TabBarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
};

export default function TabBar({ items, activeKey, onSelect, className }: TabBarProps) {
  return (
    <nav
      className={cn(
        'grid rounded-lg border border-cream-deep bg-white p-2',
        'shadow-[0_-6px_16px_-10px_rgba(28,21,16,0.15)]',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
      aria-label="Основная навигация"
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 rounded-md py-2.5',
              'transition-colors duration-150',
              active ? 'bg-cream text-wine' : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {active && (
              <span
                aria-hidden
                className="absolute top-0.5 h-1 w-1 rounded-full bg-wine"
              />
            )}
            <span className="flex h-[22px] w-[22px] items-center justify-center">
              {item.icon}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.06em]">
              {item.label}
            </span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1.5 right-[20%] rounded-full bg-crimson px-1.5 text-[9px] font-bold text-cream">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
