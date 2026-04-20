import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  allowOverflow?: boolean;
  /**
   * Content rendered inside the overlay but OUTSIDE the sheet's animated
   * container — useful for elements that should animate independently
   * (e.g. a floating dish photo that enters from above and exits upward
   * while the sheet body slides up/down from bottom).
   */
  aboveSheet?: ReactNode;
  /** px of negative margin-bottom applied to `aboveSheet` so it overlaps the sheet top */
  aboveSheetOverlap?: number;
};

export default function BottomSheet({
  open,
  onClose,
  children,
  className,
  ariaLabel,
  allowOverflow = false,
  aboveSheet,
  aboveSheetOverlap = 0,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            type="button"
            aria-label="Закрыть"
            className="absolute inset-0 bg-ink-900/35 backdrop-blur-[2px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {aboveSheet && (
            <div
              className="pointer-events-none relative z-20 flex justify-center"
              style={{ marginBottom: -aboveSheetOverlap }}
            >
              {aboveSheet}
            </div>
          )}
          <motion.div
            className={cn(
              'relative z-10 w-full max-w-[480px] rounded-t-[28px] border border-cream-deep bg-white',
              'shadow-[0_-18px_40px_-24px_rgba(28,21,16,0.25)]',
              allowOverflow ? 'overflow-visible' : 'overflow-hidden',
              className,
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 140 || info.velocity.y > 600) onClose();
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <span className="h-1 w-11 rounded-full bg-ink-200" />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
