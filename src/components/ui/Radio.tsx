import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: ReactNode;
};

const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
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
          type="radio"
          className="peer absolute inset-0 h-full w-full cursor-[inherit] appearance-none rounded-full border border-ink-300 bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-wine/30 checked:border-wine"
          disabled={disabled}
          {...rest}
        />
        <span className="pointer-events-none relative block h-2.5 w-2.5 scale-0 rounded-full bg-wine transition-transform duration-150 peer-checked:scale-100" />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
});

export default Radio;
