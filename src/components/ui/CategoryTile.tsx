import { cn } from '@/lib/cn';
import type { Tile } from '@/types';

export type CategoryTileProps = {
  tile: Tile;
  onClick?: (tile: Tile) => void;
  className?: string;
};

const toneClasses: Record<Tile['tone'], string> = {
  wine: 'bg-wine text-cream',
  red: 'bg-crimson text-cream',
  green: 'bg-forest text-cream',
  mint: 'bg-mint text-pine',
  ink: 'bg-midnight text-cream',
  sand: 'bg-sand text-midnight',
  cream: 'bg-cream-deep text-ink-900',
};

export default function CategoryTile({ tile, onClick, className }: CategoryTileProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(tile)}
      className={cn(
        'relative flex aspect-[16/10] w-full flex-col justify-between overflow-hidden rounded-lg p-3.5 text-left',
        'transition-transform duration-150 hover:-translate-y-0.5',
        toneClasses[tile.tone],
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute top-[-20px] right-[-20px] h-20 w-20 rounded-full border border-current opacity-[0.18]"
      />
      <span
        aria-hidden
        className="absolute top-6 right-3.5 h-10 w-10 rounded-full border border-current opacity-[0.18]"
      />
      <span className="relative text-[11px] uppercase tracking-[0.12em] opacity-80">
        {tile.kicker}
      </span>
      <div className="relative">
        {tile.count !== undefined && (
          <div className="font-serif text-[28px] leading-none">{tile.count}</div>
        )}
        <h4 className="line-clamp-2 font-serif text-[20px] leading-[1.15] whitespace-pre-line">
          {tile.title}
        </h4>
      </div>
    </button>
  );
}
