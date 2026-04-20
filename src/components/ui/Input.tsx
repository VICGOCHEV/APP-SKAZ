import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftAddon, rightAddon, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedById = hint || error ? `${inputId}-desc` : undefined;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-md border bg-white px-4 py-3',
          'border-ink-200 focus-within:border-wine focus-within:ring-2 focus-within:ring-wine/20',
          error && 'border-danger focus-within:border-danger focus-within:ring-danger/20',
          className,
        )}
      >
        {leftAddon && <span className="text-ink-400">{leftAddon}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={describedById}
          aria-invalid={error ? true : undefined}
          className={cn(
            'flex-1 bg-transparent text-[15px] text-ink-900 outline-none',
            'placeholder:text-ink-400',
          )}
          {...rest}
        />
        {rightAddon && <span className="text-ink-400">{rightAddon}</span>}
      </div>
      {(hint || error) && (
        <p
          id={describedById}
          className={cn('text-[12px]', error ? 'text-danger' : 'text-ink-500')}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
});

export default Input;
