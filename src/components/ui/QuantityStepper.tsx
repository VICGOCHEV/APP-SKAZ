import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

export type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
};

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
  ariaLabel = 'Количество',
}: QuantityStepperProps) {
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  const dimensions =
    size === 'sm' ? 'h-8 w-[92px] text-[13px]' : 'h-10 w-[108px] text-[15px]';
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';

  return (
    <div
      className={cn(
        'inline-flex items-center justify-between overflow-hidden rounded-full',
        'border border-ink-200 bg-white',
        dimensions,
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label="Уменьшить"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={decDisabled}
        className={cn(
          'flex items-center justify-center text-ink-700 disabled:opacity-30',
          'transition-colors hover:bg-cream-soft active:bg-cream-deep',
          btnSize,
        )}
      >
        <Minus size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />
      </button>
      <span className="font-mono font-semibold text-ink-900 tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Увеличить"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={incDisabled}
        className={cn(
          'flex items-center justify-center text-ink-700 disabled:opacity-30',
          'transition-colors hover:bg-cream-soft active:bg-cream-deep',
          btnSize,
        )}
      >
        <Plus size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />
      </button>
    </div>
  );
}
