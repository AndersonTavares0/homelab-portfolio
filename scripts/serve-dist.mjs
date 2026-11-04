// Minimal static server for the built site, used by Playwright.
// Avoids the single-instance lock of `astro preview`, so tests never fight a manual preview.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('dist');
const port = Number(process.argv[2] ?? 4327);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

async function fileFor(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, clean);
  if (!file.startsWith(root)) return null;
  const info = await stat(file).catch(() => null);
  if (info?.isDirectory()) file = join(file, 'index.html');
  const exists = await stat(file).catch(() => null);
  return exists?.isFile() ? file : null;
}

createServer(async (request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const file = await fileFor(url.pathname);
  if (!file) {
    const notFound = await readFile(join(root, '404.html')).catch(() => null);
    response.writeHead(404, { 'content-type': types['.html'] });
    response.end(notFound ?? 'Not found');
    return;
  }
  const body = await readFile(file);
  response.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  response.end(body);
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving dist on http://127.0.0.1:${port}`);
});
