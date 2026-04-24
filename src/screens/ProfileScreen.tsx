import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CreditCard,
  History,
  LogOut,
  MapPin,
  MessageCircle,
  Sparkles,
  User,
} from 'lucide-react';
import GroupedList from '@/components/ui/GroupedList';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className="flex flex-col">
        <ScreenHeader variant="large" title="профиль" />
        <div className="p-6 text-center">
          <p className="mb-4 text-[13px] text-ink-500">
            чтобы увидеть историю заказов и адреса — войдите
          </p>
          <button
            onClick={() => navigate('/login', { state: { from: '/profile' } })}
            className="rounded-full bg-forest px-6 py-3 text-[14px] font-semibold text-cream hover:bg-pine"
          >
            войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <ScreenHeader
        variant="large"
        title={user.name ?? 'профиль'}
        subtitle={user.email ?? user.phone ?? undefined}
      />
      <div className="flex flex-col gap-4 px-4">
        <GroupedList
          title="контакт"
          items={[
            {
              id: 'contact',
              icon: <User size={18} strokeWidth={1.6} />,
              label: user.phone ?? user.email ?? 'не указан',
              description: 'изменить',
            },
          ]}
        />
        <GroupedList
          title="заказы и доставка"
          items={[
            {
              id: 'orders',
              icon: <History size={18} strokeWidth={1.6} />,
              label: 'история заказов',
              onClick: () => navigate('/profile/orders'),
            },
            {
              id: 'addresses',
              icon: <MapPin size={18} strokeWidth={1.6} />,
              label: 'адреса доставки',
              onClick: () => navigate('/profile/addresses'),
            },
            {
              id: 'cards',
              icon: <CreditCard size={18} strokeWidth={1.6} />,
              label: 'платёжные карты',
              onClick: () => navigate('/profile/cards'),
            },
          ]}
        />
        <GroupedList
          title="дополнительно"
          items={[
            {
              id: 'bonuses',
              icon: <Sparkles size={18} strokeWidth={1.6} />,
              label: 'бонусы',
              description: `${user.bonusPoints} баллов`,
            },
            {
              id: 'chat',
              icon: <MessageCircle size={18} strokeWidth={1.6} />,
              label: 'книга отзывов',
              onClick: () => navigate('/profile/chat'),
            },
            {
              id: 'notifications',
              icon: <Bell size={18} strokeWidth={1.6} />,
              label: 'уведомления',
            },
            {
              id: 'logout',
              icon: <LogOut size={18} strokeWidth={1.6} />,
              label: 'выйти',
              danger: true,
              onClick: () => {
                void logout();
                navigate('/');
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
