import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { cn } from '@/lib/cn';
import { formatWeight } from '@/lib/formatWeight';

export type WeightSliderProps = {
  value: number;
  onChange: (grams: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  ariaLabel?: string;
};

export default function WeightSlider({
  value,
  onChange,
  min = 50,
  max = 800,
  step = 10,
  className,
  ariaLabel = 'Вес порции',
}: WeightSliderProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const clampedValue = Math.max(min, Math.min(max, value));
  const pct = ((clampedValue - min) / (max - min)) * 100;

  const setFromClientX = useCallback(
    (clientX: number) => {
      const rail = railRef.current;
      if (!rail) return;
      const rect = rail.getBoundingClientRect();
      const raw = ((clientX - rect.left) / rect.width) * (max - min) + min;
      const snapped = Math.round(raw / step) * step;
      onChange(Math.max(min, Math.min(max, snapped)));
    },
    [max, min, step, onChange],
  );

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setDragging(true);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setFromClientX(e.clientX);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!railRef.current?.contains(document.activeElement)) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        onChange(Math.max(min, clampedValue - step));
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        onChange(Math.min(max, clampedValue + step));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [clampedValue, max, min, onChange, step]);

  return (
    <div
      className={cn(
        'relative h-11 touch-none px-3.5 pt-8 select-none',
        dragging && 'cursor-grabbing',
        !dragging && 'cursor-pointer',
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={railRef}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        aria-valuetext={formatWeight(clampedValue)}
        className="absolute inset-x-3.5 top-1/2 h-1.5 -translate-y-1/2 overflow-visible rounded-full bg-cream-deep focus:outline-none"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-wine to-crimson"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className={cn(
          'pointer-events-none absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white',
          'border-2 border-wine shadow-[0_6px_14px_-4px_rgba(90,16,20,0.45),0_2px_4px_rgba(28,21,16,0.15)]',
          'transition-transform duration-100',
          dragging && 'scale-110',
        )}
        style={{ left: `calc(${pct}% + (${14 - pct * 0.28}px))` }}
      >
        <span className="absolute inset-[5px] rounded-full bg-wine" />
        <span
          className={cn(
            'absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full',
            'rounded-lg px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap',
            'shadow-[0_4px_10px_-4px_rgba(28,21,16,0.35)]',
            dragging ? 'bg-wine text-cream' : 'bg-ink-900 text-cream',
          )}
        >
          {formatWeight(clampedValue)}
          <span
            aria-hidden
            className={cn(
              'absolute left-1/2 -bottom-1 h-2 w-2 -translate-x-1/2 rotate-45',
              dragging ? 'bg-wine' : 'bg-ink-900',
            )}
          />
        </span>
      </div>
    </div>
  );
}
