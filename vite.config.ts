import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * Fallback middleware to serve index.html when accessing Vite directly
 * (e.g. http://localhost:5173/) in standalone frontend mode without Laravel backend.
 */
const spaFallbackPlugin = (): Plugin => ({
  name: 'spa-fallback',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.method === 'GET' && req.headers.accept?.includes('text/html')) {
        const url = req.url?.split('?')[0] || '';
        if (!url.startsWith('/@') && !url.startsWith('/node_modules') && !url.includes('.')) {
          try {
            const indexPath = path.resolve(import.meta.dirname, 'index.html');
            if (fs.existsSync(indexPath)) {
              let html = fs.readFileSync(indexPath, 'utf-8');
              html = await server.transformIndexHtml(req.url || '/', html);
              res.setHeader('Content-Type', 'text/html');
              res.statusCode = 200;
              res.end(html);
              return;
            }
          } catch (e) {
            next(e);
            return;
          }
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
      spaFallbackPlugin(),
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
      strictPort: false,
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
        '/assets/images': {
          target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
