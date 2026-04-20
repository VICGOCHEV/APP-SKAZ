import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
};

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { label, className, id, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex cursor-pointer items-center gap-3 text-[14px] text-ink-900',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="relative inline-block h-6 w-11 shrink-0">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer sr-only"
          disabled={disabled}
          {...rest}
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-ink-200 transition-colors duration-200 peer-checked:bg-forest peer-focus-visible:ring-2 peer-focus-visible:ring-wine/30"
        />
        <span
          aria-hidden
          className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgba(28,21,16,0.2)] transition-transform duration-200 peer-checked:translate-x-5"
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
});

export default Toggle;
