import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, hint, error, className, id, rows = 3, ...rest },
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
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-describedby={describedById}
        aria-invalid={error ? true : undefined}
        className={cn(
          'w-full resize-y rounded-md border bg-white px-4 py-3 text-[15px] text-ink-900 outline-none',
          'border-ink-200 placeholder:text-ink-400',
          'focus:border-wine focus:ring-2 focus:ring-wine/20',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...rest}
      />
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

export default TextArea;
