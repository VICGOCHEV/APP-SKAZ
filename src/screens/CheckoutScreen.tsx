import { useNavigate } from 'react-router-dom';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function CheckoutScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      <ScreenHeader variant="back" title="оформление" onBack={() => navigate(-1)} />
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div>
          <p className="text-[13px] text-ink-500">
            форма доставки/самовывоза, адреса,
            <br />
            время, оплата и комментарий — Фаза 7
          </p>
        </div>
      </div>
    </div>
  );
}
