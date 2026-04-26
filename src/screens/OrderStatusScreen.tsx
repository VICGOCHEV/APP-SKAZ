import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, ChefHat, MapPin, Package, Truck } from 'lucide-react';
import Button from '@/components/ui/Button';
import ScreenHeader from '@/components/ui/ScreenHeader';
import Skeleton from '@/components/ui/Skeleton';
import { useOrder } from '@/hooks/queries/useOrders';
import { formatPrice } from '@/lib/formatPrice';
import { cn } from '@/lib/cn';
import type { OrderStatus } from '@/types';

const STATUS_FLOW: OrderStatus[] = ['accepted', 'cooking', 'ready', 'on_way', 'delivered'];

type Step = {
  status: OrderStatus;
  label: string;
  sub: string;
  icon: React.ReactNode;
};

const STEPS: Step[] = [
  {
    status: 'accepted',
    label: 'принят',
    sub: 'мы получили ваш заказ',
    icon: <Check size={18} strokeWidth={2} />,
  },
  {
    status: 'cooking',
    label: 'готовится',
    sub: 'шеф уже у плиты',
    icon: <ChefHat size={18} strokeWidth={1.8} />,
  },
  {
    status: 'ready',
    label: 'готов',
    sub: 'собираем и упаковываем',
    icon: <Package size={18} strokeWidth={1.8} />,
  },
  {
    status: 'on_way',
    label: 'в пути',
    sub: 'курьер забрал заказ',
    icon: <Truck size={18} strokeWidth={1.8} />,
  },
  {
    status: 'delivered',
    label: 'доставлен',
    sub: 'приятного аппетита!',
    icon: <MapPin size={18} strokeWidth={1.8} />,
  },
];

export default function OrderStatusScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: order, isPending } = useOrder(id);

  const currentStepIdx = order ? STATUS_FLOW.indexOf(order.status) : -1;

  return (
    <div className="flex flex-col bg-paper">
      <ScreenHeader
        variant="back"
        title={order ? `заказ №${order.id}` : 'заказ'}
        subtitle={order?.delivery === 'pickup' ? 'самовывоз' : 'доставка'}
        onBack={() => navigate('/')}
      />

      {isPending ? (
        <div className="flex flex-col gap-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !order ? (
        <div className="p-6 text-center text-[13px] text-danger">заказ не найден</div>
      ) : (
        <>
          {/* Hero summary */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 0.8, 0.3, 1] }}
            className="mx-4 mt-2 rounded-lg bg-gradient-to-br from-cream to-cream-deep p-5"
          >
            <div className="font-mono text-[10px] tracking-[0.18em] text-wine uppercase">
              сумма заказа
            </div>
            <div className="mt-1 font-serif text-[34px] leading-none text-ink-900">
              {formatPrice(order.total)}
            </div>
            <div className="mt-3 text-[13px] text-ink-700">
              {order.items.length}{' '}
              {order.items.length === 1
                ? 'позиция'
                : order.items.length < 5
                  ? 'позиции'
                  : 'позиций'}{' '}
              · {order.payment === 'card_online' ? 'онлайн' : order.payment === 'cash' ? 'наличные' : 'картой курьеру'}
            </div>
            {order.address && (
              <div className="mt-3 flex items-start gap-2 text-[12px] text-ink-700">
                <MapPin size={14} strokeWidth={1.6} className="mt-0.5 flex-none text-wine" />
                <span>{order.address.line}</span>
              </div>
            )}
          </motion.section>

          {/* Progress steps */}
          <section className="px-4 pt-6 pb-10">
            <h2 className="mb-4 font-serif text-[24px] leading-tight text-ink-900">
              статус
            </h2>
            <div className="relative flex flex-col gap-0">
              {STEPS.map((step, idx) => {
                const done = idx < currentStepIdx;
                const active = idx === currentStepIdx;
                const upcoming = idx > currentStepIdx;
                return (
                  <div key={step.status} className="relative flex items-start gap-4 pb-6 last:pb-0">
                    {/* Vertical connector line */}
                    {idx < STEPS.length - 1 && (
                      <div className="absolute top-10 left-5 h-[calc(100%-32px)] w-[2px] overflow-hidden bg-ink-100">
                        <motion.div
                          className="h-full w-full bg-wine"
                          initial={{ y: '-100%' }}
                          animate={{ y: done ? '0%' : '-100%' }}
                          transition={{ duration: 0.6, ease: [0.22, 0.8, 0.3, 1] }}
                        />
                      </div>
                    )}
                    <motion.div
                      initial={false}
                      animate={{
                        scale: active ? 1.05 : 1,
                        backgroundColor: done || active ? 'var(--wine)' : 'var(--ink-100)',
                      }}
                      transition={{ duration: 0.3, ease: [0.22, 0.8, 0.3, 1] }}
                      className={cn(
                        'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        done || active ? 'text-cream' : 'text-ink-400',
                      )}
                    >
                      {active && (
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-wine"
                          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                        />
                      )}
                      <span className="relative">{step.icon}</span>
                    </motion.div>
                    <div className="min-w-0 flex-1 pt-1">
                      <div
                        className={cn(
                          'font-serif text-[18px] leading-tight',
                          upcoming ? 'text-ink-400' : 'text-ink-900',
                        )}
                      >
                        {step.label}
                      </div>
                      <div
                        className={cn(
                          'mt-0.5 text-[12px]',
                          upcoming ? 'text-ink-300' : 'text-ink-500',
                        )}
                      >
                        {step.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <Button variant="secondary" fullWidth onClick={() => navigate('/menu')}>
                выбрать что-то ещё
              </Button>
              {order.status === 'delivered' && (
                <Button variant="green" fullWidth onClick={() => navigate('/')}>
                  вернуться на главную
                </Button>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
