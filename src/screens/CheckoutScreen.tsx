import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Loader2, MapPin, Plus, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Input from '@/components/ui/Input';
import Radio from '@/components/ui/Radio';
import ScreenHeader from '@/components/ui/ScreenHeader';
import TextArea from '@/components/ui/TextArea';
import { USE_MOCKS } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useAddresses, useCheckAddress } from '@/hooks/queries/useAddresses';
import { useCreateOrder } from '@/hooks/queries/useOrders';
import { reportError, trackEvent } from '@/lib/analytics';
import { formatPrice } from '@/lib/formatPrice';
import { cn } from '@/lib/cn';
import type { DeliveryMethod, PaymentMethod } from '@/types';

/**
 * Live-fire guard: when the dev server is running against the real API,
 * pressing "оформить" actually creates an order in iiko. The banner +
 * "I really mean it" checkbox in the confirm dialog prevent accidents.
 */
const isLiveFireOnDev =
  !USE_MOCKS &&
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1|10\.|192\.168\.)/.test(window.location.hostname);

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  card_online: 'картой онлайн',
  cash: 'наличными курьеру',
  card_courier: 'картой курьеру',
};

const SAVED_ADDRESS_NEW = '__new__';

const schema = z
  .object({
    delivery: z.enum(['delivery', 'pickup']),
    payment: z.enum(['card_online', 'cash', 'card_courier']),
    name: z.string().min(2, 'укажите имя'),
    phone: z
      .string()
      .regex(/^\+7\s?\d{3}\s?\d{3}-?\d{2}-?\d{2}$/, 'формат: +7 900 555-14-23'),
    /** Either id of a saved address or SAVED_ADDRESS_NEW. */
    savedAddressId: z.string().optional(),
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
    if (v.delivery !== 'delivery') return;
    // When using a new (inline) address, require street + house.
    const usingNew = !v.savedAddressId || v.savedAddressId === SAVED_ADDRESS_NEW;
    if (usingNew) {
      if (!v.street || v.street.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['street'], message: 'введите улицу' });
      }
      if (!v.house) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['house'], message: 'введите номер дома' });
      }
    }
    if (v.timeMode === 'scheduled' && !v.timeScheduled) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['timeScheduled'], message: 'выберите время' });
    }
  });

