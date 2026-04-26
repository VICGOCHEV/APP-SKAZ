import { lazy, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, type Location } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import HomeScreen from '@/screens/HomeScreen';

// Lazy-load every non-critical route. HomeScreen + AppShell stay eager so
// the first paint doesn't wait on extra round-trips. Each lazy() call gets
// its own chunk; Vite chooses filenames automatically.
const AddressesScreen = lazy(() => import('@/screens/AddressesScreen'));
const CartScreen = lazy(() => import('@/screens/CartScreen'));
const ChatScreen = lazy(() => import('@/screens/ChatScreen'));
const CheckoutScreen = lazy(() => import('@/screens/CheckoutScreen'));
const DesignSystemScreen = lazy(() => import('@/screens/DesignSystemScreen'));
const DishSheet = lazy(() => import('@/screens/DishSheet'));
const LoginScreen = lazy(() => import('@/screens/LoginScreen'));
const MenuScreen = lazy(() => import('@/screens/MenuScreen'));
const MocksInspectorScreen = lazy(() => import('@/screens/MocksInspectorScreen'));
const OrderHistoryScreen = lazy(() => import('@/screens/OrderHistoryScreen'));
const OrderStatusScreen = lazy(() => import('@/screens/OrderStatusScreen'));
const PaymentCardsScreen = lazy(() => import('@/screens/PaymentCardsScreen'));
const PaymentReturnScreen = lazy(() => import('@/screens/PaymentReturnScreen'));
const ProfileScreen = lazy(() => import('@/screens/ProfileScreen'));
const PromosScreen = lazy(() => import('@/screens/PromosScreen'));
const StoryScreen = lazy(() => import('@/screens/StoryScreen'));

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
function AnimatedPage({ children }: { children: ReactNode }) {
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

/**
 * Skeleton-ish placeholder shown while a lazy chunk loads. Intentionally
 * empty — route chunks are small enough that a spinner would only flash.
 */
function RouteFallback() {
  return <div className="flex-1 bg-paper" />;
}

function MainRoutes({ location }: { location: Location }) {
  return (
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
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
        <Suspense fallback={null}>
          <Routes>
            <Route path="/dish/:id" element={<DishSheet />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
}
