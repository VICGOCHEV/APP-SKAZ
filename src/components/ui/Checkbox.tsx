import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, disabled, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2.5 text-[14px] text-ink-900',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <span className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className="peer absolute inset-0 h-full w-full cursor-[inherit] appearance-none rounded-xs border border-ink-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/30 checked:border-wine checked:bg-wine"
          disabled={disabled}
          {...rest}
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none relative h-3 w-3 text-cream opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
});

export default Checkbox;
