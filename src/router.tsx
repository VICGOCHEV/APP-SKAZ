import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, type Location } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import AddressesScreen from '@/screens/AddressesScreen';
import CartScreen from '@/screens/CartScreen';
import ChatScreen from '@/screens/ChatScreen';
import CheckoutScreen from '@/screens/CheckoutScreen';
import DesignSystemScreen from '@/screens/DesignSystemScreen';
import DishSheet from '@/screens/DishSheet';
import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import MenuScreen from '@/screens/MenuScreen';
import MocksInspectorScreen from '@/screens/MocksInspectorScreen';
import OrderHistoryScreen from '@/screens/OrderHistoryScreen';
import OrderStatusScreen from '@/screens/OrderStatusScreen';
import PaymentCardsScreen from '@/screens/PaymentCardsScreen';
import PaymentReturnScreen from '@/screens/PaymentReturnScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import PromosScreen from '@/screens/PromosScreen';
import StoryScreen from '@/screens/StoryScreen';

/**
 * Resets window scroll to top on route change, except when the change
 * involves a /dish/:id modal route (opening OR closing) — we preserve
 * the background screen's scroll position.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  const prevRef = useRef(pathname);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = pathname;
    if (prev === pathname) return;
    if (pathname.startsWith('/dish/') || prev.startsWith('/dish/')) return;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Wraps a screen with a subtle fade/slide on MOUNT only — no exit animation,
 * so route changes are instant and the tab-bar never appears broken.
 */
function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 0.8, 0.3, 1] }}
      className="flex-1"
    >
      {children}
    </motion.div>
  );
}

function MainRoutes({ location }: { location: Location }) {
  return (
    <Routes location={location}>
      <Route
        path="/"
        element={
          <AppShell>
            <AnimatedPage><HomeScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/menu"
        element={
          <AppShell>
            <AnimatedPage><MenuScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/menu/:cuisineId"
        element={
          <AppShell>
            <AnimatedPage><MenuScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/menu/:cuisineId/:categoryId"
        element={
          <AppShell>
            <AnimatedPage><MenuScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/cart"
        element={
          <AppShell>
            <AnimatedPage><CartScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/promos"
        element={
          <AppShell>
            <AnimatedPage><PromosScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/profile"
        element={
          <AppShell>
            <AnimatedPage><ProfileScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/profile/orders"
        element={
          <AppShell>
            <AnimatedPage><OrderHistoryScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/profile/addresses"
        element={
          <AppShell>
            <AnimatedPage><AddressesScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/profile/cards"
        element={
          <AppShell>
            <AnimatedPage><PaymentCardsScreen /></AnimatedPage>
          </AppShell>
        }
      />
      <Route
        path="/order/:id"
        element={
          <AppShell>
            <AnimatedPage><OrderStatusScreen /></AnimatedPage>
          </AppShell>
        }
      />
      {/* Fullscreen — no AppShell / no tab-bar */}
      <Route path="/checkout" element={<AnimatedPage><CheckoutScreen /></AnimatedPage>} />
      <Route
        path="/payments/:id/success"
        element={<AnimatedPage><PaymentReturnScreen outcome="success" /></AnimatedPage>}
      />
      <Route
        path="/payments/:id/failed"
        element={<AnimatedPage><PaymentReturnScreen outcome="failed" /></AnimatedPage>}
      />
      <Route path="/profile/chat" element={<AnimatedPage><ChatScreen /></AnimatedPage>} />
      <Route path="/login" element={<AnimatedPage><LoginScreen /></AnimatedPage>} />
      <Route path="/stories/:id" element={<StoryScreen />} />
      {/* Dev tools */}
      <Route path="/__design" element={<DesignSystemScreen />} />
      <Route path="/__mocks" element={<MocksInspectorScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function AppRouter() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location } | null;
  const backgroundLocation = state?.backgroundLocation;
  const onDishRoute = location.pathname.startsWith('/dish/');

  const mainLocation: Location =
    backgroundLocation ?? (onDishRoute ? { ...location, pathname: '/' } : location);

  return (
    <>
      <ScrollToTop />
      <MainRoutes location={mainLocation} />
      {onDishRoute && (
        <Routes>
          <Route path="/dish/:id" element={<DishSheet />} />
        </Routes>
      )}
    </>
  );
}
