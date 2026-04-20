import { useNavigate, useParams } from 'react-router-dom';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function OrderStatusScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <div className="flex flex-col">
      <ScreenHeader variant="back" title={`заказ №${id}`} onBack={() => navigate('/')} />
      <div className="p-6 text-center text-[13px] text-ink-500">
        прогресс заказа с анимированными шагами — Фаза 7
      </div>
    </div>
  );
}
