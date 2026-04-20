import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-cream-deep bg-cream/60 px-6 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-wine">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-[22px] leading-tight text-ink-900">{title}</h3>
      {description && (
        <p className="max-w-sm text-[13px] leading-relaxed text-ink-500">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
