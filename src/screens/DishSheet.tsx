import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BottomSheet from '@/components/ui/BottomSheet';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import WeightSlider from '@/components/ui/WeightSlider';
import Skeleton from '@/components/ui/Skeleton';
import QuantityStepper from '@/components/ui/QuantityStepper';
import { useDish } from '@/hooks/queries/useDishes';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatPrice';
import { formatWeight } from '@/lib/formatWeight';
import { cn } from '@/lib/cn';

const PHOTO_SIZE = 500;
const PHOTO_OVERLAP = PHOTO_SIZE / 2;
const CONTENT_TOP_PAD = PHOTO_OVERLAP - 40; // photo bottom overlaps title area

export default function DishSheet() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { data: dish, isPending, error } = useDish(id);
  const { addDish } = useCart();

  const [weight, setWeight] = useState(dish?.baseWeight ?? 200);
  const [qty, setQty] = useState(1);

  // When the dish loads (or changes), seed the slider to its base portion
  // so the value is always a valid multiple of `baseWeight`.
  useEffect(() => {
    if (dish?.isWeighted && dish.baseWeight) setWeight(dish.baseWeight);
  }, [dish?.id, dish?.isWeighted, dish?.baseWeight]);
  const [expanded, setExpanded] = useState(false);
  const [selectedModifiers, setSelectedModifiers] = useState<Set<string>>(() => new Set());
  const [isOpen, setIsOpen] = useState(true);

  const close = () => setIsOpen(false);

  // After exit animations finish, actually navigate away
  useEffect(() => {
    if (isOpen) return;
    const bg = (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation;
    const timer = window.setTimeout(() => {
      if (bg) navigate(-1);
      else navigate('/', { replace: true });
    }, 550);
    return () => window.clearTimeout(timer);
  }, [isOpen, location.state, navigate]);

  const modifierDelta = dish
    ? dish.modifiers
        .filter((m) => selectedModifiers.has(m.id))
        .reduce((sum, m) => sum + m.priceDelta, 0)
    : 0;

  const basePrice = dish
    ? dish.isWeighted
      ? Math.round((dish.price * weight) / dish.baseWeight / 10) * 10
      : dish.price * qty
    : 0;
  const priceNow = basePrice + modifierDelta;

  const toggleModifier = (id: string) => {
    setSelectedModifiers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const photo = dish?.photoUrl ? (
    <motion.div
      className="flex items-center justify-center"
      style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
      initial={{ y: -PHOTO_SIZE - 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -PHOTO_SIZE - 40, opacity: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 320, mass: 0.6 }}
    >
      <img
        src={dish.photoUrl}
        alt=""
        className="h-full w-full object-contain"
        style={{
          animation: 'sheet-dish-spin 80s linear infinite',
          animationDelay: '700ms',
          filter:
            'drop-shadow(0 24px 40px rgba(90,16,20,0.32)) drop-shadow(0 10px 16px rgba(28,21,16,0.18))',
        }}
      />
    </motion.div>
  ) : null;

  return (
    <BottomSheet
      open={isOpen}
      onClose={close}
      ariaLabel={dish?.name}
      allowOverflow
      aboveSheet={photo}
      aboveSheetOverlap={PHOTO_OVERLAP}
    >
      {isPending ? (
        <div className="flex flex-col gap-3 px-5 pt-6 pb-6">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error || !dish ? (
        <div className="px-5 pt-6 pb-6 text-center text-[13px] text-danger">
          блюдо не найдено
        </div>
      ) : (
        <div
          className="relative z-10 flex flex-col gap-4 px-5 pb-5"
          style={{ paddingTop: CONTENT_TOP_PAD }}
        >
          {!dish.isAvailable && (
            <span className="mx-auto -mt-2 rounded-full bg-danger px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-cream uppercase">
              в стоп-листе
            </span>
          )}

          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 flex-1 font-serif text-[26px] leading-[1.08] text-ink-900">
              {dish.name}
            </h3>
            <motion.span
              key={priceNow}
              initial={{ scale: 1.18 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 13, stiffness: 380 }}
              className="font-serif text-[26px] whitespace-nowrap text-wine"
            >
              {formatPrice(priceNow)}
            </motion.span>
          </div>

          {/* Meta: calories + КБЖУ */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-500">
            <span>
              <span className="font-mono font-semibold text-ink-800">{dish.calories}</span>{' '}
              ккал
            </span>
            <span className="h-[3px] w-[3px] rounded-full bg-ink-300" />
            <span>
              <span className="font-mono font-semibold text-ink-800">
                {dish.nutrients.proteins}/{dish.nutrients.fats}/{dish.nutrients.carbs}
              </span>{' '}
              кбжу
            </span>
            <span className="h-[3px] w-[3px] rounded-full bg-ink-300" />
            <span>{formatWeight(dish.baseWeight)}</span>
          </div>

          {/* Expandable description with gradient fade */}
          <section>
            <h4 className="mb-1.5 text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase">
              описание
            </h4>
            <div
              className="relative overflow-hidden transition-[max-height] duration-300 ease-out"
              style={{ maxHeight: expanded ? 600 : 72 }}
            >
              <p className="text-[14px] leading-relaxed text-ink-700">
                {dish.description}
                {dish.composition && (
                  <>
                    {' '}
                    <span className="text-ink-500">состав: {dish.composition}.</span>
                  </>
                )}
                {dish.allergens.length > 0 && (
                  <span className="text-ink-500">
                    {' '}
                    аллергены: {dish.allergens.join(', ')}.
                  </span>
                )}
              </p>
              {!expanded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/80 to-transparent" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-[12px] font-semibold text-wine transition-colors hover:text-burgundy"
            >
              {expanded ? 'свернуть' : 'подробнее →'}
            </button>
          </section>

          {/* Portion / quantity — no "выбрано" label, slider bubble is enough */}
          <section>
            <h4 className="mb-3 text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase">
              {dish.isWeighted ? 'порция' : 'количество'}
            </h4>
            {dish.isWeighted ? (
              <WeightSlider
                value={weight}
                onChange={setWeight}
                min={dish.weightPresets[0] ?? dish.baseWeight ?? 100}
                max={
                  dish.weightPresets[dish.weightPresets.length - 1] ??
                  (dish.baseWeight ? dish.baseWeight * 10 : 800)
                }
                step={dish.baseWeight || 10}
              />
            ) : (
              <QuantityStepper value={qty} onChange={setQty} />
            )}
          </section>

          {/* Additions / modifiers */}
          {dish.modifiers.length > 0 && (
            <section>
              <h4 className="mb-3 text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase">
                дополнительно
              </h4>
              <div className="flex flex-wrap gap-2">
                {dish.modifiers.map((m) => {
                  const active = selectedModifiers.has(m.id) || (!selectedModifiers.size && m.default);
                  return (
                    <Chip
                      key={m.id}
                      variant="outline"
                      active={active}
                      onClick={() => toggleModifier(m.id)}
                    >
                      {m.name}
                      {m.priceDelta > 0 && (
                        <span className={cn('ml-1 text-[11px]', active ? 'text-cream/80' : 'text-wine/70')}>
                          +{m.priceDelta}₽
                        </span>
                      )}
                    </Chip>
                  );
                })}
              </div>
            </section>
          )}

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button variant="secondary">в избранное</Button>
            <Button
              variant="green"
              disabled={!dish.isAvailable}
              onClick={() => {
                const activeModifiers = dish.modifiers
                  .filter((m) => selectedModifiers.has(m.id) || (!selectedModifiers.size && m.default))
                  .map((m) => m.id);
                addDish(dish, {
                  quantity: dish.isWeighted ? 1 : qty,
                  weight: dish.isWeighted ? weight : undefined,
                  modifiers: activeModifiers,
                });
                close();
              }}
            >
              добавить — {formatPrice(priceNow)}
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
