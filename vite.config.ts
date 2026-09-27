import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    // The vendored render engine keeps a large Python venv; watching it
    // exhausts the OS inotify limit and crashes the dev server (ENOSPC).
    watch: {
      ignored: ['**/MoneyPrinterTurbo/**'],
    },
    proxy: {
      '/api/analyze': {
        target: 'http://127.0.0.1:4174',
        changeOrigin: true,
      },
      '/api/outputs': {
        target: 'http://127.0.0.1:4174',
        changeOrigin: true,
      },
      '/api/media': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/api/render': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      // Local short-video render engine (MoneyPrinterTurbo), used by the Brainrot Feed.
      // The engine rejects browser requests whose Origin it does not allow, and the
      // dev proxy is what actually talks to it. Strip the browser Origin/Referer so
      // the engine treats the proxied call as a local client instead of a browser.
      '/mpt': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (url) => url.replace(/^\/mpt/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
          });
        },
      },
      '/legacy': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (url) => url.replace(/^\/legacy/, ''),
      },
      '/api/openai': {
        target: 'https://api.openai.com',
        changeOrigin: true,
        rewrite: (url) => url.replace(/^\/api\/openai/, ''),
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
    },
  },
});
