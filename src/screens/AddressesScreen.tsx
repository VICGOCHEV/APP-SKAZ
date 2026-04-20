import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function AddressesScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      <ScreenHeader variant="back" title="адреса доставки" onBack={() => navigate('/profile')} />
      <div className="p-4">
        <EmptyState
          icon={<MapPin size={24} strokeWidth={1.6} />}
          title="нет адресов"
          description="добавьте адрес при первом заказе"
        />
        <p className="mt-6 text-center text-[11px] text-ink-500">CRUD адресов — Фаза 8</p>
      </div>
    </div>
  );
}
