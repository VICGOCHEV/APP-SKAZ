import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from './Button';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Disable the confirm button (e.g. while a precondition isn't met). */
  confirmDisabled?: boolean;
  /** Show a spinner / disable while parent is processing. */
  loading?: boolean;
  /** Visual emphasis for the confirm action. */
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional extra content below description (e.g. a checkbox). */
  children?: ReactNode;
};

/**
 * Lightweight modal dialog used for destructive or expensive confirms
 * (placing a real order, deleting saved data). Locks scroll while open
 * and closes on Esc.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'подтвердить',
  cancelLabel = 'отмена',
  confirmDisabled,
  loading,
  tone = 'default',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink-900/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCancel}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-4 top-1/2 z-[61] mx-auto max-w-[420px] -translate-y-1/2 overflow-hidden rounded-xl bg-paper p-5 shadow-[0_24px_60px_-12px_rgba(28,21,16,0.45)]"
            initial={{ opacity: 0, scale: 0.92, y: '-46%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.92, y: '-46%' }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          >
            <h2 className="font-serif text-[22px] leading-tight text-ink-900">
              {title}
            </h2>
            {description && (
              <div className="mt-2 text-[14px] leading-relaxed text-ink-700">
                {description}
              </div>
            )}
            {children && <div className="mt-4">{children}</div>}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant={tone === 'danger' ? 'secondary' : 'green'}
                onClick={onConfirm}
                disabled={confirmDisabled || loading}
              >
                {loading ? '…' : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
