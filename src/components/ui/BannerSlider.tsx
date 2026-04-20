import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import type { Banner } from '@/types';

export type BannerSliderProps = {
  banners: Banner[];
  onSelect?: (banner: Banner) => void;
  autoplayMs?: number;
  className?: string;
};

const toneClasses: Record<Banner['tone'], string> = {
  red: 'bg-gradient-to-br from-wine to-burgundy text-cream',
  green: 'bg-gradient-to-br from-forest to-pine text-cream',
  ink: 'bg-gradient-to-br from-indigo to-midnight text-cream',
};

const ctaTone: Record<Banner['tone'], string> = {
  red: 'bg-sand text-midnight',
  green: 'bg-cream text-pine',
  ink: 'bg-sand text-midnight',
};

export default function BannerSlider({
  banners,
  onSelect,
  autoplayMs = 5000,
  className,
}: BannerSliderProps) {
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const autoplayScrollRef = useRef(false);
  const autoplayResetRef = useRef<number | null>(null);

  // Autoplay tick
  useEffect(() => {
    if (banners.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [banners.length, autoplayMs]);

  // Scroll to active index. While the programmatic scroll is in flight,
  // ignore onScroll events so they don't fight the autoplay.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    autoplayScrollRef.current = true;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
    if (autoplayResetRef.current !== null) {
      window.clearTimeout(autoplayResetRef.current);
    }
    autoplayResetRef.current = window.setTimeout(() => {
      autoplayScrollRef.current = false;
    }, 700);
    return () => {
      if (autoplayResetRef.current !== null) {
        window.clearTimeout(autoplayResetRef.current);
      }
    };
  }, [index]);

  const onScroll = () => {
    if (autoplayScrollRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pt-[34px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {banners.map((banner) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => onSelect?.(banner)}
            className={cn(
              'relative h-[180px] w-full flex-none snap-start overflow-visible rounded-lg p-5 text-left',
              toneClasses[banner.tone],
            )}
          >
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="font-mono text-[10px] tracking-[0.22em] text-sand uppercase">
                  {banner.kicker}
                </div>
                <h3 className="mt-2 max-w-[60%] font-serif text-[26px] leading-none whitespace-pre-line">
                  {banner.title}
                </h3>
              </div>
              <span
                className={cn(
                  'self-start rounded-full px-4 py-2 text-[13px] font-semibold',
                  ctaTone[banner.tone],
                )}
              >
                {banner.cta}
              </span>
            </div>
            {banner.imageUrl && (
              <img
                src={banner.imageUrl}
                alt=""
                className="pointer-events-none absolute -top-[32px] right-[-12px] z-20 h-[212px] w-[212px] object-contain"
                style={{
                  animation: 'sheet-dish-spin 60s linear infinite',
                  filter:
                    'drop-shadow(0 22px 28px rgba(0,0,0,0.45)) drop-shadow(0 8px 12px rgba(0,0,0,0.28))',
                }}
              />
            )}
          </button>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="pointer-events-none absolute right-4 bottom-3 z-30 flex gap-1.5">
          {banners.map((_, i) => (
            <span
              key={i}
              className={cn(
                'block h-1 rounded-full transition-all duration-200',
                i === index ? 'w-5 bg-sand' : 'w-3 bg-white/35',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
