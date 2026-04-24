import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

export type ChipVariant = 'solid' | 'outline';

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  variant?: ChipVariant;
  children: ReactNode;
};

const variantClasses: Record<ChipVariant, { active: string; inactive: string }> = {
  solid: {
    active: 'bg-ink-900 text-cream',
    inactive: 'bg-ink-50 text-ink-800 hover:bg-ink-100',
  },
  outline: {
    active: 'bg-wine text-cream border border-wine',
    inactive: 'bg-transparent text-wine border border-wine/60 hover:border-wine hover:bg-wine/5',
  },
};

const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { active, variant = 'solid', className, children, disabled, ...rest },
  ref,
) {
  const v = variantClasses[variant];
  return (
    <motion.button
      ref={ref}
      type="button"
      aria-pressed={active}
      whileTap={disabled ? undefined : { scale: 0.94 }}
      transition={{ type: 'spring', damping: 20, stiffness: 500 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-medium',
        'transition-colors duration-150',
        active ? v.active : v.inactive,
        className,
      )}
      disabled={disabled}
      {...(rest as HTMLMotionProps<'button'>)}
    >
      {children}
    </motion.button>
  );
});

export default Chip;
