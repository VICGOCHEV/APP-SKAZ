/**
 * Lightweight analytics & error-tracking façade.
 *
 * Both backends are gated by env vars and silently no-op when those
 * aren't set, so the same build works in dev (no telemetry) and prod
 * (full tracking) without code changes.
 *
 *   VITE_SENTRY_DSN     — optional, enables Sentry error capture
 *   VITE_YM_COUNTER_ID  — optional, enables Yandex.Metrika
 *
 * For Sentry we also forward `release` (git SHA via VITE_RELEASE) and
 * `environment` (Vite mode) so events are filterable in the dashboard.
 */
import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const YM_ID = import.meta.env.VITE_YM_COUNTER_ID as string | undefined;
const RELEASE = (import.meta.env.VITE_RELEASE as string | undefined) ?? 'local';
const MODE = import.meta.env.MODE;

let metrikaReady = false;

declare global {
  interface Window {
    ym?: (id: number | string, method: string, ...args: unknown[]) => void;
  }
}

/** Initialize Sentry when a DSN is configured. Idempotent. */
function initSentry() {
  if (!SENTRY_DSN) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE,
    environment: MODE,
    // Modest defaults — restaurant ordering app, not a high-traffic SaaS.
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0.5,
    integrations: [Sentry.browserTracingIntegration()],
  });
}

/**
 * Inject the Yandex.Metrika counter when a counter ID is configured.
 * Doing it here rather than in index.html lets us gate on env without
 * polluting the static HTML for dev builds.
 */
function initMetrika() {
  if (!YM_ID) return;
  if (metrikaReady) return;

  // Standard YM bootstrap, adapted to TypeScript.
  type YmStub = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
  const w = window as Window & { ym?: YmStub };
  const stub: YmStub =
    w.ym ??
    ((...args: unknown[]) => {
      (stub.a = stub.a ?? []).push(args);
    });
  stub.l = Date.now();
  w.ym = stub;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);

  window.ym?.(YM_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
    defer: true,
  });

  metrikaReady = true;
}

export function initTelemetry() {
  initSentry();
  initMetrika();
}

/* ================================
 * Event helpers
 * ================================ */

export function trackPageView(path: string) {
  if (YM_ID && metrikaReady) {
    window.ym?.(YM_ID, 'hit', path);
  }
}

/**
 * Custom event — currently sent to Metrika as a `reachGoal`. Goal IDs
 * should match what's configured in the YM admin (we use the event name
 * as the goal id; create matching goals in YM to see them in funnels).
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (YM_ID && metrikaReady) {
    window.ym?.(YM_ID, 'reachGoal', name, params);
  }
  // Sentry breadcrumbs make events visible in error context.
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({ category: 'event', message: name, data: params, level: 'info' });
  }
}

/** Tag the current Sentry session with the user. */
export function identifyUser(user: { id: string; email?: string; phone?: string } | null) {
  if (!SENTRY_DSN) return;
  if (!user) {
    Sentry.setUser(null);
    return;
  }
  Sentry.setUser({ id: user.id, email: user.email, username: user.phone });
}

/** Manually report a non-fatal error. */
export function reportError(err: unknown, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) {
    if (MODE !== 'production') console.warn('[reportError]', err, context);
    return;
  }
  Sentry.captureException(err, { extra: context });
}
