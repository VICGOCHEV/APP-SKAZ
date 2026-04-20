import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function PaymentCardsScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      <ScreenHeader variant="back" title="платёжные карты" onBack={() => navigate('/profile')} />
      <div className="p-4">
        <EmptyState
          icon={<CreditCard size={24} strokeWidth={1.6} />}
          title="нет карт"
          description="привяжите карту при оформлении первого заказа"
        />
        <p className="mt-6 text-center text-[11px] text-ink-500">привязка карты — Фаза 8</p>
      </div>
    </div>
  );
}
