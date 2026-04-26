import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import * as Sentry from '@sentry/react';
import App from '@/App';
import { queryClient } from '@/lib/queryClient';
import { initTelemetry } from '@/lib/analytics';
import '@/index.css';

initTelemetry();

function FallbackError() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-paper p-6 text-center">
      <h1 className="font-serif text-[26px] text-ink-900">что-то пошло не так</h1>
      <p className="max-w-xs text-[14px] text-ink-700">
        перезагрузите страницу — мы уже знаем о проблеме и чиним её
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 rounded-full bg-wine px-5 py-2.5 text-[14px] font-semibold text-cream hover:bg-burgundy"
      >
        перезагрузить
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<FallbackError />}>
      <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 0.8, 0.3, 1] }}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </MotionConfig>
    </Sentry.ErrorBoundary>
  </StrictMode>,
);