type FormValues = z.infer<typeof schema>;

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const createOrder = useCreateOrder();
  const checkAddress = useCheckAddress();
  const addressesQuery = useAddresses();
  const savedAddresses = useMemo(() => addressesQuery.data ?? [], [addressesQuery.data]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [acknowledgedLiveFire, setAcknowledgedLiveFire] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  /** Held while a /orders POST is in-flight; blocks duplicate submits. */
  const submittingRef = useRef(false);
  /** Last successful submit timestamp — silences accidental re-clicks for 3s. */
  const lastSubmitAtRef = useRef(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      delivery: 'delivery',
      payment: 'card_online',
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      savedAddressId: SAVED_ADDRESS_NEW,
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
  const savedAddressId = form.watch('savedAddressId');
  const usingNewAddress = !savedAddressId || savedAddressId === SAVED_ADDRESS_NEW;

  // Auto-pick the first saved address once it loads, instead of "new".
  useEffect(() => {
    if (delivery === 'delivery' && savedAddresses.length > 0 && savedAddressId === SAVED_ADDRESS_NEW) {
      form.setValue('savedAddressId', savedAddresses[0].id);
    }
    // intentionally only on first list arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedAddresses.length]);

  // Re-check the address whenever the chosen saved address or the
  // inline street/house changes.
  const street = form.watch('street');
  const house = form.watch('house');
  const checkInput = useMemo(() => {
    if (delivery !== 'delivery') return null;
    if (!usingNewAddress) {
      const addr = savedAddresses.find((a) => a.id === savedAddressId);
      if (!addr?.street || !addr.house) return null;
      return { street: addr.street, house: addr.house };
    }
    if (!street || !house) return null;
    return { street, house };
  }, [delivery, usingNewAddress, savedAddressId, savedAddresses, street, house]);

  useEffect(() => {
    if (!checkInput) {
      checkAddress.reset();
      return;
    }
    const t = window.setTimeout(() => {
      checkAddress.mutate(checkInput);
    }, 400);
    return () => window.clearTimeout(t);
    // checkAddress is a stable mutation hook
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInput?.street, checkInput?.house]);

  const zoneCheck = checkAddress.data;
  const zoneOk = zoneCheck && !zoneCheck.error;
  const deliveryFee = zoneOk ? Math.round(zoneCheck.price ?? 0) : 0;

  const pickupDiscount = delivery === 'pickup' ? Math.round(total * 0.2) : 0;
  const finalTotal = useMemo(
    () => Math.max(0, total - pickupDiscount + (delivery === 'delivery' ? deliveryFee : 0)),
    [total, pickupDiscount, delivery, deliveryFee],
  );

  useEffect(() => {
    if (items.length === 0) navigate('/cart', { replace: true });
  }, [items.length, navigate]);

  // Fire once when the user lands on a valid checkout (cart not empty).
  // This is the funnel-entry event for analytics.
  useEffect(() => {
    if (items.length === 0) return;
    trackEvent('checkout_started', { items: items.length, total });
    // Intentionally only on first mount with non-empty cart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick down the post-submit cooldown bar so the user can see why the
  // button is locked instead of just a dead button.
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = window.setTimeout(() => setCooldownLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [cooldownLeft]);

  /** Validates form + opens the confirm dialog. Doesn't talk to /orders yet. */
  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);

    // Hard rate-limit: 3-second cooldown after a recent submit attempt.
    const sinceLast = Date.now() - lastSubmitAtRef.current;
    if (sinceLast < 3000) {
      setCooldownLeft(Math.ceil((3000 - sinceLast) / 1000));
      return;
    }

    if (values.delivery === 'delivery') {
      if (zoneCheck?.error) {
        setSubmitError(zoneCheck.error || 'этот адрес вне зоны доставки');
        return;
      }
      if (!zoneCheck && checkInput) {
        try {
          const res = await checkAddress.mutateAsync(checkInput);
          if (res.error) {
            setSubmitError(res.error);
            return;
          }
        } catch {
          setSubmitError('не удалось проверить адрес. попробуйте ещё раз');
          return;
        }
      }
    }

    setAcknowledgedLiveFire(false);
    setConfirmOpen(true);
  });

  /** Actually fires the /orders POST after the user confirms in the dialog. */
  const performSubmit = async () => {
    if (submittingRef.current) return; // idempotency: one in-flight at a time
    submittingRef.current = true;
    lastSubmitAtRef.current = Date.now();

    const values = form.getValues();
    try {
      const useSavedId =
        values.delivery === 'delivery' &&
        !usingNewAddress &&
        savedAddressId !== SAVED_ADDRESS_NEW;

      const result = await createOrder.mutateAsync({
        items,
        total: finalTotal,
        delivery: values.delivery as DeliveryMethod,
        addressId: useSavedId ? savedAddressId : undefined,
        address:
          values.delivery === 'delivery' && !useSavedId && values.street && values.house
            ? {
                id: `addr-${Date.now()}`,
                line: `${values.street}, ${values.house}`,
                street: values.street,
                house: values.house,
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
      setConfirmOpen(false);
      trackEvent('order_placed', {
        order_id: result.orderId,
        total: finalTotal,
        payment: values.payment,
        delivery: values.delivery,
        items: items.length,
      });
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
      reportError(err, { context: 'checkout_submit', total: finalTotal, payment: values.payment });
      setSubmitError(err instanceof Error ? err.message : 'Ошибка отправки заказа');
      setConfirmOpen(false);
    } finally {
      submittingRef.current = false;
    }
  };

  const submitDisabled =
    createOrder.isPending ||
    cooldownLeft > 0 ||
    (delivery === 'delivery' && (checkAddress.isPending || (zoneCheck && !zoneOk)));

  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      <ScreenHeader variant="back" title="оформление" onBack={() => navigate(-1)} />
      {isLiveFireOnDev && (
        <div className="border-b border-warning/40 bg-warning/15 px-4 py-2.5">
          <div className="flex items-start gap-2 text-[12px] text-ink-900">
            <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" strokeWidth={2} />
            <span>
              <strong>боевой режим:</strong> вы на локалке, но API настоящий — клик «оформить»
              создаст реальный заказ в iiko. Для теста выключите{' '}
              <code className="rounded bg-cream-deep px-1 font-mono text-[11px]">
                VITE_USE_MOCKS
              </code>
              .
            </span>
          </div>
        </div>
      )}
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

            {savedAddresses.length > 0 && (
              <div className="mb-3 flex flex-col gap-2">
                {savedAddresses.map((a) => {
                  const active = savedAddressId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => form.setValue('savedAddressId', a.id)}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors',
                        active
                          ? 'border-wine bg-wine/5'
                          : 'border-ink-200 bg-white hover:border-ink-300',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          active ? 'bg-wine text-cream' : 'bg-cream-soft text-wine',
                        )}
                      >
                        <MapPin size={14} strokeWidth={1.6} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-serif text-[15px] text-ink-900">
                          {a.line}
                        </div>
                        {(a.flat || a.entrance || a.floor) && (
                          <div className="mt-0.5 truncate text-[11px] text-ink-500">
                            {a.flat && `кв. ${a.flat}`}
                            {a.flat && (a.entrance || a.floor) && ' · '}
                            {a.entrance && `подъезд ${a.entrance}`}
                            {a.entrance && a.floor && ' · '}
                            {a.floor && `этаж ${a.floor}`}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => form.setValue('savedAddressId', SAVED_ADDRESS_NEW)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-left transition-colors',
                    usingNewAddress
                      ? 'border-wine bg-wine/5 text-wine'
                      : 'border-ink-200 text-ink-700 hover:border-ink-300',
                  )}
                >
                  <Plus size={14} strokeWidth={1.8} />
                  <span className="text-[13px]">новый адрес</span>
                </button>
              </div>
            )}

            {usingNewAddress && (
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
            )}

            {/* Zone check status */}
            {checkAddress.isPending && (
              <div className="mt-3 flex items-center gap-2 rounded-md bg-cream-soft px-3 py-2 text-[12px] text-ink-700">
                <Loader2 size={14} className="animate-spin text-wine" />
                <span>проверяем зону доставки…</span>
              </div>
            )}
            {!checkAddress.isPending && zoneCheck?.error && (
              <div className="mt-3 flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-[12px] text-danger">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" strokeWidth={1.8} />
                <span>{zoneCheck.error}</span>
              </div>
            )}
            {!checkAddress.isPending && zoneOk && (
              <div className="mt-3 flex items-center justify-between rounded-md bg-success/10 px-3 py-2 text-[12px] text-success">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} strokeWidth={1.8} />
                  адрес в зоне доставки
                </span>
                <span className="font-mono">
                  {deliveryFee > 0 ? `+${formatPrice(deliveryFee)}` : 'бесплатно'}
                </span>
              </div>
            )}
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
          {delivery === 'delivery' && deliveryFee > 0 && (
            <div className="mt-1 flex items-center justify-between text-[13px] text-ink-700">
              <span>доставка</span>
              <span className="font-mono">+{formatPrice(deliveryFee)}</span>
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
            disabled={submitDisabled}
            leftIcon={
              createOrder.isPending ? <Loader2 size={16} className="animate-spin" /> : undefined
            }
          >
            {cooldownLeft > 0
              ? `подождите ${cooldownLeft}с`
              : `оформить — ${formatPrice(finalTotal)}`}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="оформить заказ?"
        description={
          <div className="flex flex-col gap-1.5">
            <div>
              <span className="text-ink-500">сумма:</span>{' '}
              <strong className="text-wine">{formatPrice(finalTotal)}</strong>
            </div>
            <div>
              <span className="text-ink-500">оплата:</span>{' '}
              {PAYMENT_LABEL[payment as PaymentMethod] ?? payment}
            </div>
            <div>
              <span className="text-ink-500">{delivery === 'pickup' ? 'самовывоз' : 'доставка'}:</span>{' '}
              {delivery === 'pickup'
                ? 'забрать в ресторане'
                : !usingNewAddress
                  ? savedAddresses.find((a) => a.id === savedAddressId)?.line ?? '—'
                  : `${form.getValues('street') || ''}, ${form.getValues('house') || ''}`}
            </div>
            {payment === 'card_online' && (
              <div className="mt-1 text-[12px] text-ink-500">
                после подтверждения откроется страница оплаты
              </div>
            )}
            {isLiveFireOnDev && (
              <div className="mt-2 rounded-md bg-warning/15 px-2.5 py-1.5 text-[11px] text-ink-900">
                ⚠️ боевой API — заказ реально уйдёт повару
              </div>
            )}
          </div>
        }
        confirmLabel="да, оформить"
        cancelLabel="нет, передумал"
        loading={createOrder.isPending}
        confirmDisabled={isLiveFireOnDev && !acknowledgedLiveFire}
        onCancel={() => {
          if (createOrder.isPending) return;
          setConfirmOpen(false);
        }}
        onConfirm={performSubmit}
      >
        {isLiveFireOnDev && (
          <Checkbox
            label="я понимаю, что заказ уйдёт в реальный iiko"
            checked={acknowledgedLiveFire}
            onChange={(e) => setAcknowledgedLiveFire(e.target.checked)}
          />
        )}
      </ConfirmDialog>
    </div>
  );
}
