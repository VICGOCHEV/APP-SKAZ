import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      // Split heavy third-party deps off the main bundle so first paint
      // doesn't carry framer-motion (~80KB) or the full icon set.
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'motion': ['framer-motion'],
            'icons': ['lucide-react'],
            'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'data': ['@tanstack/react-query', 'axios'],
          },
        },
      },
      // Honest threshold — main bundle should stay under this.
      chunkSizeWarningLimit: 350,
    },
    server: {
      port: 5173,
      host: true,
      proxy: proxyTarget
        ? {
            '/api/v1': {
              target: proxyTarget,
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
  };
});
