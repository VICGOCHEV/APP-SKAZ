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
    <button
      type="button"
      onClick={onClick}
      className={cn('flex w-[72px] flex-none flex-col items-center gap-1.5', className)}
    >
      <span
        className={cn(
          'flex h-[72px] w-[72px] items-center justify-center rounded-full p-[2px]',
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
              className="h-[130%] w-[130%] translate-y-1 object-contain"
            />
          ) : null}
        </span>
      </span>
      <span className="max-w-[72px] truncate text-[10px] leading-tight text-ink-700">
        {label}
      </span>
    </button>
  );
}
