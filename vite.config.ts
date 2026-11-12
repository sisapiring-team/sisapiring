import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

const redirectRootPlugin = (): Plugin => ({
  name: 'redirect-root-to-laravel',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        const accept = req.headers.accept || '';
        if (accept.includes('text/html')) {
          res.writeHead(302, { Location: 'http://localhost:8000' });
          res.end();
          return;
        }
      }
      next();
    });
  },
});

export default defineConfig(() => {
  const hmrDisabled = process.env.DISABLE_HMR === 'true';

  return {
    plugins: [
      redirectRootPlugin(),
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
      origin: 'http://localhost:5173',
      cors: {
        origin: true,
        credentials: true,
      },
      hmr: hmrDisabled ? false : { host: 'localhost' },
      watch: hmrDisabled ? null : {},
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
