import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  useNotifyPaymentFailed,
  useNotifyPaymentSuccess,
} from '@/hooks/queries/useOrders';

/**
 * Landing page after the payment provider redirects back.
 * Routes: /payments/:id/success and /payments/:id/failed.
 *
 * On mount, calls the matching backend webhook so iiko picks up the order
 * (success) or restores the cart (failed). Then either bounces to /order/:id
 * or shows a retry CTA.
 */
export default function PaymentReturnScreen({ outcome }: { outcome: 'success' | 'failed' }) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const success = useNotifyPaymentSuccess();
  const failed = useNotifyPaymentFailed();
  const [phase, setPhase] = useState<'pending' | 'done' | 'error'>('pending');

  useEffect(() => {
    if (!id) {
      setPhase('error');
      return;
    }
    const run = outcome === 'success' ? success.mutateAsync : failed.mutateAsync;
    run(id)
      .then(() => setPhase('done'))
      .catch(() => setPhase('error'));
    // run identity is stable per-mutation hook; we only want to fire once per id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, outcome]);

  useEffect(() => {
    if (outcome === 'success' && phase === 'done' && id) {
      const t = window.setTimeout(() => navigate(`/order/${id}`, { replace: true }), 1100);
      return () => window.clearTimeout(t);
    }
  }, [outcome, phase, id, navigate]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-paper p-6 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 240 }}
      >
        {phase === 'pending' ? (
          <Loader2 size={56} className="animate-spin text-wine" strokeWidth={1.6} />
        ) : outcome === 'success' ? (
          <CheckCircle2 size={56} className="text-success" strokeWidth={1.5} />
        ) : (
          <XCircle size={56} className="text-danger" strokeWidth={1.5} />
        )}
      </motion.div>

      <h1 className="mt-6 font-serif text-[28px] leading-tight text-ink-900">
        {phase === 'pending'
          ? 'обрабатываем платёж…'
          : outcome === 'success'
            ? 'оплата прошла'
            : 'оплата не прошла'}
      </h1>
      <p className="mt-2 max-w-xs text-[14px] text-ink-700">
        {outcome === 'success'
          ? 'передаём заказ в ресторан, через секунду откроем статус'
          : 'товары вернулись в корзину — попробуйте ещё раз'}
      </p>

      {phase !== 'pending' && (
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2">
          {outcome === 'success' && id ? (
            <Button variant="green" fullWidth onClick={() => navigate(`/order/${id}`, { replace: true })}>
              открыть заказ
            </Button>
          ) : (
            <Button variant="green" fullWidth onClick={() => navigate('/cart', { replace: true })}>
              вернуться в корзину
            </Button>
          )}
          <Button variant="secondary" fullWidth onClick={() => navigate('/', { replace: true })}>
            на главную
          </Button>
        </div>
      )}
    </div>
  );
}
