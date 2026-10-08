// Minimal test helpers — no dependencies. A tiny fake DOM sufficient for
// assets/content.js (createElement / textContent / appendChild only).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const read = (rel) => readFileSync(path.join(ROOT, rel), 'utf8');
export const readJson = (rel) => JSON.parse(read(rel));

class FakeEl {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.className = '';
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this._text = '';
  }
  get firstChild() { return this.children[0] || null; }
  appendChild(c) { this.children.push(c); return c; }
  removeChild(c) { this.children = this.children.filter((x) => x !== c); return c; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; }
  set textContent(v) { this.children = []; this._text = String(v); }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  // Depth-first search by class name.
  findAll(cls, out = []) {
    for (const c of this.children) {
      if (c.className.split(' ').includes(cls)) out.push(c);
      c.findAll(cls, out);
    }
    return out;
  }
}

// Failure modes for renderPage `files` overrides: pass one as a file's value.
export const FAIL = {
  network: () => { throw new TypeError('Failed to fetch'); },
  status: () => ({ ok: false, status: 500, json: async () => ({}) }),
  malformed: () => ({ ok: true, json: async () => { throw new SyntaxError('Unexpected token'); } }),
};

// Runs assets/content.js for `page` against a fake DOM. `files` overrides
// content/*.json by name (a function value is a FAIL mode); everything else
// is read from the repo. `initial` seeds element text (e.g. 'טוען…').
// Logged errors throw unless `expectErrors` is set.
export async function renderPage(page, ids, files = {}, { initial = {}, expectErrors = false } = {}) {
  const els = Object.fromEntries(ids.map((id) => [id, new FakeEl('div')]));
  for (const [id, txt] of Object.entries(initial)) els[id].textContent = txt;
  let onReady;
  const document = {
    currentScript: null,
    querySelector: (sel) => (sel === 'main[data-page]' ? { dataset: { page } } : null),
    getElementById: (id) => els[id] || null,
    createElement: (t) => new FakeEl(t),
    addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') onReady = fn; },
  };
  const fetch = async (url) => {
    const name = url.replace('./content/', '');
    if (typeof files[name] === 'function') return files[name]();
    const body = name in files ? files[name] : readJson('content/' + name);
    return { ok: true, json: async () => body };
  };
  const errors = [];
  const console = { error: (e) => errors.push(e) };
  vm.runInNewContext(read('assets/content.js'), { document, fetch, console });
  onReady();
  await new Promise((r) => setTimeout(r, 10));
  if (errors.length && !expectErrors) throw errors[0];
  return els;
}

// Loads assets/ai-chat.js with stubbed custom-element globals; returns the class.
export function loadAiChat() {
  let Klass;
  const ctx = {
    HTMLElement: class {},
    customElements: { define: (_n, k) => { Klass = k; } },
    fetch: () => { throw new Error('unexpected real fetch'); },
  };
  vm.runInNewContext(read('assets/ai-chat.js'), ctx);
  return { AiChat: Klass, ctx };
}

// WCAG 2.x contrast ratio for two #RRGGBB colors.
export function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
