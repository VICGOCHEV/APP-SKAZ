import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useAuth } from '@/hooks/useAuth';

type Mode = 'login' | 'register';

const loginSchema = z.object({
  email: z.string().email('введите email'),
  password: z.string().min(8, 'пароль — минимум 8 символов'),
});

const registerSchema = z
  .object({
    name: z.string().min(2, 'введите имя'),
    email: z.string().email('введите email'),
    phone: z
      .string()
      .regex(/^\+7\s?\d{3}\s?\d{3}-?\d{2}-?\d{2}$/, 'формат: +7 900 555-14-23'),
    password: z.string().min(8, 'минимум 8 символов'),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    path: ['password_confirmation'],
    message: 'пароли не совпадают',
  });

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

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
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onLogin = loginForm.handleSubmit(async ({ email, password }) => {
    setSubmitError(null);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка входа');
    }
  });

  const onRegister = registerForm.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await register(values);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка регистрации');
    }
  });

  const switchMode = (next: Mode) => {
    setMode(next);
    setSubmitError(null);
  };

  const loginBusy = loginForm.formState.isSubmitting;
  const registerBusy = registerForm.formState.isSubmitting;

  return (
    <div className="flex min-h-[100dvh] w-full max-w-[480px] flex-col bg-paper">
      <ScreenHeader
        variant="back"
        title={mode === 'login' ? 'вход' : 'регистрация'}
        onBack={() => navigate(-1)}
      />

      <div className="flex flex-1 flex-col gap-5 px-5 pt-6 pb-10">
        <div className="flex flex-col items-center gap-3 pt-2">
          <Logo className="h-9 w-auto text-ink-900" />
          <p className="text-center text-[13px] text-ink-500">
            {mode === 'login'
              ? 'войдите, чтобы оформить заказ и видеть историю'
              : 'зарегистрируйтесь — начислим приветственные бонусы'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-full border border-ink-200 bg-white p-1 text-[13px] font-semibold">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={
                'relative rounded-full py-2.5 transition-colors ' +
                (mode === m ? 'text-cream' : 'text-ink-500 hover:text-ink-900')
              }
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-mode-pill"
                  className="absolute inset-0 rounded-full bg-wine"
                  transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                />
              )}
              <span className="relative">{m === 'login' ? 'вход' : 'регистрация'}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === 'login' ? (
            <motion.form
              key="login"
              onSubmit={onLogin}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
              noValidate
            >
              <Input
                label="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                autoFocus
                {...loginForm.register('email')}
                error={loginForm.formState.errors.email?.message}
              />
              <Input
                label="пароль"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...loginForm.register('password')}
                error={loginForm.formState.errors.password?.message}
              />
              {submitError && <p className="text-[13px] text-danger">{submitError}</p>}
              <Button
                type="submit"
                variant="green"
                fullWidth
                disabled={loginBusy}
                leftIcon={loginBusy ? <Loader2 size={16} className="animate-spin" /> : undefined}
              >
                войти
              </Button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-center text-[13px] text-wine hover:underline"
              >
                нет аккаунта? зарегистрируйтесь
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              onSubmit={onRegister}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
              noValidate
            >
              <Input
                label="имя"
                placeholder="как к вам обращаться"
                autoComplete="name"
                autoFocus
                {...registerForm.register('name')}
                error={registerForm.formState.errors.name?.message}
              />
              <Input
                label="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...registerForm.register('email')}
                error={registerForm.formState.errors.email?.message}
              />
              <Input
                label="телефон"
                placeholder="+7 900 555-14-23"
                inputMode="tel"
                autoComplete="tel"
                {...registerForm.register('phone', {
                  onChange: (e) => {
                    registerForm.setValue('phone', formatPhone(e.target.value), {
                      shouldValidate: false,
                    });
                  },
                })}
                error={registerForm.formState.errors.phone?.message}
              />
              <Input
                label="пароль"
                type="password"
                autoComplete="new-password"
                placeholder="не менее 8 символов"
                {...registerForm.register('password')}
                error={registerForm.formState.errors.password?.message}
              />
              <Input
                label="повторите пароль"
                type="password"
                autoComplete="new-password"
                {...registerForm.register('password_confirmation')}
                error={registerForm.formState.errors.password_confirmation?.message}
              />
              {submitError && <p className="text-[13px] text-danger">{submitError}</p>}
              <Button
                type="submit"
                variant="green"
                fullWidth
                disabled={registerBusy}
                leftIcon={
                  registerBusy ? <Loader2 size={16} className="animate-spin" /> : undefined
                }
              >
                зарегистрироваться
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-ink-500">
                нажимая «зарегистрироваться» вы соглашаетесь с условиями обработки персональных данных
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
