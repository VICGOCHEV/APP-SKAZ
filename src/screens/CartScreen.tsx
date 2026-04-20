import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function CartScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      <ScreenHeader variant="large" title="корзина" subtitle="0 позиций · 0 ₽" />
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
        <p className="mt-6 text-center text-[11px] text-ink-500">
          позиции, промокод и «оформить заказ» — Фаза 7
        </p>
      </div>
    </div>
  );
}
