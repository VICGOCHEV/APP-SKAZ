import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Radio from '@/components/ui/Radio';
import ScreenHeader from '@/components/ui/ScreenHeader';
import TextArea from '@/components/ui/TextArea';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCreateOrder } from '@/hooks/queries/useOrders';
import { formatPrice } from '@/lib/formatPrice';
import type { DeliveryMethod, PaymentMethod } from '@/types';

const schema = z
  .object({
    delivery: z.enum(['delivery', 'pickup']),
    payment: z.enum(['card_online', 'cash', 'card_courier']),
    name: z.string().min(2, 'укажите имя'),
    phone: z
      .string()
      .regex(/^\+7\s?\d{3}\s?\d{3}-?\d{2}-?\d{2}$/, 'формат: +7 900 555-14-23'),
    street: z.string().optional(),
    house: z.string().optional(),
    entrance: z.string().optional(),
    floor: z.string().optional(),
    apartment: z.string().optional(),
    timeMode: z.enum(['asap', 'scheduled']),
    timeScheduled: z.string().optional(),
    comment: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.delivery === 'delivery') {
      if (!v.street || v.street.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['street'],
          message: 'введите улицу',
        });
      }
      if (!v.house) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['house'],
          message: 'введите номер дома',
        });
      }
    }
    if (v.timeMode === 'scheduled' && !v.timeScheduled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['timeScheduled'],
        message: 'выберите время',
      });
    }
  });

