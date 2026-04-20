import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone =
  | 'wine'
  | 'forest'
  | 'mint'
  | 'sand'
  | 'indigo'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'neutral';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

const toneClasses: Record<BadgeTone, string> = {
  wine: 'bg-wine text-cream',
  forest: 'bg-forest text-cream',
  mint: 'bg-mint text-pine',
  sand: 'bg-sand text-midnight',
  indigo: 'bg-indigo text-cream',
  danger: 'bg-danger text-cream',
  success: 'bg-success text-cream',
  warning: 'bg-warning text-cream',
  info: 'bg-info text-cream',
  neutral: 'bg-ink-100 text-ink-800',
};

export default function Badge({ tone = 'wine', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
