import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Repeat } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Skeleton from '@/components/ui/Skeleton';
import { useDishes } from '@/hooks/queries/useDishes';
import { useOrderHistory, useRepeatOrder } from '@/hooks/queries/useOrders';
import { useUserStore } from '@/stores/user';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/formatPrice';
import { cn } from '@/lib/cn';
import type { Dish, Order, OrderStatus } from '@/types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  accepted: 'принят',
  cooking: 'готовится',
  ready: 'готов',
  on_way: 'в пути',
  delivered: 'доставлен',
  cancelled: 'отменён',
};

const STATUS_TONE: Record<OrderStatus, string> = {
  accepted: 'bg-wine/10 text-wine',
  cooking: 'bg-warning/15 text-warning',
  ready: 'bg-forest/10 text-forest',
  on_way: 'bg-indigo/10 text-indigo',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

function formatCreated(iso: string): string {
  try {
    const d = new Date(iso);
    const day = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return `${day} · ${time}`;
  } catch {
    return iso;
  }
}

export default function OrderHistoryScreen() {
  const navigate = useNavigate();
  const { data: orders, isPending } = useOrderHistory();
  const { data: dishes } = useDishes();
  const { addDish } = useCart();
  const repeatMutation = useRepeatOrder();
  const isAuthed = useUserStore((s) => s.status === 'authenticated');

  const dishById = useMemo(() => {
    const map = new Map<string, Dish>();
    (dishes ?? []).forEach((d) => map.set(d.id, d));
    return map;
  }, [dishes]);

  const repeat = async (order: Order) => {
    if (isAuthed) {
      // Authed → backend rebuilds the cart server-side; just navigate.
      try {
        await repeatMutation.mutateAsync(order.id);
        navigate('/cart');
        return;
      } catch {
        // fall through to local replay
      }
    }
    order.items.forEach((item) => {
      const dish = dishById.get(item.dishId);
      if (!dish) return;
      addDish(dish, {
        quantity: item.quantity,
        weight: item.weight,
        modifiers: item.modifiers,
      });
    });
    navigate('/cart');
  };

  return (
    <div className="flex flex-col bg-paper">
      <ScreenHeader
        variant="back"
        title="история заказов"
        onBack={() => navigate('/profile')}
      />
      <div className="flex flex-col gap-3 px-4 pt-2 pb-8">
        {isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <EmptyState
            icon={<Clock size={24} strokeWidth={1.6} />}
            title="ещё нет заказов"
            description="оформите первый — он появится здесь, и его можно будет повторить одним тапом"
            action={
              <Button variant="green" size="sm" onClick={() => navigate('/menu')}>
                открыть меню
              </Button>
            }
          />
        ) : (
          orders.map((order, idx) => (
            <motion.article
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 0.8, 0.3, 1] }}
              className="flex flex-col gap-3 rounded-lg border border-ink-100 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-serif text-[18px] leading-tight text-ink-900">
                    заказ №{order.id}
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink-500">
                    {formatCreated(order.createdAt)}
                  </div>
                </div>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase',
                    STATUS_TONE[order.status],
                  )}
                >
                  {STATUS_LABEL[order.status]}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-[13px] text-ink-700">
                {order.items.slice(0, 3).map((it, i) => {
                  const dish = dishById.get(it.dishId);
                  return (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate">
                        {dish?.name ?? 'блюдо'}{' '}
                        <span className="text-ink-500">
                          ×{it.quantity}
                          {it.weight ? ` · ${it.weight}г` : ''}
                        </span>
                      </span>
                      <span className="font-mono text-ink-500">{formatPrice(it.price)}</span>
                    </div>
                  );
                })}
                {order.items.length > 3 && (
                  <div className="text-[12px] text-ink-500">
                    и ещё {order.items.length - 3}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                <span className="font-serif text-[20px] text-wine">
                  {formatPrice(order.total)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/order/${order.id}`)}
                  >
                    детали
                  </Button>
                  <Button
                    variant="green"
                    size="sm"
                    onClick={() => repeat(order)}
                    leftIcon={<Repeat size={14} />}
                  >
                    повторить
                  </Button>
                </div>
              </div>
            </motion.article>
          ))
        )}
      </div>
    </div>
  );
}
