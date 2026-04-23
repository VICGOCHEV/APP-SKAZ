import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Plus, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import ScreenHeader from '@/components/ui/ScreenHeader';
import {
  detectBrand,
  usePaymentCardsStore,
  type PaymentCardBrand,
} from '@/stores/paymentCards';

const schema = z.object({
  pan: z
    .string()
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => /^\d{16}$/.test(v), 'номер карты — 16 цифр'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/(\d{2})$/, 'формат: ММ/ГГ'),
  cvv: z.string().regex(/^\d{3}$/, 'CVV — 3 цифры'),
  holder: z.string().min(2, 'укажите держателя').optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

const BRAND_COLORS: Record<PaymentCardBrand, string> = {
  visa: 'bg-gradient-to-br from-indigo to-midnight',
  mastercard: 'bg-gradient-to-br from-wine to-burgundy',
  mir: 'bg-gradient-to-br from-forest to-pine',
  other: 'bg-gradient-to-br from-ink-700 to-ink-900',
};

const BRAND_LABEL: Record<PaymentCardBrand, string> = {
  visa: 'VISA',
  mastercard: 'MASTERCARD',
  mir: 'МИР',
  other: 'CARD',
};

function maskPan(pan: string): string {
  const d = pan.replace(/\D/g, '').slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function maskExpiry(exp: string): string {
  const d = exp.replace(/\D/g, '').slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export default function PaymentCardsScreen() {
  const navigate = useNavigate();
  const { list, add, remove, setDefault } = usePaymentCardsStore();
  const [formOpen, setFormOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { pan: '', expiry: '', cvv: '', holder: '' },
  });

  const onSubmit = form.handleSubmit((v) => {
    const digits = v.pan.replace(/\D/g, '');
    add({
      brand: detectBrand(digits),
      last4: digits.slice(-4),
      expiry: v.expiry,
      holder: v.holder || undefined,
    });
    form.reset();
    setFormOpen(false);
  });

  return (
    <div className="flex flex-col bg-paper">
      <ScreenHeader
        variant="back"
        title="платёжные карты"
        onBack={() => navigate('/profile')}
        rightSlot={
          !formOpen ? (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              aria-label="добавить карту"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-wine text-cream hover:bg-burgundy"
            >
              <Plus size={18} strokeWidth={2} />
            </button>
          ) : null
        }
      />

      <div className="flex flex-col gap-3 px-4 pt-2 pb-8">
        <AnimatePresence>
          {formOpen && (
            <motion.form
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3 rounded-lg border border-cream-deep bg-cream-soft p-4">
                <h3 className="font-serif text-[18px] text-ink-900">новая карта</h3>
                <Input
                  label="номер карты"
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  {...form.register('pan', {
                    onChange: (e) => {
                      form.setValue('pan', maskPan(e.target.value), {
                        shouldValidate: false,
                      });
                    },
                  })}
                  error={form.formState.errors.pan?.message}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="ММ/ГГ"
                    placeholder="12/27"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    {...form.register('expiry', {
                      onChange: (e) => {
                        form.setValue('expiry', maskExpiry(e.target.value), {
                          shouldValidate: false,
                        });
                      },
                    })}
                    error={form.formState.errors.expiry?.message}
                  />
                  <Input
                    label="CVV"
                    placeholder="•••"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    type="password"
                    maxLength={3}
                    {...form.register('cvv', {
                      onChange: (e) => {
                        form.setValue('cvv', e.target.value.replace(/\D/g, '').slice(0, 3), {
                          shouldValidate: false,
                        });
                      },
                    })}
                    error={form.formState.errors.cvv?.message}
                  />
                </div>
                <Input
                  label="держатель (необязательно)"
                  placeholder="IVAN IVANOV"
                  autoComplete="cc-name"
                  {...form.register('holder')}
                  error={form.formState.errors.holder?.message}
                />
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      form.reset();
                      setFormOpen(false);
                    }}
                  >
                    отмена
                  </Button>
                  <Button type="submit" variant="green">
                    привязать
                  </Button>
                </div>
                <p className="text-center text-[10px] text-ink-500">
                  данные карты в рамках демо хранятся только в вашем браузере и не отправляются на сервер
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {list.length === 0 && !formOpen ? (
          <EmptyState
            icon={<CreditCard size={24} strokeWidth={1.6} />}
            title="нет карт"
            description="привяжите карту, чтобы оплачивать в один тап"
            action={
              <Button variant="green" size="sm" onClick={() => setFormOpen(true)}>
                добавить карту
              </Button>
            }
          />
        ) : (
          <AnimatePresence initial={false}>
            {list.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div
                  className={`relative flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-xl p-5 text-cream ${BRAND_COLORS[c.brand]}`}
                >
                  <span
                    aria-hidden
                    className="absolute top-[-40px] right-[-40px] h-32 w-32 rounded-full border border-current opacity-[0.12]"
                  />
                  <span
                    aria-hidden
                    className="absolute top-6 right-4 h-16 w-16 rounded-full border border-current opacity-[0.12]"
                  />
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-[11px] tracking-[0.22em] opacity-80 uppercase">
                      {BRAND_LABEL[c.brand]}
                    </span>
                    {c.isDefault && (
                      <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
                        <Check size={12} strokeWidth={2.4} />
                        основная
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-mono text-[22px] tracking-[0.08em]">
                      •••• •••• •••• {c.last4}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] tracking-[0.12em] opacity-80 uppercase">
                      <span>{c.holder ?? 'держатель'}</span>
                      <span>{c.expiry}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between gap-2 px-1">
                  {!c.isDefault ? (
                    <button
                      type="button"
                      onClick={() => setDefault(c.id)}
                      className="text-[12px] font-semibold text-wine hover:text-burgundy"
                    >
                      сделать основной
                    </button>
                  ) : (
                    <span className="text-[12px] text-ink-500">для оплаты по умолчанию</span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    aria-label="удалить карту"
                    className="flex items-center gap-1 text-[12px] text-ink-500 hover:text-danger"
                  >
                    <Trash2 size={14} strokeWidth={1.6} />
                    удалить
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
