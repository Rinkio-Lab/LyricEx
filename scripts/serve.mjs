/* LyricEx minimal static server (Node built-ins only) — used by Playwright
   webServer and local联调 (python -m http.server 的跨平台替代, zero deps).
   Usage: node scripts/serve.mjs [port]  (default 8090, binds 127.0.0.1) */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = normalize(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.argv[2] || 8090);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.zip': 'application/zip',
    '.txt': 'text/plain; charset=utf-8'
};

http.createServer(async (req, res) => {
    try {
        let path = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
        if (path.endsWith('/')) path += 'index.html';
        const file = normalize(join(root, path));
        // path-traversal guard: served files must stay under the project root
        if (!file.startsWith(root)) { res.writeHead(403); res.end('forbidden'); return; }
        const body = await readFile(file);
        res.writeHead(200, {
            'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store' // E2E must never see stale resources
        });
        res.end(body);
    } catch (_) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('not found');
    }
}).listen(port, '127.0.0.1', () => console.log('LyricEx static server: http://127.0.0.1:' + port));
