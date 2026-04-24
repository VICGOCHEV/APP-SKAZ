import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'green'
  | 'mint'
  | 'green-outline'
  | 'ghost'
  | 'dark'
  | 'gold';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type BaseProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export type ButtonProps = BaseProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-wine text-cream shadow-[0_8px_18px_-10px_rgba(90,16,20,0.6)] hover:bg-burgundy',
  secondary: 'bg-cream text-ink-900 border border-ink-200 hover:bg-cream-deep',
  green:
    'bg-forest text-cream shadow-[0_8px_18px_-10px_rgba(14,46,26,0.6)] hover:bg-pine',
  mint: 'bg-mint text-pine shadow-[0_8px_18px_-10px_rgba(92,138,90,0.5)] hover:bg-[#4A7548]',
  'green-outline':
    'bg-transparent text-forest border-[1.5px] border-forest hover:bg-forest hover:text-cream',
  ghost: 'bg-transparent text-wine hover:bg-cream/50',
  dark: 'bg-midnight text-cream hover:brightness-110',
  gold: 'bg-sand text-midnight hover:bg-sand-deep hover:text-cream',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2.5 text-[13px]',
  md: 'px-[22px] py-[14px] text-[15px]',
  lg: 'px-7 py-[18px] text-[17px]',
  icon: 'h-11 w-11 p-0',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    fullWidth,
    leftIcon,
    rightIcon,
    className,
    disabled,
    children,
    ...rest
  },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', damping: 20, stiffness: 500 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[0.01em] whitespace-nowrap',
        'transition-[background-color,box-shadow,color] duration-150',
        'disabled:cursor-not-allowed disabled:opacity-40',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled}
      {...(rest as HTMLMotionProps<'button'>)}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </motion.button>
  );
});

export default Button;
