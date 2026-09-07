// scripts/check-links.mjs — verifica que todo href interno de dist/ apunte a una página generada.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (p.endsWith('.html')) yield p;
  }
}
const missing = new Set();
for await (const file of walk('dist')) {
  const html = await readFile(file, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    if (href.startsWith('/_astro/') || href === '/favicon.png' || href === '/robots.txt') continue;
    const target = href.endsWith('/') ? join('dist', href, 'index.html') : join('dist', href);
    try { await stat(target); } catch { missing.add(`${file} -> ${href}`); }
  }
}
if (missing.size) { console.error([...missing].join('\n')); process.exit(1); }
console.log('Todos los enlaces internos resuelven.');
