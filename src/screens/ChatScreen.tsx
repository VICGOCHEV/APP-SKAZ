import { useNavigate } from 'react-router-dom';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function ChatScreen() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      <ScreenHeader
        variant="back"
        title="книга отзывов"
        subtitle="ИИ-ассистент"
        onBack={() => navigate('/profile')}
      />
      <div className="flex flex-1 items-center justify-center p-6 text-center text-[13px] text-ink-500">
        переписка, quick-replies, endpoint — Фаза 8
      </div>
    </div>
  );
}
