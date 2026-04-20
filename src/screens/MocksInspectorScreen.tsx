import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/formatPrice';
import { formatWeight } from '@/lib/formatWeight';
import { useBanners } from '@/hooks/queries/useBanners';
import { useCategories, useCuisines } from '@/hooks/queries/useCategories';
import { useDishes } from '@/hooks/queries/useDishes';
import { usePromos } from '@/hooks/queries/usePromos';
import { useStories } from '@/hooks/queries/useStories';

function Section({
  num,
  title,
  right,
  children,
}: {
  num: string;
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-4 border-b border-ink-200 pb-2">
        <span className="font-mono text-[11px] tracking-[0.18em] text-wine uppercase">{num}</span>
        <h2 className="flex-1 font-serif text-[24px] leading-none text-ink-900">{title}</h2>
        {right}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="rounded-full border border-ink-200 bg-paper px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-700 hover:bg-cream-deep"
        >
          {open ? 'свернуть' : 'развернуть'}
        </button>
      </div>
      {open && children}
    </section>
  );
}

function LoadingRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-midnight px-4 py-3 font-mono text-[12px] leading-relaxed text-cream">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function MocksInspectorScreen() {
  const dishes = useDishes();
  const categories = useCategories();
  const cuisines = useCuisines();
  const stories = useStories();
  const banners = useBanners();
  const promos = usePromos();

  return (
    <div className="min-h-[100dvh] w-full bg-[#EFE6D4] py-10">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-10 px-10">
        <header className="flex items-end justify-between gap-6 border-b border-ink-200 pb-6">
          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] text-wine uppercase">
              phase 3 / mocks
            </div>
            <h1 className="mt-2 font-serif text-[36px] leading-none text-ink-900">
              инспектор моков
            </h1>
            <p className="mt-2 text-[13px] text-ink-500">
              данные тянутся через TanStack Query. переключатель мок/реал —{' '}
              <code className="font-mono text-wine">VITE_USE_MOCKS</code>.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/__design">
              <Button variant="secondary" size="sm">витрина</Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">главная</Button>
            </Link>
          </div>
        </header>

        <Section
          num="01"
          title={`блюда · ${dishes.data?.length ?? 0}`}
          right={
            dishes.data && (
              <span className="font-mono text-[11px] text-ink-500 uppercase tracking-[0.12em]">
                {dishes.data.filter((d) => d.isWeighted).length} весовых ·{' '}
                {dishes.data.filter((d) => !d.isAvailable).length} в стоп-листе
              </span>
            )
          }
        >
          {dishes.isPending ? (
            <LoadingRows />
          ) : dishes.error ? (
            <Card tone="paper"><span className="text-danger">{String(dishes.error)}</span></Card>
          ) : (
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-x-5 gap-y-2 text-[13px]">
              <div className="contents font-mono text-[10px] tracking-[0.12em] text-ink-500 uppercase">
                <span>id</span>
                <span>название</span>
                <span>категория</span>
                <span>вес</span>
                <span>цена</span>
                <span>флаги</span>
              </div>
              {dishes.data?.map((d) => (
                <div key={d.id} className="contents border-t border-ink-100 py-1 text-ink-900">
                  <span className="font-mono text-ink-500 border-t border-ink-100 pt-2">{d.id}</span>
                  <span className="border-t border-ink-100 pt-2">{d.name}</span>
                  <span className="border-t border-ink-100 pt-2 text-ink-500 text-[12px]">{d.categoryId}</span>
                  <span className="border-t border-ink-100 pt-2 font-mono">{formatWeight(d.baseWeight)}</span>
                  <span className="border-t border-ink-100 pt-2 font-serif text-wine">
                    {formatPrice(d.price)}
                  </span>
                  <span className="border-t border-ink-100 pt-2 flex gap-1.5 flex-wrap">
                    {d.isWeighted && (
                      <span className="rounded-full bg-wine/10 px-1.5 py-0.5 text-[10px] font-semibold text-wine">
                        вес
                      </span>
                    )}
                    {!d.isAvailable && (
                      <span className="rounded-full bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                        stop
                      </span>
                    )}
                    {d.modifiers.length > 0 && (
                      <span className="rounded-full bg-forest/10 px-1.5 py-0.5 text-[10px] font-semibold text-forest">
                        +{d.modifiers.length}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section num="02" title={`категории · ${categories.data?.length ?? 0}`}>
          {categories.isPending ? <LoadingRows /> : <JsonBlock value={categories.data} />}
        </Section>

        <Section num="03" title={`кухни · ${cuisines.data?.length ?? 0}`}>
          {cuisines.isPending ? <LoadingRows /> : <JsonBlock value={cuisines.data} />}
        </Section>

        <Section num="04" title={`сторис · ${stories.data?.length ?? 0}`}>
          {stories.isPending ? <LoadingRows /> : <JsonBlock value={stories.data} />}
        </Section>

        <Section num="05" title={`баннеры · ${banners.data?.length ?? 0}`}>
          {banners.isPending ? <LoadingRows /> : <JsonBlock value={banners.data} />}
        </Section>

        <Section num="06" title={`акции · ${promos.data?.length ?? 0}`}>
          {promos.isPending ? <LoadingRows /> : <JsonBlock value={promos.data} />}
        </Section>
      </div>
    </div>
  );
}
