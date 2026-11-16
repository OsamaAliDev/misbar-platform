import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for مِسبار (Misbar).
 *
 * - The dev server listens on 0.0.0.0:3000 so the Manus Preview proxy can reach it.
 * - `allowedHosts: true` lets the proxied Preview host through Vite's host check.
 * - Navigation is hash-based (see src/state/navigation.jsx), so the static build
 *   works on any static host without SPA rewrites.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    proxy: { '/api/saas': { target: 'http://127.0.0.1:3002', changeOrigin: false } },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
});
