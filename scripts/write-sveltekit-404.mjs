import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const base = (process.env.SITE_BASE_PATH ?? '').replace(/\/+$/, '');
const page = `<!doctype html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="This page does not exist. Browse the case studies or return home." />
    <title>Page not found | Infrastructure in practice</title>
    <style>
      :root { color-scheme: light; font-family: system-ui, sans-serif; color: #13202b; background: #f4f6f5; }
      * { box-sizing: border-box; }
      body { margin: 0; }
      main { max-width: 48rem; margin: 0 auto; padding: 12vh 6vw; }
      p { line-height: 1.6; }
      .eyebrow { color: #087f80; font: 700 .75rem/1 monospace; letter-spacing: .12em; }
      h1 { max-width: 10ch; margin: 1rem 0; font-size: clamp(3rem, 10vw, 6rem); letter-spacing: -.06em; line-height: .92; }
      .lead { max-width: 44rem; font-size: 1.1rem; }
      .actions { display: flex; flex-wrap: wrap; gap: .8rem; margin-top: 2rem; }
      a { display: inline-block; padding: .75rem 1rem; color: inherit; border: 1px solid #9aabb0; border-radius: .3rem; text-decoration: none; }
      .eyebrow { color: #006466; font: 700 .75rem/1 monospace; letter-spacing: .12em; }
      a:focus-visible { outline: 3px solid #087f80; outline-offset: 3px; }
      @media (prefers-color-scheme: dark) {
        :root { color-scheme: dark; color: #e8f0f2; background: #101922; }
        a { border-color: #526a75; }
        a:first-child { color: #101922; border-color: #9bd1d0; background: #9bd1d0; }
      }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">404</p>
      <h1>This page is not here</h1>
      <p class="lead">The address may be mistyped, or the page may have moved. Every study is listed in the catalogue.</p>
      <div class="actions"><a href="${base}/cases/">Browse case studies</a><a href="${base}/">Return home</a></div>
    </main>
  </body>
</html>
`;

const target = resolve('dist/404.html');
await mkdir(dirname(target), { recursive: true });
await writeFile(target, page);
console.log(`Wrote ${target}`);
