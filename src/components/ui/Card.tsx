import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
  tone?: 'paper' | 'cream' | 'white';
};

const toneClasses: Record<NonNullable<CardProps['tone']>, string> = {
  paper: 'bg-paper border-ink-200',
  cream: 'bg-cream border-cream-deep',
  white: 'bg-white border-ink-200',
};

export default function Card({
  children,
  className,
  padded = true,
  tone = 'paper',
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border shadow-card',
        toneClasses[tone],
        padded && 'p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
