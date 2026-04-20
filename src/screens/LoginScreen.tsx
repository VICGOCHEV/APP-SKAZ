import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useAuth } from '@/hooks/useAuth';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'введите номер телефона')
    .regex(/^\+7\s?\d{3}\s?\d{3}-?\d{2}-?\d{2}$/, 'формат: +7 900 555-14-23'),
});

const codeSchema = z.object({
  code: z
    .string()
    .regex(/^\d{4}$/, 'код из 4 цифр'),
});

type PhoneForm = z.infer<typeof phoneSchema>;
type CodeForm = z.infer<typeof codeSchema>;

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11);
  if (!digits) return '';
  const p1 = digits.slice(1, 4);
  const p2 = digits.slice(4, 7);
  const p3 = digits.slice(7, 9);
  const p4 = digits.slice(9, 11);
  let out = '+7';
  if (p1) out += ` ${p1}`;
  if (p2) out += ` ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}

export default function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestSms, verifySms } = useAuth();
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    mode: 'onBlur',
    defaultValues: { phone: '' },
  });

  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
    mode: 'onBlur',
    defaultValues: { code: '' },
  });

  const onSubmitPhone = phoneForm.handleSubmit(async ({ phone: value }) => {
    setSubmitError(null);
    try {
      await requestSms(value);
      setPhone(value);
      setStep('code');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка отправки кода');
    }
  });

  const onSubmitCode = codeForm.handleSubmit(async ({ code }) => {
    setSubmitError(null);
    try {
      await verifySms(phone, code);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Неверный код');
      codeForm.setFocus('code');
    }
  });

  return (
    <div className="flex min-h-[100dvh] w-full max-w-[480px] flex-col bg-paper">
      <ScreenHeader
        variant="back"
        title={step === 'phone' ? 'вход' : 'код из sms'}
        onBack={() => (step === 'code' ? setStep('phone') : navigate(-1))}
      />
      <div className="flex flex-1 flex-col gap-6 px-5 pt-6 pb-10">
        <div className="flex flex-col items-center gap-3 pt-4">
          <Logo className="h-9 w-auto text-ink-900" />
          <p className="text-center text-[13px] text-ink-500">
            {step === 'phone'
              ? 'чтобы оформить заказ — введите номер телефона'
              : `код отправлен на ${phone}. тестовый код — 1234`}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={onSubmitPhone} className="flex flex-col gap-4" noValidate>
            <Input
              label="телефон"
              placeholder="+7 900 555-14-23"
              inputMode="tel"
              autoComplete="tel"
              autoFocus
              {...phoneForm.register('phone', {
                onChange: (e) => {
                  phoneForm.setValue('phone', formatPhone(e.target.value), {
                    shouldValidate: false,
                  });
                },
              })}
              error={phoneForm.formState.errors.phone?.message}
            />
            {submitError && <p className="text-[13px] text-danger">{submitError}</p>}
            <Button
              type="submit"
              variant="green"
              fullWidth
              disabled={phoneForm.formState.isSubmitting}
              leftIcon={
                phoneForm.formState.isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null
              }
            >
              отправить код
            </Button>
            <p className="text-center text-[11px] leading-relaxed text-ink-500">
              нажимая «отправить код» вы соглашаетесь с условиями обработки персональных данных
            </p>
          </form>
        ) : (
          <form onSubmit={onSubmitCode} className="flex flex-col gap-4" noValidate>
            <Input
              label="код"
              placeholder="1234"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={4}
              {...codeForm.register('code', {
                onChange: (e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                  codeForm.setValue('code', digits, { shouldValidate: false });
                  if (digits.length === 4) void onSubmitCode();
                },
              })}
              error={codeForm.formState.errors.code?.message}
            />
            {submitError && <p className="text-[13px] text-danger">{submitError}</p>}
            <Button
              type="submit"
              variant="green"
              fullWidth
              disabled={codeForm.formState.isSubmitting}
              leftIcon={
                codeForm.formState.isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null
              }
            >
              войти
            </Button>
            <button
              type="button"
              onClick={async () => {
                setSubmitError(null);
                try {
                  await requestSms(phone);
                } catch (err) {
                  setSubmitError(err instanceof Error ? err.message : 'Ошибка');
                }
              }}
              className="text-center text-[13px] text-wine hover:underline"
            >
              отправить код ещё раз
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
