import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ui/ScreenHeader';
import DishCard from '@/components/ui/DishCard';
import Skeleton from '@/components/ui/Skeleton';
import { useCategories } from '@/hooks/queries/useCategories';
import { useDishes } from '@/hooks/queries/useDishes';
import { useOpenDish } from '@/lib/navigation';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/cn';
import type { Category, Dish } from '@/types';

const SCROLL_MARGIN = 96;

export default function MenuScreen() {
  const { categoryId } = useParams();
  const openDish = useOpenDish();
  const { addDish } = useCart();
  const { data: categories, isPending: cLoading } = useCategories();
  const { data: dishes, isPending: dLoading } = useDishes();

  const chipStripRef = useRef<HTMLDivElement>(null);
  const programmaticScrollRef = useRef(false);
  const programmaticTimeoutRef = useRef<number | null>(null);
  const [activeId, setActiveId] = useState<string>('');

  const grouped = useMemo(() => {
    if (!categories || !dishes) return [];
    return categories
      .map((c) => ({ category: c, dishes: dishes.filter((d) => d.categoryId === c.id) }))
      .filter((g) => g.dishes.length > 0);
  }, [categories, dishes]);

  // Scroll-spy, muted while programmatic scroll is in flight
  useEffect(() => {
    if (grouped.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (programmaticScrollRef.current) return;
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActiveId(hit.target.id.replace('cat-', ''));
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );
    grouped.forEach((g) => {
      const el = document.getElementById(`cat-${g.category.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [grouped]);

  // Initial activation + scroll to URL-provided categoryId
  useEffect(() => {
    if (grouped.length === 0) return;
    const targetId = categoryId && grouped.some((g) => g.category.id === categoryId)
      ? categoryId
      : grouped[0].category.id;
    setActiveId(targetId);
    if (categoryId) {
      const el = document.getElementById(`cat-${categoryId}`);
      if (el) {
        programmaticScrollRef.current = true;
        const rect = el.getBoundingClientRect();
        window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - SCROLL_MARGIN), behavior: 'instant' as ScrollBehavior });
        window.setTimeout(() => {
          programmaticScrollRef.current = false;
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, grouped.length]);

  // Center active chip in horizontal strip
  useEffect(() => {
    if (!activeId || !chipStripRef.current) return;
    const chip = chipStripRef.current.querySelector<HTMLElement>(
      `[data-chip-id="${activeId}"]`,
    );
    chip?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeId]);

  const handleChipClick = (cat: Category) => {
    if (cat.id === activeId) return;
    setActiveId(cat.id);
    programmaticScrollRef.current = true;
    if (programmaticTimeoutRef.current !== null) {
      window.clearTimeout(programmaticTimeoutRef.current);
    }
    const el = document.getElementById(`cat-${cat.id}`);
    if (el) {
      const rect = el.getBoundingClientRect();
      const targetY = window.scrollY + rect.top - SCROLL_MARGIN;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    }
    programmaticTimeoutRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 800);
  };

  return (
    <div className="flex flex-col bg-paper">
      <ScreenHeader variant="large" title="меню" subtitle="восточная кухня" />

      {/* Sticky chip strip — minimal: text only, wine active with sliding underline */}
      <div
        className="sticky top-0 z-20 border-b border-ink-100 bg-paper"
        aria-label="категории меню"
      >
        {cLoading ? (
          <div className="flex gap-5 overflow-hidden px-4 py-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
        ) : (
          <div
            ref={chipStripRef}
            className="flex gap-5 overflow-x-auto px-4 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {grouped.map(({ category }) => {
              const active = category.id === activeId;
              return (
                <button
                  key={category.id}
                  type="button"
                  data-chip-id={category.id}
                  onClick={() => handleChipClick(category)}
                  className={cn(
                    'relative flex-none py-1 text-[15px] font-medium whitespace-nowrap transition-colors duration-200',
                    active ? 'text-wine' : 'text-ink-500 hover:text-ink-900',
                  )}
                >
                  {category.name}
                  {active && (
                    <motion.span
                      layoutId="menu-chip-underline"
                      className="absolute inset-x-0 -bottom-[12px] h-[2px] rounded-full bg-wine"
                      transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-12 px-4 pt-8 pb-12">
        {dLoading || cLoading ? (
          <SectionSkeleton />
        ) : (
          grouped.map(({ category, dishes }) => (
            <MenuSection
              key={category.id}
              category={category}
              dishes={dishes}
              onOpen={openDish}
              onAdd={(dish) => addDish(dish)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function MenuSection({
  category,
  dishes,
  onOpen,
  onAdd,
}: {
  category: Category;
  dishes: Dish[];
  onOpen: (id: string) => void;
  onAdd: (dish: Dish) => void;
}) {
  return (
    <section id={`cat-${category.id}`} style={{ scrollMarginTop: SCROLL_MARGIN }}>
      <motion.h2
        initial={{ opacity: 0, y: -8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.4, ease: [0.22, 0.8, 0.3, 1] }}
        className="mb-5 font-serif text-[34px] leading-[1.02] text-ink-900"
      >
        {category.name}
      </motion.h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6">
        {dishes.map((d, idx) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -8% 0px' }}
            transition={{
              duration: 0.5,
              delay: Math.min((idx % 2) * 0.08, 0.16),
              ease: [0.22, 0.8, 0.3, 1],
            }}
          >
            <DishCard
              name={d.name}
              price={d.price}
              weight={d.baseWeight}
              meta={d.isWeighted ? 'весовое' : undefined}
              photoUrl={d.photoUrl}
              unavailable={!d.isAvailable}
              onClick={() => onOpen(d.id)}
              onAdd={() => onAdd(d)}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="mb-5 h-9 w-48" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex flex-col gap-2">
                <Skeleton className="aspect-square" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
