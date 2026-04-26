import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, X } from 'lucide-react';
import BannerSlider from '@/components/ui/BannerSlider';
import CategoryScroller from '@/components/ui/CategoryScroller';
import CategoryTile from '@/components/ui/CategoryTile';
import DishCard from '@/components/ui/DishCard';
import Logo from '@/components/ui/Logo';
import Skeleton from '@/components/ui/Skeleton';
import StoryPreview from '@/components/ui/StoryPreview';
import { useAuth } from '@/hooks/useAuth';
import { useBanners } from '@/hooks/queries/useBanners';
import { useCategories } from '@/hooks/queries/useCategories';
import { useDishes } from '@/hooks/queries/useDishes';
import { useStories } from '@/hooks/queries/useStories';
import { useCart } from '@/hooks/useCart';
import { useOpenDish, useOpenStory } from '@/lib/navigation';
import type { Tile } from '@/types';

const HOME_TILES: Tile[] = [
  { id: 'orders', kicker: 'быстро', title: 'история\nзаказов', tone: 'wine', deeplink: '/profile/orders' },
  { id: 'menu', kicker: 'всё меню', title: 'меню\nкухни', tone: 'green', deeplink: '/menu' },
  { id: 'promos', kicker: 'сегодня', title: 'акции\nи промо', tone: 'sand', deeplink: '/promos' },
  { id: 'table', kicker: 'визит', title: 'заказ\nстола', tone: 'ink', deeplink: '/profile' },
];

const ease = [0.22, 0.8, 0.3, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease } },
};

