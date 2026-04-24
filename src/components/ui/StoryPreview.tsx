import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type StoryPreviewProps = {
  imageUrl?: string | null;
  label: string;
  seen?: boolean;
  flatLabel?: string;
  accent?: 'wine' | 'forest' | 'midnight' | 'sand';
  onClick?: () => void;
  className?: string;
};

const accentBg: Record<NonNullable<StoryPreviewProps['accent']>, string> = {
  wine: 'bg-wine',
  forest: 'bg-forest',
  midnight: 'bg-midnight',
  sand: 'bg-sand',
};

export default function StoryPreview({
  imageUrl,
  label,
  seen,
  flatLabel,
  accent = 'wine',
  onClick,
  className,
}: StoryPreviewProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', damping: 20, stiffness: 500 }}
      className={cn('flex w-[72px] flex-none flex-col items-center gap-1.5', className)}
    >
      <span className="relative">
        {/* Subtle pulsing glow for unread stories */}
        {!seen && (
          <motion.span
            aria-hidden
            className="absolute inset-[-3px] rounded-full bg-[conic-gradient(from_220deg,var(--crimson),var(--sand),var(--wine),var(--sand),var(--crimson))] blur-md"
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span
          className={cn(
            'relative flex h-[72px] w-[72px] items-center justify-center rounded-full p-[2px]',
            seen
              ? 'bg-ink-200'
              : 'bg-[conic-gradient(from_220deg,var(--crimson),var(--sand),var(--wine),var(--sand),var(--crimson))]',
          )}
        >
          <span
            className={cn(
              'flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-white',
              flatLabel ? accentBg[accent] : 'bg-cream',
            )}
          >
            {flatLabel ? (
              <span className="font-serif text-[18px] text-cream">{flatLabel}</span>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                className="h-[130%] w-[130%] translate-y-1 object-contain"
              />
            ) : null}
          </span>
        </span>
      </span>
      <span className="max-w-[72px] truncate text-[10px] leading-tight text-ink-700">
        {label}
      </span>
    </motion.button>
  );
}
