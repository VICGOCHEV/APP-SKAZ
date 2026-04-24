import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
          <motion.button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            aria-current={active ? 'page' : undefined}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', damping: 20, stiffness: 500 }}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 rounded-md py-2.5',
              'transition-colors duration-200',
              active ? 'text-wine' : 'text-ink-500 hover:text-ink-700',
            )}
          >
            {/* Sliding active background */}
            {active && (
              <motion.span
                layoutId="tabbar-active"
                aria-hidden
                className="absolute inset-0 rounded-md bg-cream"
                transition={{ type: 'spring', damping: 28, stiffness: 420 }}
              />
            )}
            {active && (
              <motion.span
                layoutId="tabbar-active-dot"
                aria-hidden
                className="absolute top-0.5 h-1 w-1 rounded-full bg-wine"
                transition={{ type: 'spring', damping: 28, stiffness: 420 }}
              />
            )}
            <motion.span
              className="relative flex h-[22px] w-[22px] items-center justify-center"
              animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 0.8, 0.3, 1] }}
            >
              {item.icon}
            </motion.span>
            <span className="relative text-[10px] font-medium uppercase tracking-[0.06em]">
              {item.label}
            </span>
            <AnimatePresence>
              {item.badge !== undefined && item.badge > 0 && (
                <motion.span
                  key={item.badge}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 500 }}
                  className="absolute top-1.5 right-[20%] rounded-full bg-crimson px-1.5 text-[9px] font-bold text-cream"
                >
                  {item.badge}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </nav>
  );
}