function Section({
  children,
  className,
  inView = true,
}: {
  children: React.ReactNode;
  className?: string;
  inView?: boolean;
}) {
  return (
    <motion.section
      variants={fadeUp}
      {...(inView
        ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '0px 0px -8% 0px' } }
        : { initial: 'hidden', animate: 'show' })}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const openDish = useOpenDish();
  const openStory = useOpenStory();
  const { addDish } = useCart();
  const { user } = useAuth();

  const { data: stories, isPending: storiesLoading } = useStories();
  const { data: banners, isPending: bannersLoading } = useBanners();
  const { data: categories, isPending: catsLoading } = useCategories();
  const { data: dishes, isPending: dishesLoading } = useDishes();

  const [query, setQuery] = useState('');
  const isSearching = query.trim().length > 0;

  const popular = useMemo(
    () => (dishes ?? []).filter((d) => d.isAvailable).slice(0, 6),
    [dishes],
  );

  // Backend mostly doesn't return category images yet; fall back to the
  // first product photo in that category so the round chips never look empty.
  const categoriesWithImages = useMemo(() => {
    if (!categories) return [];
    if (!dishes?.length) return categories;
    return categories.map((c) => {
      if (c.photoUrl) return c;
      const fallback = dishes.find((d) => d.categoryId === c.id && d.photoUrl);
      return fallback ? { ...c, photoUrl: fallback.photoUrl } : c;
    });
  }, [categories, dishes]);

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = query.trim().toLowerCase();
    return (dishes ?? []).filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.composition.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    );
  }, [query, dishes, isSearching]);

  const displayed = isSearching ? searchResults : popular;

  return (
    <div className="flex flex-col bg-paper">
      {/* Masthead */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="flex items-center justify-between px-4 pt-6 pb-3"
      >
        <Logo className="h-9 w-auto text-sand-deep" />
        {user && (
          <motion.button
            type="button"
            onClick={() => navigate('/profile')}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-1.5 rounded-full bg-cream-soft px-3 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-wine uppercase"
          >
            <Sparkles size={13} />
            {user.bonusPoints} ₽
          </motion.button>
        )}
      </motion.header>

      {/* Search — real input with live filter */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease }}
        className="px-4 pt-2 pb-5"
      >
        <form
          className="relative"
          onSubmit={(e) => e.preventDefault()}
          role="search"
        >
          <Search
            size={18}
            strokeWidth={1.8}
            className="absolute top-1/2 left-4 -translate-y-1/2 text-ink-400"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="поиск блюда или состава"
            aria-label="поиск блюда"
            className="w-full rounded-full border border-cream-deep bg-cream-soft py-3.5 pr-12 pl-12 text-[14px] text-ink-900 transition-colors placeholder:text-ink-400 focus:border-wine focus:bg-white focus:outline-none"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                aria-label="очистить"
                onClick={() => setQuery('')}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              >
                <X size={18} strokeWidth={1.8} />
              </motion.button>
            )}
          </AnimatePresence>
        </form>
      </motion.section>

      {/* Home blocks — hidden when searching */}
      <AnimatePresence mode="wait" initial={false}>
        {!isSearching && (
          <motion.div
            key="home-blocks"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            className="flex flex-col"
          >
            {/* Stories */}
            <Section className="pb-0" inView={false}>
              {storiesLoading ? (
                <div className="flex gap-3 overflow-hidden px-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} rounded="full" className="h-[72px] w-[72px] flex-none" />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="flex gap-3 overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {stories?.map((s) => (
                    <motion.div key={s.id} variants={fadeScale} className="flex-none">
                      <StoryPreview
                        imageUrl={s.previewUrl}
                        label={s.label}
                        seen={s.seen}
                        flatLabel={s.flatLabel}
                        accent={s.accent}
                        onClick={() => openStory(s.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </Section>

            {/* Banner slider */}
            <Section className="px-4 pb-5">
              {bannersLoading ? (
                <Skeleton className="h-[180px] w-full" />
              ) : (
                <BannerSlider
                  banners={banners ?? []}
                  onSelect={(b) => navigate(b.deeplink)}
                />
              )}
            </Section>

            {/* Tiles */}
            <Section className="px-4 pb-7">
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                className="grid grid-cols-2 gap-2.5"
              >
                {HOME_TILES.map((t) => (
                  <motion.div key={t.id} variants={fadeUp}>
                    <CategoryTile tile={t} onClick={(tile) => navigate(tile.deeplink)} />
                  </motion.div>
                ))}
              </motion.div>
            </Section>

            {/* Category scroller */}
            <Section className="pb-7">
              <div className="mb-2 flex items-baseline justify-between px-4">
                <h2 className="font-serif text-[24px] leading-tight text-ink-900">
                  категории
                </h2>
                <button
                  type="button"
                  onClick={() => navigate('/menu')}
                  className="text-[12px] font-semibold text-wine transition-colors hover:text-burgundy"
                >
                  все →
                </button>
              </div>
              {catsLoading ? (
                <div className="flex gap-3 overflow-hidden px-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} rounded="full" className="h-[72px] w-[72px] flex-none" />
                  ))}
                </div>
              ) : (
                <CategoryScroller
                  categories={categoriesWithImages}
                  onSelect={(c) => navigate(`/menu/east/${c.id}`)}
                />
              )}
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results / Popular */}
      <section className="px-4 pt-2 pb-10">
        <AnimatePresence mode="wait">
          <motion.h2
            key={isSearching ? 'h-search' : 'h-popular'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease }}
            className="mb-5 font-serif text-[30px] leading-[1.02] text-ink-900"
          >
            {isSearching
              ? searchResults.length > 0
                ? `найдено · ${searchResults.length}`
                : 'ничего не нашлось'
              : 'часто заказывают'}
          </motion.h2>
        </AnimatePresence>

        {dishesLoading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-square" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <p className="rounded-lg border border-cream-deep bg-cream-soft px-4 py-6 text-center text-[13px] text-ink-500">
            {isSearching
              ? `по запросу «${query.trim()}» ничего не найдено. попробуйте другое слово.`
              : 'меню пустое'}
          </p>
        ) : (
          <motion.div
            key={isSearching ? `results-${searchResults.length}` : 'popular'}
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-x-3 gap-y-6"
          >
            {displayed.map((d) => (
              <motion.div key={d.id} variants={fadeUp}>
                <DishCard
                  name={d.name}
                  price={d.price}
                  weight={d.baseWeight}
                  meta={d.isWeighted ? 'весовое' : undefined}
                  photoUrl={d.photoUrl}
                  unavailable={!d.isAvailable}
                  onClick={() => openDish(d.id)}
                  onAdd={() => addDish(d)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
