import { useNavigate } from 'react-router-dom';
import ScreenHeader from '@/components/ui/ScreenHeader';
import EmptyState from '@/components/ui/EmptyState';
import { Clock } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import { useOrderHistory } from '@/hooks/queries/useOrders';

export default function OrderHistoryScreen() {
  const navigate = useNavigate();
  const { data, isPending } = useOrderHistory();

  return (
    <div className="flex flex-col">
      <ScreenHeader
        variant="back"
        title="история заказов"
        onBack={() => navigate('/profile')}
      />
      <div className="p-4">
        {isPending ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="flex flex-col gap-2">
            {data.map((o) => (
              <button
                key={o.id}
                onClick={() => navigate(`/order/${o.id}`)}
                className="flex items-center justify-between rounded-md border border-ink-100 bg-white px-4 py-3 text-left"
              >
                <div>
                  <div className="font-serif text-[16px] text-ink-900">заказ №{o.id}</div>
                  <div className="text-[12px] text-ink-500">
                    {o.items.length} позиций · {o.status}
                  </div>
                </div>
                <span className="font-serif text-[18px] text-wine">{o.total} ₽</span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Clock size={24} strokeWidth={1.6} />}
            title="ещё нет заказов"
            description="оформите первый — он появится здесь"
          />
        )}
      </div>
    </div>
  );
}
