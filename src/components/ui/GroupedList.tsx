import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export type GroupedListItem = {
  id: string;
  icon?: ReactNode;
  label: string;
  description?: string;
  trailing?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
};

export type GroupedListProps = {
  title?: string;
  items: GroupedListItem[];
  className?: string;
};

export default function GroupedList({ title, items, className }: GroupedListProps) {
  return (
    <section className={cn('flex flex-col gap-2', className)}>
      {title && (
        <h3 className="px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
          {title}
        </h3>
      )}
      <div className="overflow-hidden rounded-lg border border-ink-100 bg-white">
        {items.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-3.5 text-left',
              'transition-colors duration-150 hover:bg-cream-soft',
              idx > 0 && 'border-t border-ink-100',
              item.danger && 'text-danger',
            )}
          >
            {item.icon && (
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cream-soft text-ink-700',
                  item.danger && 'bg-danger/10 text-danger',
                )}
              >
                {item.icon}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block truncate text-[15px] font-medium',
                  item.danger ? 'text-danger' : 'text-ink-900',
                )}
              >
                {item.label}
              </span>
              {item.description && (
                <span className="mt-0.5 block truncate text-[12px] text-ink-500">
                  {item.description}
                </span>
              )}
            </span>
            {item.trailing ?? (
              <ChevronRight size={18} className="shrink-0 text-ink-300" strokeWidth={1.8} />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
