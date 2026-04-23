import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import QuantityStepper from '@/components/ui/QuantityStepper';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Skeleton from '@/components/ui/Skeleton';
import WeightSlider from '@/components/ui/WeightSlider';
import { useDishes } from '@/hooks/queries/useDishes';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatPrice';
import { formatWeight } from '@/lib/formatWeight';
import type { CartItem, Dish } from '@/types';

export default function CartScreen() {
  const navigate = useNavigate();
  const { items, count, total, setQuantity, setWeight, removeAt, clear } = useCart();
  const { data: dishes, isPending } = useDishes();

  const [promo, setPromo] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoApplied, setPromoApplied] = useState<number>(0);

  const dishById = useMemo(() => {
    const map = new Map<string, Dish>();
    (dishes ?? []).forEach((d) => map.set(d.id, d));
    return map;
  }, [dishes]);

  const discount = promoApplied;
  const finalTotal = Math.max(0, total - discount);

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    setPromoError(null);
    if (!code) return;
    if (code === 'SKAZKA50') {
      setPromoApplied(Math.round(total * 0.5));
    } else if (code === 'WELCOME') {
      setPromoApplied(200);
    } else {
      setPromoApplied(0);
      setPromoError('неизвестный промокод');
    }
  };

  const resetPromo = () => {
    setPromo('');
    setPromoApplied(0);
    setPromoError(null);
  };

  if (count === 0) {
    return (
      <div className="flex flex-col bg-paper">
        <ScreenHeader variant="large" title="корзина" subtitle="0 позиций" />
        <div className="p-4">
          <EmptyState
            icon={<ShoppingBag size={24} strokeWidth={1.6} />}
            title="корзина пуста"
            description="загляните в меню — самое вкусное ждёт на скатерти-самобранке"
            action={
              <Button variant="green" size="sm" onClick={() => navigate('/menu')}>
                открыть меню
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-paper">
      <ScreenHeader
        variant="large"
        title="корзина"
        subtitle={`${count} ${count === 1 ? 'позиция' : count < 5 ? 'позиции' : 'позиций'} · ${formatPrice(total)}`}
        rightSlot={
          <button
            type="button"
            onClick={clear}
            aria-label="очистить корзину"
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-500 hover:bg-cream-soft hover:text-danger"
          >
            <Trash2 size={18} strokeWidth={1.6} />
          </button>
        }
      />

      <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
        {isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {items.map((item, idx) => {
              const dish = dishById.get(item.dishId);
              if (!dish) return null;
              return (
                <CartRow
                  key={`${item.dishId}-${item.weight ?? 'x'}-${idx}`}
                  item={item}
                  dish={dish}
                  onRemove={() => removeAt(idx)}
                  onQuantity={(q) => setQuantity(idx, dish, q)}
                  onWeight={(w) => setWeight(idx, dish, w)}
                />
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Promo */}
      <section className="px-4 pb-4">
        <h3 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase">
          промокод
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="SKAZKA50"
            disabled={promoApplied > 0}
            className="flex-1 rounded-full border border-cream-deep bg-white px-4 py-2.5 text-[14px] text-ink-900 uppercase placeholder:text-ink-400 focus:border-wine focus:outline-none disabled:bg-cream-soft"
          />
          {promoApplied > 0 ? (
            <Button variant="secondary" size="sm" onClick={resetPromo} leftIcon={<X size={14} />}>
              убрать
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={applyPromo}>
              применить
            </Button>
          )}
        </div>
        {promoError && (
          <p className="mt-2 text-[12px] text-danger">{promoError}</p>
        )}
        {promoApplied > 0 && (
          <p className="mt-2 text-[12px] text-success">
            промокод применён: −{formatPrice(promoApplied)}
          </p>
        )}
      </section>

      {/* Summary */}
      <section className="mx-4 mb-4 rounded-lg bg-cream-soft p-4">
        <div className="flex items-center justify-between text-[13px] text-ink-700">
          <span>позиции</span>
          <span className="font-mono">{formatPrice(total)}</span>
        </div>
        {discount > 0 && (
          <div className="mt-1 flex items-center justify-between text-[13px] text-success">
            <span>скидка по промокоду</span>
            <span className="font-mono">−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="mt-1 flex items-center justify-between text-[13px] text-ink-500">
          <span>доставка</span>
          <span>считается на чекауте</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-cream-deep pt-3">
          <span className="font-serif text-[20px] text-ink-900">итого</span>
          <motion.span
            key={finalTotal}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 380 }}
            className="font-serif text-[26px] text-wine"
          >
            {formatPrice(finalTotal)}
          </motion.span>
        </div>
      </section>

      {/* Sticky checkout CTA */}
      <div className="sticky bottom-[96px] z-10 bg-gradient-to-t from-paper via-paper to-paper/80 px-4 pt-2 pb-4">
        <Button
          variant="green"
          fullWidth
          size="lg"
          onClick={() => navigate('/checkout')}
        >
          оформить заказ — {formatPrice(finalTotal)}
        </Button>
        <div className="mt-2 text-center">
          <Link to="/menu" className="text-[13px] text-ink-500 hover:text-wine">
            продолжить выбирать блюда
          </Link>
        </div>
      </div>
    </div>
  );
}

function CartRow({
  item,
  dish,
  onRemove,
  onQuantity,
  onWeight,
}: {
  item: CartItem;
  dish: Dish;
  onRemove: () => void;
  onQuantity: (q: number) => void;
  onWeight: (w: number) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: [0.22, 0.8, 0.3, 1] }}
      className="flex gap-3 rounded-lg border border-ink-100 bg-white p-3"
    >
      <div className="relative h-20 w-20 shrink-0">
        {dish.photoUrl ? (
          <img
            src={dish.photoUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-110 object-contain"
            style={{
              filter: 'drop-shadow(0 8px 10px rgba(90,16,20,0.2))',
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-cream-soft text-ink-300">
            ?
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-2 font-serif text-[15px] leading-tight text-ink-900">
            {dish.name}
          </h4>
          <button
            type="button"
            onClick={onRemove}
            aria-label="удалить"
            className="-mt-1 -mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-danger/10 hover:text-danger"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
        {item.modifiers.length > 0 && (
          <div className="text-[11px] text-ink-500">
            {item.modifiers
              .map((id) => dish.modifiers.find((m) => m.id === id)?.name)
              .filter(Boolean)
              .join(' · ')}
          </div>
        )}
        {dish.isWeighted && item.weight !== undefined ? (
          <div className="mt-1">
            <WeightSlider
              value={item.weight}
              onChange={onWeight}
              min={dish.weightPresets[0] ?? 50}
              max={dish.weightPresets[dish.weightPresets.length - 1] ?? 800}
              step={10}
              ariaLabel={`Вес для ${dish.name}`}
            />
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-1">
          {dish.isWeighted ? (
            <span className="text-[12px] text-ink-500">{formatWeight(item.weight ?? 0)}</span>
          ) : (
            <QuantityStepper value={item.quantity} onChange={onQuantity} size="sm" />
          )}
          <motion.span
            key={item.price}
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 380 }}
            className="font-serif text-[17px] text-wine"
          >
            {formatPrice(item.price)}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
