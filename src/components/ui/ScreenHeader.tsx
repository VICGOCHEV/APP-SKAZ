import { type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ScreenHeaderVariant = 'default' | 'back' | 'large';

export type ScreenHeaderProps = {
  variant?: ScreenHeaderVariant;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
  className?: string;
};

export default function ScreenHeader({
  variant = 'default',
  title,
  subtitle,
  onBack,
  rightSlot,
  className,
}: ScreenHeaderProps) {
  if (variant === 'large') {
    return (
      <header
        className={cn('flex flex-col gap-2 px-4 pt-6 pb-3', className)}
        aria-label={title}
      >
        {subtitle && (
          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-wine">
            {subtitle}
          </span>
        )}
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-serif text-[32px] leading-[1.05] text-ink-900">{title}</h1>
          {rightSlot && <div className="pt-1">{rightSlot}</div>}
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        'flex items-center gap-3 px-4 py-3.5',
        'border-b border-ink-100 bg-cream-soft',
        className,
      )}
    >
      {variant === 'back' && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-ink-800 hover:bg-cream"
        >
          <ChevronLeft size={22} strokeWidth={1.6} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-serif text-[20px] leading-tight text-ink-900">
          {title}
        </h1>
        {subtitle && (
          <p className="truncate text-[12px] text-ink-500">{subtitle}</p>
        )}
      </div>
      {rightSlot && <div>{rightSlot}</div>}
    </header>
  );
}
