// Genera dist/sitemap.xml en build: rutas estáticas + un <url> por producto activo.
// Tolerante a fallos: si la API no responde, igual escribe las rutas estáticas.
import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = (process.env.VITE_SITE_URL || 'https://nmrc-storefront.vercel.app').replace(/\/$/, '');
const API_URL = (process.env.VITE_API_URL || 'https://nmrc-api.onrender.com/api').replace(/\/$/, '');

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/shop', priority: '0.9', changefreq: 'daily' },
  { path: '/collections', priority: '0.7', changefreq: 'weekly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/envios', priority: '0.3', changefreq: 'yearly' },
  { path: '/privacidad', priority: '0.3', changefreq: 'yearly' },
  { path: '/terminos', priority: '0.3', changefreq: 'yearly' },
];

const esc = (s) =>
  String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

function urlEntry({ loc, priority, changefreq, lastmod }) {
  return [
    '  <url>',
    `    <loc>${esc(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

// El free tier de Render "duerme" y tarda ~50s en despertar; damos margen suficiente.
const TIMEOUT_MS = Number(process.env.SITEMAP_TIMEOUT_MS || 60000);

async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`[sitemap] No se pudo obtener productos (${err.message}); solo rutas estáticas.`);
    return [];
  }
}

async function main() {
  const products = await fetchProducts();

  const entries = STATIC_ROUTES.map((r) =>
    urlEntry({ loc: `${SITE_URL}${r.path}`, priority: r.priority, changefreq: r.changefreq }),
  );

  for (const p of products) {
    if (!p?.slug) continue;
    const lastmod = (p.updatedAt || p.createdAt || '').slice(0, 10) || undefined;
    entries.push(
      urlEntry({ loc: `${SITE_URL}/product/${p.slug}`, priority: '0.8', changefreq: 'weekly', lastmod }),
    );
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries.join('\n') +
    '\n</urlset>\n';

  const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
  await writeFile(join(distDir, 'sitemap.xml'), xml, 'utf8');
  console.log(`[sitemap] Escrito dist/sitemap.xml con ${entries.length} URLs (${products.length} productos).`);
}

main().catch((err) => {
  console.warn(`[sitemap] Generación omitida: ${err.message}`);
});
