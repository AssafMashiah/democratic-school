// Smoke: routes, assets, internal links, nav consistency, and CSS
// regressions (mobile headings, FAQ details, removed dead styles, contrast).
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { ROOT, read, readJson, contrast } from './helpers.mjs';

const PAGES = ['index.html', 'registration.html', 'new-parents.html', 'parents.html', 'contact.html'];
const CONTENT = ['school.json', 'philosophy.json', 'links.json', 'registration.json', 'parents.json', 'faq.json'];
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain' };

const localRefs = (html) => [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((u) => !/^(https?:|mailto:|tel:|#)/.test(u));

test('routes, assets and internal links resolve over HTTP', async (t) => {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || rel.startsWith('functions/') || !existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}/`;

  const urls = new Set(['', 'robots.txt', ...PAGES, ...CONTENT.map((c) => 'content/' + c)]);
  for (const p of PAGES) for (const ref of localRefs(read(p))) urls.add(ref);
  for (const u of urls) {
    const r = await fetch(base + u);
    assert.equal(r.status, 200, `GET /${u}`);
    if (u.endsWith('.json')) await r.json(); // must parse
    else await r.arrayBuffer();
  }
});

test('every page has the same 5-link primary nav with exactly one aria-current', () => {
  for (const p of PAGES) {
    const nav = read(p).match(/<nav class="site-nav"[^>]*>([\s\S]*?)<\/nav>/)[1];
    const hrefs = [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(hrefs, PAGES, p);
    const current = [...nav.matchAll(/<a href="([^"]+)" aria-current="page">/g)].map((m) => m[1]);
    assert.deepEqual(current, [p], p);
  }
});

test('parents editor workflow is public (no data-assaf-only gating)', () => {
  const html = read('parents.html');
  assert.doesNotMatch(html, /data-assaf-only/);
  assert.match(html, /Public by design/);
});

test('parents.json conforms to the schema-required message fields', () => {
  const schema = readJson('content/parents.schema.json');
  const req = schema.properties.messages.items.required;
  for (const m of readJson('content/parents.json').messages) for (const k of req) assert.ok(k in m, k);
});

const css = read('assets/styles.css');
const token = (name) => css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`))[1];
const rule = (selector) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp(`(?:^|[},\\s])${esc}\\s*[,{][^{]*\\{([^}]*)\\}`, 'm'));
  return m && m[1];
};

test('white-space: nowrap is restricted to the visually-hidden utility', () => {
  const hits = [...css.matchAll(/([^{}]+)\{[^}]*white-space:\s*nowrap/g)].map((m) => m[1]);
  assert.equal(hits.length, 1);
  assert.match(hits[0], /\.visually-hidden\s*$/);
});

test('≤480px media query scales site title and headings', () => {
  const block = css.match(/@media \(max-width: 480px\) \{([\s\S]*?)\n\}/);
  assert.ok(block, 'missing ≤480px block');
  assert.match(block[1], /\.site-title \{ font-size: var\(--fs-400\); \}/);
  assert.match(block[1], /\.hero h1,\s*main > h1 \{ font-size: clamp\(/);
  assert.match(css, /\.hero h1\s*\{[\s\S]*?overflow-wrap: break-word/);
  assert.match(css, /\.site-title\s*\{[\s\S]*?min-width: 0/);
});

test('native details FAQ cards are styled with a visible focus treatment', () => {
  for (const sel of ['.faq', '.faq__item', '.faq__q', '.faq__a', '.faq__source']) assert.ok(css.includes(sel), sel);
  assert.match(css, /\.faq__q:focus-visible[^{]*\{[^}]*outline: 3px solid var\(--c-focus-ring\)/);
  assert.match(css, /\.faq__q,[^{]*\{[^}]*min-height: 44px/);
  // Focus ring must reach ≥3:1 against the focused summary background.
  assert.ok(contrast(token('c-focus-ring'), token('c-accent-soft')) >= 3);
});

test('dead FAB/panel/brand-dot styles are removed', () => {
  for (const s of ['.ai-chat-fab', '.ai-chat-panel', '.ai-chat-pill-dormant', '.brand-dot']) {
    assert.ok(!css.includes(s), s);
  }
});

test('primary button text meets 4.5:1 in default and hover states', () => {
  const hover = css.match(/\.btn--primary:hover,[\s\S]*?\.btn--primary:focus-visible\s*\{([\s\S]*?)\}/)[1];
  const bg = hover.match(/background: var\(--([\w-]+)\)/)[1];
  const fg = hover.match(/color: var\(--([\w-]+)\)/)[1];
  assert.ok(contrast(token(fg), token(bg)) >= 4.5, `hover ${contrast(token(fg), token(bg)).toFixed(2)}`);
  assert.ok(contrast('#FFFFFF', token('c-joy')) >= 4.5, 'default');
});
