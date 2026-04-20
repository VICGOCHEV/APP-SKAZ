import { cn } from '@/lib/cn';
import type { Category } from '@/types';

export type CategoryScrollerProps = {
  categories: Category[];
  activeId?: string;
  onSelect?: (category: Category) => void;
  className?: string;
};

export default function CategoryScroller({
  categories,
  activeId,
  onSelect,
  className,
}: CategoryScrollerProps) {
  return (
    <div
      className={cn(
        'flex gap-3 overflow-x-auto px-4 py-2',
        '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
        className,
      )}
    >
      {categories.map((category) => {
        const active = category.id === activeId;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect?.(category)}
            className="flex w-[72px] flex-none flex-col items-center gap-1.5"
          >
            <span
              className={cn(
                'flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full',
                'border-2',
                active ? 'border-wine bg-cream' : 'border-transparent bg-cream-soft',
              )}
            >
              {category.photoUrl ? (
                <img
                  src={category.photoUrl}
                  alt=""
                  className="h-[120%] w-[120%] object-contain"
                />
              ) : (
                <span className="font-serif text-[18px] text-wine">
                  {category.name.slice(0, 1)}
                </span>
              )}
            </span>
            <span
              className={cn(
                'w-full truncate text-center text-[11px] leading-tight',
                active ? 'font-semibold text-wine' : 'text-ink-700',
              )}
            >
              {category.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