type FormValues = z.infer<typeof schema>;

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const createOrder = useCreateOrder();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      delivery: 'delivery',
      payment: 'card_online',
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      street: '',
      house: '',
      entrance: '',
      floor: '',
      apartment: '',
      timeMode: 'asap',
      timeScheduled: '',
      comment: '',
    },
  });

  const delivery = form.watch('delivery');
  const timeMode = form.watch('timeMode');
  const payment = form.watch('payment');

  const pickupDiscount = delivery === 'pickup' ? Math.round(total * 0.2) : 0;
  const finalTotal = useMemo(
    () => Math.max(0, total - pickupDiscount),
    [total, pickupDiscount],
  );

  useEffect(() => {
    if (items.length === 0) navigate('/cart', { replace: true });
  }, [items.length, navigate]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const result = await createOrder.mutateAsync({
        items,
        total: finalTotal,
        delivery: values.delivery as DeliveryMethod,
        address:
          values.delivery === 'delivery' && values.street && values.house
            ? {
                id: `addr-${Date.now()}`,
                line: `${values.street}, ${values.house}`,
                entrance: values.entrance,
                floor: values.floor,
                flat: values.apartment,
                comment: values.comment,
              }
            : undefined,
        time: values.timeMode === 'asap' ? 'asap' : values.timeScheduled ?? 'asap',
        payment: values.payment as PaymentMethod,
        comment: values.comment,
        name: values.name,
        phone: values.phone,
      });
      clear();
      // Card-online → external payment URL. Backend redirects back to
      // /payments/<id>/success|failed (handled by PaymentReturnScreen).
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }
      if (result.orderId) {
        navigate(`/order/${result.orderId}`, { replace: true });
      } else {
        navigate('/profile/orders', { replace: true });
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка отправки заказа');
    }
  });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      <ScreenHeader variant="back" title="оформление" onBack={() => navigate(-1)} />
      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-6 px-4 pt-4 pb-[120px]">
        <section>
          <h3 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase">
            способ получения
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'delivery', label: 'доставка', sub: null },
                { value: 'pickup', label: 'самовывоз', sub: '−20%' },
              ] as const
            ).map((opt) => {
              const active = delivery === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => form.setValue('delivery', opt.value)}
                  className={
                    'relative flex flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors ' +
                    (active
                      ? 'border-wine bg-wine/5'
                      : 'border-ink-200 bg-white hover:border-ink-300')
                  }
                >
                  <span
                    className={
                      'text-[14px] font-semibold ' +
                      (active ? 'text-wine' : 'text-ink-900')
                    }
                  >
                    {opt.label}
                  </span>
                  {opt.sub && (
                    <span className="font-mono text-[10px] tracking-[0.12em] text-forest uppercase">
                      {opt.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {delivery === 'delivery' && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase">
              адрес доставки
            </h3>
            <div className="flex flex-col gap-3">
              <Input
                label="улица"
                placeholder="Ленинский проспект"
                {...form.register('street')}
                error={form.formState.errors.street?.message}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="дом"
                  placeholder="12"
                  {...form.register('house')}
                  error={form.formState.errors.house?.message}
                />
                <Input
                  label="квартира"
                  placeholder="45"
                  {...form.register('apartment')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="подъезд" placeholder="2" {...form.register('entrance')} />
                <Input label="этаж" placeholder="4" {...form.register('floor')} />
              </div>
            </div>
          </motion.section>
        )}

        <section>
          <h3 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase">
            контакт
          </h3>
          <div className="flex flex-col gap-3">
            <Input
              label="имя"
              placeholder="как к вам обращаться"
              {...form.register('name')}
              error={form.formState.errors.name?.message}
            />
            <Input
              label="телефон"
              placeholder="+7 900 555-14-23"
              inputMode="tel"
              {...form.register('phone')}
              error={form.formState.errors.phone?.message}
            />
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase">
            когда
          </h3>
          <div className="flex flex-col gap-2">
            <Radio
              label="как можно скорее (30–45 минут)"
              checked={timeMode === 'asap'}
              onChange={() => form.setValue('timeMode', 'asap')}
            />
            <Radio
              label="ко времени"
              checked={timeMode === 'scheduled'}
              onChange={() => form.setValue('timeMode', 'scheduled')}
            />
            {timeMode === 'scheduled' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  type="datetime-local"
                  {...form.register('timeScheduled')}
                  error={form.formState.errors.timeScheduled?.message}
                />
              </motion.div>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[11px] font-medium tracking-[0.14em] text-ink-500 uppercase">
            способ оплаты
          </h3>
          <div className="flex flex-col gap-2">
            {(
              [
                { value: 'card_online', label: 'картой онлайн' },
                { value: 'cash', label: 'наличными курьеру' },
                { value: 'card_courier', label: 'картой курьеру' },
              ] as const
            ).map((opt) => (
              <Radio
                key={opt.value}
                label={opt.label}
                checked={payment === opt.value}
                onChange={() => form.setValue('payment', opt.value)}
              />
            ))}
          </div>
        </section>

        <section>
          <TextArea
            label="комментарий курьеру"
            placeholder="домофон, подъезд, особенности заказа"
            {...form.register('comment')}
          />
        </section>

        <section className="rounded-lg bg-cream-soft p-4">
          <div className="flex items-center justify-between text-[13px] text-ink-700">
            <span>позиции</span>
            <span className="font-mono">{formatPrice(total)}</span>
          </div>
          {pickupDiscount > 0 && (
            <div className="mt-1 flex items-center justify-between text-[13px] text-forest">
              <span>скидка на самовывоз −20%</span>
              <span className="font-mono">−{formatPrice(pickupDiscount)}</span>
            </div>
          )}
          <div className="mt-3 flex items-baseline justify-between border-t border-cream-deep pt-3">
            <span className="font-serif text-[20px] text-ink-900">итого</span>
            <span className="font-serif text-[26px] text-wine">
              {formatPrice(finalTotal)}
            </span>
          </div>
        </section>

        {submitError && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-[13px] text-danger">
            {submitError}
          </p>
        )}

        {/* Sticky CTA inside form so submit fires */}
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[480px] border-t border-ink-100 bg-paper/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <Button
            type="submit"
            variant="green"
            fullWidth
            size="lg"
            disabled={createOrder.isPending}
            leftIcon={
              createOrder.isPending ? <Loader2 size={16} className="animate-spin" /> : undefined
            }
          >
            оформить — {formatPrice(finalTotal)}
          </Button>
        </div>
      </form>
    </div>
  );
}
