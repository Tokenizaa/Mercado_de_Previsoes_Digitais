import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import workerHandler from './worker/src/index';

function cloudflareWorkerDevPlugin(): Plugin {
  return {
    name: 'cloudflare-worker-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api')) {
          return next();
        }

        try {
          const origin = `http://${req.headers.host || 'localhost:3000'}`;
          const fullUrl = new URL(req.url, origin).toString();

          let body: string | undefined = undefined;
          if (req.method && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            body = Buffer.concat(chunks).toString('utf-8');
          }

          const webHeaders = new Headers();
          for (const [key, val] of Object.entries(req.headers)) {
            if (val) {
              if (Array.isArray(val)) {
                val.forEach((v) => webHeaders.append(key, v));
              } else {
                webHeaders.set(key, val);
              }
            }
          }

          const webRequest = new Request(fullUrl, {
            method: req.method,
            headers: webHeaders,
            body: body ? body : undefined,
          });

          const workerEnv = {
            ENVIRONMENT: 'development',
            SUPABASE_URL: process.env.SUPABASE_URL || 'https://qyjoegombkgkgbvcjvhu.supabase.co',
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
          };

          const workerResponse = await workerHandler.fetch(webRequest, workerEnv, {});

          res.statusCode = workerResponse.status;
          workerResponse.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });

          const resBuffer = await workerResponse.arrayBuffer();
          res.end(Buffer.from(resBuffer));
        } catch (err: any) {
          console.error('[Worker Dev Middleware Error]', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Erro no Worker', details: err.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), cloudflareWorkerDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
