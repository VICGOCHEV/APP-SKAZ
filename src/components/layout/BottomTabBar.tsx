import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Home, Percent, ShoppingBag, User } from 'lucide-react';
import TabBar, { type TabBarItem } from '@/components/ui/TabBar';
import { useCartCount } from '@/hooks/useCart';

type TabKey = 'menu' | 'home' | 'promos' | 'cart' | 'profile';

const tabs: { key: TabKey; label: string; path: string; icon: TabBarItem['icon'] }[] = [
  { key: 'menu', label: 'меню', path: '/menu', icon: <BookOpen size={22} strokeWidth={1.6} /> },
  { key: 'home', label: 'главная', path: '/', icon: <Home size={22} strokeWidth={1.6} /> },
  { key: 'promos', label: 'акции', path: '/promos', icon: <Percent size={22} strokeWidth={1.6} /> },
  { key: 'cart', label: 'корзина', path: '/cart', icon: <ShoppingBag size={22} strokeWidth={1.6} /> },
  { key: 'profile', label: 'профиль', path: '/profile', icon: <User size={22} strokeWidth={1.6} /> },
];

function resolveActiveKey(pathname: string): TabKey {
  if (pathname === '/' || pathname.startsWith('/stories')) return 'home';
  if (pathname.startsWith('/menu')) return 'menu';
  if (pathname.startsWith('/promos')) return 'promos';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/profile') || pathname.startsWith('/order') || pathname.startsWith('/checkout')) {
    return 'profile';
  }
  return 'home';
}

export default function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartCount();
  const activeKey = resolveActiveKey(location.pathname);

  const items: TabBarItem[] = tabs.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    badge: t.key === 'cart' ? cartCount : undefined,
  }));

  return (
    <TabBar
      items={items}
      activeKey={activeKey}
      onSelect={(key) => {
        const tab = tabs.find((t) => t.key === key);
        if (tab) navigate(tab.path);
      }}
    />
  );
}
