// Democratic School — content loader. Vanilla JS, no framework.
// All user-supplied strings set via textContent (no innerHTML) — preserves
// the no-XSS posture from Phase 1.

(function () {
  const base = (document.currentScript && document.currentScript.dataset.base) || './content/';
  const page = (document.querySelector('main[data-page]') || {}).dataset && document.querySelector('main[data-page]').dataset.page;
  const j = (n) => fetch(base + n).then((r) => r.ok ? r.json() : Promise.reject(new Error('fetch ' + n + ' ' + r.status)));
  const $ = (id) => document.getElementById(id);
  const clear = (n) => { while (n.firstChild) n.removeChild(n.firstChild); };
  const make = (t, c, txt) => { const x = document.createElement(t); if (c) x.className = c; if (txt != null) x.textContent = txt; return x; };

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

  function pillarCard(p) {
    const m = (p.body_he || '').match(/\(([^)]+)\)\s*$/);
    const body = (p.body_he || '').replace(/\s*\(([^)]+)\)\s*$/, '');
    const art = make('article', 'pillar');
    const icon = make('span', 'pillar__icon', (p.title_he || 'א').trim().charAt(0));
    icon.setAttribute('aria-hidden', 'true');
    art.appendChild(icon);
    art.appendChild(make('h3', 'pillar__title', p.title_he));
    art.appendChild(make('p', 'pillar__body', body));
    if (m) art.appendChild(make('span', 'pillar__quote-author', m[1]));
    return art;
  }

  function messageCard(m) {
    const art = make('article', 'message');
    const meta = make('div', 'message__meta');
    if (m.date) { const t = make('time', 'message__time', m.date); t.dateTime = m.date; meta.appendChild(t); }
    if (m.author) {
      if (m.date) { const s = make('span', 'message__sep', '·'); s.setAttribute('aria-hidden', 'true'); meta.appendChild(s); }
      meta.appendChild(make('span', 'message__author', m.author));
    }
    art.appendChild(meta);
    if (m.title) art.appendChild(make('h3', 'message__title', m.title));
    art.appendChild(make('p', 'message__body', m.body));
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

  const renderers = {
    async home() {
      const [school, phil, links] = await Promise.all([j('school.json'), j('philosophy.json'), j('links.json')]);
      if ($('hero-name')) $('hero-name').textContent = school.name_full_he;
      if ($('hero-tagline')) $('hero-tagline').textContent = school.tagline_he;
      if ($('philosophy-intro')) $('philosophy-intro').textContent = phil.intro;
      const g = $('pillars'); if (g) { clear(g); phil.pillars.forEach((p) => g.appendChild(pillarCard(p))); }
      const le = $('links'); if (le) {
        clear(le);
        ['facebook', 'whatsapp', 'padlet', 'remote_learning_canva', 'remote_learning_video'].map((k) => links[k]).filter(Boolean).forEach((l) => le.appendChild(linkCard(l)));
      }
      const c = $('contact-strip'); if (c) { clear(c); c.appendChild(contactDl(school)); }
    },
    async registration() {
      const r = await j('registration.json');
      [['reg-window', r.window], ['reg-audience', r.audience_note], ['reg-lottery', r.lottery_note], ['reg-payment', r.payment_note], ['reg-transport', r.transport_note]].forEach(([id, v]) => { const n = $(id); if (n) n.textContent = v || ''; });
    },
    async contact() {
      const s = await j('school.json');
      const c = $('contact-card'); if (c) { clear(c); c.appendChild(contactDl(s)); }
    },
    async parents() {
      const p = await j('parents.json');
      if ($('parents-desc')) $('parents-desc').textContent = p.description || '';
      const list = $('parents-list'); if (!list) return;
      clear(list);
      if (!p.messages || !p.messages.length) {
        const e = make('div', 'empty-state');
        e.appendChild(make('h3', null, 'אין הודעות כרגע'));
        e.appendChild(make('p', null, 'כאן יופיעו הודעות הנהגת הורים ברגע שיתווספו.'));
        list.appendChild(e);
      } else p.messages.forEach((m) => list.appendChild(messageCard(m)));
    },
    async 'new-parents'() {
      const [faq, school] = await Promise.all([j('faq.json'), j('school.json')]);
      if ($('np-title')) $('np-title').textContent = faq.title_he || 'חדשים כאן?';
      if ($('np-tagline')) $('np-tagline').textContent = school.tagline_he || '';
      if ($('np-intro')) $('np-intro').textContent = faq.intro_he || '';
      const list = $('np-faq-list'); if (list) { clear(list); list.appendChild(faqList(faq.items)); }
      setJsonLd(faq.items);
    },
  };

  document.addEventListener('DOMContentLoaded', () => { if (page && renderers[page]) renderers[page]().catch(console.error); });
})();
