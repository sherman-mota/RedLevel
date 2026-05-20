import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

/**
 * Proxy helper: extrai a URL do Redmine do primeiro segmento do path.
 *
 * Path esperado: /redmine-proxy/<encodeURIComponent(redmineBaseUrl)>/rest/of/path
 * Exemplo:       /redmine-proxy/https%3A%2F%2Fredmine.acme.com/users/current.json
 *                → target: https://redmine.acme.com
 *                → rewrite: /users/current.json
 */
function extractRedmineTarget(reqUrl: string): string | null {
  // O router recebe a URL COMPLETA: /redmine-proxy/<encoded-url>/rest/of/path
  // Precisamos pular o prefixo /redmine-proxy/ antes de extrair a URL codificada.
  const match = reqUrl?.match(/^\/redmine-proxy\/([^/?]+)/);
  if (!match?.[1]) return null;
  try {
    const u = new URL(decodeURIComponent(match[1]));
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

const proxyConfig = {
  // Alvo padrão sobrescrito pelo router abaixo
  target: 'http://localhost',
  changeOrigin: true,
  secure: false,
  // Router dinâmico: lê a URL do Redmine do path
  router(req: { url?: string }) {
    const target = extractRedmineTarget(req.url ?? '');
    return target ?? 'http://localhost';
  },
  // Rewrite: remove o prefixo /redmine-proxy/<encoded-url>
  rewrite(p: string) {
    // /redmine-proxy/https%3A%2F...%2Fcom/users/current.json → /users/current.json
    const match = p.match(/^\/redmine-proxy\/[^/]+(\/.*)?$/);
    return match?.[1] ?? '/';
  },
  configure(proxy: any) {
    proxy.on('error', (err: Error) => {
      console.error('[Proxy Redmine] Erro:', err.message);
    });
    proxy.on('proxyReq', (proxyReq: any, req: any) => {
      // Remove headers internos antes de enviar ao Redmine
      proxyReq.removeHeader('x-redmine-target');
    });
  },
};

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/redmine-proxy': proxyConfig,
      },
    },
    preview: {
      proxy: {
        '/redmine-proxy': proxyConfig,
      },
    },
  };
});
