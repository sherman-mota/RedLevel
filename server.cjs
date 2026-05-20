/**
 * server.cjs — Servidor proxy para o RedLevel
 *
 * Resolve o problema de CORS ao fazer proxy das requisições para o Redmine.
 * - Serve o app estático de /dist em produção
 * - Redireciona /redmine-proxy/<encoded-redmine-url>/<path> → Redmine real
 *
 * URL format:
 *   /redmine-proxy/https%3A%2F%2Fredmine.acme.com/users/current.json
 *   → proxy para → https://redmine.acme.com/users/current.json
 *
 * Uso:
 *   node server.cjs
 *   PORT=8080 node server.cjs
 */

const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 4173;

// Captura erros Node não tratados (facilita debug)
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT]', err.message, err.stack);
});


// ─── OPTIONS preflight ───────────────────────────────────────────────────────
app.options('/redmine-proxy/*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Redmine-API-Key');
  res.status(204).end();
});

// ─── Proxy de Redmine ────────────────────────────────────────────────────────
// Path: /redmine-proxy/<encodeURIComponent(redmineBaseUrl)>/<api-path>
// Ex:   /redmine-proxy/https%3A%2F%2Fredmine.example.com/users/current.json
app.use('/redmine-proxy', (req, res) => {
  // Extrai a URL do Redmine do primeiro segmento do path
  // req.url aqui é tudo após /redmine-proxy, ex: /https%3A%2F%2F.../users/current.json
  const match = req.url.match(/^\/([^/?]+)(\/.*)?$/);
  if (!match) {
    return res.status(400).json({ error: 'Formato de URL inválido. Use /redmine-proxy/<encoded-url>/path' });
  }

  let parsedTarget;
  try {
    parsedTarget = new URL(decodeURIComponent(match[1]));
  } catch {
    return res.status(400).json({ error: 'URL do Redmine inválida (falha ao decodificar).' });
  }

  const apiPath = match[2] || '/';
  const fullUrl = `${parsedTarget.origin}${apiPath}`;

  // Preserva query string
  const queryString = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  const finalUrl = fullUrl + (queryString && !apiPath.includes('?') ? queryString : '');

  let targetUrl;
  try {
    targetUrl = new URL(finalUrl);
  } catch {
    return res.status(400).json({ error: 'URL alvo inválida: ' + finalUrl });
  }

  const isHttps = targetUrl.protocol === 'https:';
  const transport = isHttps ? https : http;

  // Copia apenas os headers relevantes
  const proxyHeaders = {
    'Accept': 'application/json',
  };
  if (req.headers['x-redmine-api-key']) {
    proxyHeaders['X-Redmine-API-Key'] = req.headers['x-redmine-api-key'];
  }
  if (req.headers['content-type']) {
    proxyHeaders['Content-Type'] = req.headers['content-type'];
  }

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (isHttps ? 443 : 80),
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: proxyHeaders,
    rejectUnauthorized: false, // permite certs auto-assinados (Redmine on-prem)
  };

  console.log(`[PROXY] ${req.method} ${targetUrl.href}`);

  let responded = false;

  const proxyReq = transport.request(options, (proxyRes) => {
    if (responded) return;
    responded = true;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Redmine-API-Key');
    const ct = proxyRes.headers['content-type'];
    if (ct) res.setHeader('Content-Type', ct);
    res.status(proxyRes.statusCode || 200);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[PROXY] Erro ao conectar ao Redmine:', err.message);
    if (!responded) {
      responded = true;
      res.status(502).json({ error: 'Falha ao conectar ao Redmine: ' + err.message });
    }
  });

  // Para GET/HEAD não há body — finaliza imediatamente
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') {
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
});

// ─── Serve o app estático ────────────────────────────────────────────────────
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 RedLevel rodando em http://localhost:${PORT}`);
  console.log(`🔄 Proxy Redmine ativo em http://localhost:${PORT}/redmine-proxy`);
  console.log(`\nPressione Ctrl+C para parar.\n`);
});
