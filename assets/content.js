// Democratic School — content loader. Vanilla JS, no framework.
// All user-supplied strings set via textContent (no innerHTML) — preserves
// the no-XSS posture from Phase 1.

(function () {
  const base = (document.currentScript && document.currentScript.dataset.base) || './content/';
  const page = (document.querySelector('main[data-page]') || {}).dataset && document.querySelector('main[data-page]').dataset.page;
  // Memoized so sections sharing a file (school.json) fetch it once.
  const cache = {};
  const j = (n) => cache[n] || (cache[n] = fetch(base + n).then((r) => r.ok ? r.json() : Promise.reject(new Error('fetch ' + n + ' ' + r.status))));
  const $ = (id) => document.getElementById(id);
  const clear = (n) => { while (n.firstChild) n.removeChild(n.firstChild); };
  const make = (t, c, txt) => { const x = document.createElement(t); if (c) x.className = c; if (txt != null) x.textContent = txt; return x; };

  const LOAD_ERROR = 'לא הצלחנו לטעון את התוכן. נסו לרענן את הדף.';

  // Each independent section loads and renders on its own: a network error,
  // non-OK response or malformed JSON replaces only that section's
  // placeholders with LOAD_ERROR, so other sections still render.
  function section(files, ids, render) {
    return Promise.all(files.map(j)).then((d) => render(...d)).catch((e) => {
      console.error(e);
      ids.forEach((id) => {
        const n = $(id); if (!n) return;
        n.textContent = '';
        n.appendChild(make('span', 'load-error', LOAD_ERROR));
      });
    });
  }

  function linkCard(l) {
    const isLive = l && l.url;
    const a = make(isLive ? 'a' : 'span', 'link-card');
    if (isLive) { a.href = l.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    else a.setAttribute('aria-disabled', 'true');
    a.appendChild(make('span', 'link-card__label', (l && l.label) || ''));
    if (!isLive) a.appendChild(make('span', 'link-card__status', 'בקרוב'));
    else { const ar = make('span', 'link-card__arrow', '↗'); ar.setAttribute('aria-hidden', 'true'); a.appendChild(ar); }
    return a;
  }

  function contactDl(s) {
    const dl = make('dl');
    [['מנהל', s.principal.name],
     ['דוא״ל', ['a', null, s.principal.email, 'mailto:' + s.principal.email]],
     ['טלפון', ['a', null, s.principal.phone, 'tel:' + s.principal.phone.replace(/[^0-9+]/g, '')]],
     ['כתובת', s.address]].forEach(([k, v]) => {
      dl.appendChild(make('dt', null, k));
      const dd = make('dd');
      if (typeof v === 'string') dd.textContent = v;
      else { const a = make(v[0], v[1], v[2]); a.href = v[3]; dd.appendChild(a); }
      dl.appendChild(dd);
    });
    return dl;
  }

  // Source prose (body_he) is rendered verbatim — attributions stay inline.
  // quote_author is metadata only; it is not rendered, since body_he already
  // carries the same attribution.
  function pillarCard(p) {
    const art = make('article', 'pillar');
    const icon = make('span', 'pillar__icon', (p.title_he || 'א').trim().charAt(0));
    icon.setAttribute('aria-hidden', 'true');
    art.appendChild(icon);
    art.appendChild(make('h3', 'pillar__title', p.title_he));
    art.appendChild(make('p', 'pillar__body', p.body_he || ''));
    return art;
  }

  // parents.schema.json uses title_he/body_he; legacy title/body still accepted.
  const str = (...vs) => vs.find((v) => typeof v === 'string' && v.trim()) || '';

  function messageCard(m) {
    const art = make('article', 'message');
    const meta = make('div', 'message__meta');
    if (m.date) { const t = make('time', 'message__time', m.date); t.dateTime = m.date; meta.appendChild(t); }
    if (m.author) {
      if (m.date) { const s = make('span', 'message__sep', '·'); s.setAttribute('aria-hidden', 'true'); meta.appendChild(s); }
      meta.appendChild(make('span', 'message__author', m.author));
    }
    art.appendChild(meta);
    const title = str(m.title_he, m.title);
    const body = str(m.body_he, m.body);
    if (title) art.appendChild(make('h3', 'message__title', title));
    if (body) art.appendChild(make('p', 'message__body', body));
    return art;
  }

  // FAQ accordion item. Built from a {q_he, a_he, source} entry.
  // The first item in the list opens by default so the page never looks empty.
  function faqItem(item, open) {
    const det = make('details', 'faq__item');
    if (open) det.open = true;
    const sum = make('summary', 'faq__q', item.q_he);
    const body = make('div', 'faq__a', item.a_he);
    const src = make('p', 'faq__source', 'מקור: ' + (item.source || 'assaf-direct'));
    det.appendChild(sum);
    det.appendChild(body);
    det.appendChild(src);
    return det;
  }

  function faqList(items) {
    const wrap = make('div', 'faq');
    (items || []).forEach((it, i) => wrap.appendChild(faqItem(it, i === 0)));
    return wrap;
  }

  function setJsonLd(faqItems) {
    const ld = document.querySelector('script[type="application/ld+json"]');
    if (!ld) return;
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: (faqItems || []).map((it) => ({
        '@type': 'Question',
        name: it.q_he,
        acceptedAnswer: { '@type': 'Answer', text: it.a_he },
      })),
    });
  }

  // Static headings (hero-name, np-title) are never listed as error targets,
  // so their HTML fallback text survives a failed load.
  const renderers = {
    home: () => Promise.all([
      section(['school.json'], ['hero-tagline', 'contact-strip'], (school) => {
        if ($('hero-name')) $('hero-name').textContent = school.name_full_he;
        if ($('hero-tagline')) $('hero-tagline').textContent = school.tagline_he;
        const c = $('contact-strip'); if (c) { clear(c); c.appendChild(contactDl(school)); }
      }),
      section(['philosophy.json'], ['philosophy-intro', 'pillars'], (phil) => {
        if ($('philosophy-intro')) $('philosophy-intro').textContent = phil.intro;
        const g = $('pillars'); if (g) { clear(g); phil.pillars.forEach((p) => g.appendChild(pillarCard(p))); }
      }),
      section(['links.json'], ['links'], (links) => {
        const le = $('links'); if (!le) return;
        clear(le);
        ['facebook', 'whatsapp', 'padlet', 'remote_learning_canva', 'remote_learning_video'].map((k) => links[k]).filter(Boolean).forEach((l) => le.appendChild(linkCard(l)));
      }),
    ]),
    registration: () => {
      const ids = ['reg-window', 'reg-audience', 'reg-lottery', 'reg-payment', 'reg-transport'];
      return section(['registration.json'], ids, (r) => {
        [r.window, r.audience_note, r.lottery_note, r.payment_note, r.transport_note].forEach((v, i) => { const n = $(ids[i]); if (n) n.textContent = v || ''; });
      });
    },
    contact: () => section(['school.json'], ['contact-card'], (s) => {
      const c = $('contact-card'); if (c) { clear(c); c.appendChild(contactDl(s)); }
    }),
    parents: () => section(['parents.json'], ['parents-desc', 'parents-list'], (p) => {
      if ($('parents-desc')) $('parents-desc').textContent = p.description || '';
      const list = $('parents-list'); if (!list) return;
      clear(list);
      if (!p.messages || !p.messages.length) {
        const e = make('div', 'empty-state');
        e.appendChild(make('h3', null, 'אין הודעות כרגע'));
        e.appendChild(make('p', null, 'כאן יופיעו הודעות הנהגת הורים ברגע שיתווספו.'));
        list.appendChild(e);
      } else p.messages.forEach((m) => list.appendChild(messageCard(m)));
    }),
    'new-parents': () => Promise.all([
      section(['faq.json'], ['np-intro', 'np-faq-list'], (faq) => {
        if ($('np-title')) $('np-title').textContent = faq.title_he || 'חדשים כאן?';
        if ($('np-intro')) $('np-intro').textContent = faq.intro_he || '';
        const list = $('np-faq-list'); if (list) { clear(list); list.appendChild(faqList(faq.items)); }
        setJsonLd(faq.items);
      }),
      section(['school.json'], ['np-tagline'], (school) => {
        if ($('np-tagline')) $('np-tagline').textContent = school.tagline_he || '';
      }),
    ]),
  };

  document.addEventListener('DOMContentLoaded', () => { if (page && renderers[page]) renderers[page]().catch(console.error); });
})();
