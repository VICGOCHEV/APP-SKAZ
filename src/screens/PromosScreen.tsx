import { cn } from '@/lib/cn';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Skeleton from '@/components/ui/Skeleton';
import { usePromos } from '@/hooks/queries/usePromos';
import type { Promo } from '@/types';

const toneClasses: Record<Promo['tone'], string> = {
  red: 'bg-gradient-to-br from-wine to-burgundy text-cream',
  green: 'bg-gradient-to-br from-forest to-pine text-cream',
  ink: 'bg-gradient-to-br from-indigo to-midnight text-cream',
  sand: 'bg-sand text-midnight',
};

export default function PromosScreen() {
  const { data, isPending } = usePromos();

  return (
    <div className="flex flex-col">
      <ScreenHeader variant="large" title="акции" subtitle="скидки · промокоды · подарки" />
      <div className="flex flex-col gap-3 p-4">
        {isPending
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[160px]" />)
          : data?.map((p) => (
              <article
                key={p.id}
                className={cn(
                  'relative flex flex-col gap-3 overflow-hidden rounded-lg p-5',
                  toneClasses[p.tone],
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-serif text-[22px] leading-tight">{p.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed opacity-90">
                      {p.description}
                    </p>
                  </div>
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-20 w-20 flex-none object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.25)]"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {p.code && (
                    <span className="rounded-full bg-white/20 px-3 py-1 font-mono text-[12px] font-semibold tracking-[0.08em] uppercase">
                      {p.code}
                    </span>
                  )}
                  {p.autoApplied && (
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.08em]">
                      применяется автоматически
                    </span>
                  )}
                </div>
              </article>
            ))}
      </div>
    </div>
  );
}
