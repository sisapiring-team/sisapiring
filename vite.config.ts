import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const hmrDisabled = process.env.DISABLE_HMR === 'true';

  return {
    plugins: [
      laravel({
        input: ['resources/js/app.tsx', 'src/main.tsx'],
        refresh: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'resources/js'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      hmr: hmrDisabled ? false : undefined,
      watch: hmrDisabled ? null : {},
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_TARGET || 'https://sisapiring.ddev.site',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
