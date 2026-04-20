import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Slide } from '@/types';

export type StoryViewerProps = {
  open: boolean;
  slides: Slide[];
  onClose: () => void;
  onCtaClick?: (slide: Slide) => void;
  durationMs?: number;
};

export default function StoryViewer({
  open,
  slides,
  onClose,
  onCtaClick,
  durationMs = 5000,
}: StoryViewerProps) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      setProgress(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const start = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(1, elapsed / durationMs);
      setProgress(pct);
      if (pct >= 1) {
        if (index < slides.length - 1) {
          setIndex(index + 1);
          setProgress(0);
        } else {
          onClose();
        }
      }
    }, 40);
    return () => window.clearInterval(timer);
  }, [open, index, durationMs, slides.length, onClose]);

  const go = (delta: number) => {
    const next = index + delta;
    if (next < 0) return;
    if (next >= slides.length) {
      onClose();
      return;
    }
    setIndex(next);
    setProgress(0);
  };

  const current = slides[index];

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-midnight"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120) onClose();
          }}
        >
          <div className="flex items-center gap-1.5 px-3 pt-3">
            {slides.map((_, i) => (
              <span
                key={i}
                className="h-0.5 flex-1 overflow-hidden rounded-full bg-cream/30"
              >
                <span
                  className="block h-full bg-cream transition-[width] duration-100"
                  style={{
                    width:
                      i < index
                        ? '100%'
                        : i === index
                          ? `${progress * 100}%`
                          : '0%',
                  }}
                />
              </span>
            ))}
          </div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-cream"
          >
            <X size={20} />
          </button>
          <div className="relative flex-1 overflow-hidden">
            <button
              type="button"
              aria-label="Назад"
              onClick={() => go(-1)}
              className="absolute inset-y-0 left-0 z-10 w-1/3"
            />
            <button
              type="button"
              aria-label="Вперёд"
              onClick={() => go(1)}
              className="absolute inset-y-0 right-0 z-10 w-1/3"
            />
            {current.type === 'image' ? (
              <img
                src={current.url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <video src={current.url} autoPlay muted className="h-full w-full object-cover" />
            )}
          </div>
          {current.cta && (
            <div className="px-4 pb-8 pt-4">
              <button
                type="button"
                onClick={() => onCtaClick?.(current)}
                className={cn(
                  'flex w-full items-center justify-center rounded-full bg-cream px-6 py-4',
                  'font-semibold text-midnight shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)]',
                )}
              >
                {current.cta.label}
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
