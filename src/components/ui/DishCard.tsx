import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/formatPrice';
import { formatWeight } from '@/lib/formatWeight';
import Button from './Button';

export type DishCardVariant = 'hero' | 'grid' | 'list';

export type DishCardProps = {
  variant?: DishCardVariant;
  name: string;
  price: number;
  weight?: number;
  photoUrl?: string | null;
  meta?: string;
  tag?: { label: string; tone?: 'wine' | 'forest' };
  favorited?: boolean;
  unavailable?: boolean;
  onToggleFavorite?: () => void;
  onAdd?: () => void;
  onClick?: () => void;
  className?: string;
};

function FadeImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 0.8, 0.3, 1] }}
      className={className}
    />
  );
}

function PhotoFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-cream-soft text-ink-300',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-8 w-8"
      >
        <path
          d="M6 3v7a2 2 0 0 0 4 0V3M8 3v18M18 3c-2 2-2 6-2 8 0 1 1 2 2 2h0v10"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export default function DishCard({
  variant = 'grid',
  name,
  price,
  weight,
  photoUrl,
  meta,
  tag,
  favorited,
  unavailable,
  onToggleFavorite,
  onAdd,
  onClick,
  className,
}: DishCardProps) {
  if (variant === 'list') {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={unavailable}
        className={cn(
          'group grid w-full grid-cols-[72px_1fr_auto] items-center gap-3 py-2 pr-2.5 text-left',
          unavailable && 'opacity-50',
          className,
        )}
      >
        <div className="flex h-[72px] w-[72px] items-center justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="h-[120%] w-[120%] object-contain drop-shadow-[0_8px_10px_rgba(90,16,20,0.24)]"
            />
          ) : (
            <PhotoFallback className="h-full w-full" />
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-serif text-[16px] text-ink-900">{name}</div>
          {(weight || meta) && (
            <div className="mt-0.5 truncate text-[12px] text-ink-500">
              {weight ? formatWeight(weight) : null}
              {weight && meta ? ' · ' : null}
              {meta}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="font-serif text-[18px] text-wine">{formatPrice(price)}</div>
        </div>
      </button>
    );
  }

  const isHero = variant === 'hero';
  const imageClass = cn(
    'h-full w-full object-contain',
    'drop-shadow-[0_18px_22px_rgba(90,16,20,0.22)]',
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !unavailable && onClick?.()}
      onKeyDown={(e) => {
        if (!unavailable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'group relative flex h-full flex-col px-1 pb-2',
        onClick && !unavailable && 'cursor-pointer',
        unavailable && 'opacity-50',
        className,
      )}
    >
      <div
        className={cn(
          'relative grid place-items-center overflow-visible',
          isHero ? 'aspect-[4/3]' : 'aspect-square',
        )}
      >
        {tag && (
          <span
            className={cn(
              'absolute top-2 left-2 z-10 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] text-cream uppercase',
              tag.tone === 'forest' ? 'bg-forest' : 'bg-wine',
            )}
          >
            {tag.label}
          </span>
        )}
        <motion.button
          type="button"
          aria-label={favorited ? 'Убрать из избранного' : 'В избранное'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          whileTap={{ scale: 0.85 }}
          animate={favorited ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 0.8, 0.3, 1] }}
          className="absolute top-2 right-2 z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full border border-cream-deep bg-white/85 backdrop-blur-[6px]"
        >
          <Heart
            size={16}
            strokeWidth={1.8}
            className={cn('text-wine', favorited && 'fill-wine')}
          />
        </motion.button>
        {photoUrl ? (
          <FadeImage
            src={photoUrl}
            alt={name}
            className={cn(
              imageClass,
              'z-0',
              isHero ? 'h-[115%] w-[115%]' : 'h-[118%] w-[118%]',
              'transition-transform duration-500 ease-[cubic-bezier(0.22,0.8,0.3,1)]',
              'group-hover:scale-110 group-hover:-rotate-3',
            )}
          />
        ) : (
          <PhotoFallback className={isHero ? 'h-[115%] w-[115%]' : 'h-[118%] w-[118%]'} />
        )}
      </div>

      {/* Title — bottom-aligned inside a reserved 2-line zone so cards align */}
      <div
        className={cn(
          'mt-1.5 flex',
          isHero ? 'min-h-[50px]' : 'min-h-[42px]',
        )}
      >
        <h3
          className={cn(
            'm-0 line-clamp-2 self-end font-serif text-ink-900',
            isHero ? 'text-[22px] leading-[1.15]' : 'text-[17px] leading-[1.2]',
          )}
        >
          {name}
        </h3>
      </div>
      {/* Meta — sits immediately below title */}
      {(weight || meta) && (
        <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-500">
          {weight && <span>{formatWeight(weight)}</span>}
          {weight && meta && <span className="h-[3px] w-[3px] rounded-full bg-ink-300" />}
          {meta && <span>{meta}</span>}
        </div>
      )}
      {/* Footer pushed to the bottom */}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="font-serif text-[22px] text-ink-900">{formatPrice(price)}</span>
        {isHero ? (
          <Button
            variant="green"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAdd?.();
            }}
            disabled={unavailable}
          >
            в корзину
          </Button>
        ) : (
          <button
            type="button"
            aria-label="Добавить в корзину"
            onClick={(e) => {
              e.stopPropagation();
              onAdd?.();
            }}
            disabled={unavailable}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full bg-wine text-cream',
              'shadow-[0_6px_14px_-6px_rgba(90,16,20,0.6)]',
              'transition-colors hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            <Plus size={14} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </div>
  );
}
