// Democratic School — content loader
// Tiny vanilla JS: fetch JSON, render into placeholders. No framework.
// Each page declares <main data-page="NAME">; this file picks a renderer.

(function () {
  const base = document.currentScript ? document.currentScript.dataset.base || './content/' : './content/';
  const page = (document.querySelector('main[data-page]') || {}).dataset;

  async function j(name) {
    const r = await fetch(base + name);
    if (!r.ok) throw new Error('fetch ' + name + ' ' + r.status);
    return r.json();
  }

  const renderers = {
    async home() {
      const [school, phil, links] = await Promise.all([
        j('school.json'), j('philosophy.json'), j('links.json')
      ]);
      const el = (id) => document.getElementById(id);
      if (el('hero-name')) el('hero-name').textContent = school.name_full_he;
      if (el('hero-tagline')) el('hero-tagline').textContent = school.tagline_he;
      const intro = el('philosophy-intro'); if (intro) intro.textContent = phil.intro;
      const grid = el('pillars'); if (grid) {
        grid.innerHTML = phil.pillars.map((p) =>
          '<article class="card"><h3>' + p.title_he + '</h3><p>' + p.body_he + '</p></article>'
        ).join('');
      }
      const linksEl = el('links'); if (linksEl) {
        const items = [links.facebook, links.whatsapp, links.padlet, links.remote_learning_canva, links.remote_learning_video];
        linksEl.innerHTML = items.map((l) => linkCard(l)).join('');
      }
      const contact = el('contact-strip'); if (contact) contact.appendChild(contactDl(school));
    },
    async registration() {
      const reg = await j('registration.json');
      const el = (id) => document.getElementById(id);
      if (el('reg-window')) el('reg-window').textContent = reg.window;
      if (el('reg-audience')) el('reg-audience').textContent = reg.audience_note;
      if (el('reg-lottery')) el('reg-lottery').textContent = reg.lottery_note;
      if (el('reg-payment')) el('reg-payment').textContent = reg.payment_note;
      if (el('reg-transport')) el('reg-transport').textContent = reg.transport_note;
    },
    async contact() {
      const school = await j('school.json');
      const el = document.getElementById('contact-card');
      if (el) el.appendChild(contactDl(school));
    },
    async parents() {
      const p = await j('parents.json');
      const desc = document.getElementById('parents-desc');
      if (desc) desc.textContent = p.description;
      const list = document.getElementById('parents-list');
      if (list && (!p.messages || p.messages.length === 0)) {
        list.innerHTML = '<div class="empty-state"><h3>אין הודעות כרגע</h3><p>כאן יופיעו הודעות הנהגת הורים ברגע שיתווספו.</p></div>';
      }
    }
  };

  function linkCard(l) {
    if (!l || !l.url) {
      return '<div class="link-card" aria-disabled="true"><span class="link-card__label">' + (l && l.label || '') + '</span><span class="link-card__status">בקרוב</span></div>';
    }
    return '<a class="link-card" href="' + l.url + '" target="_blank" rel="noopener noreferrer"><span class="link-card__label">' + l.label + '</span><span aria-hidden="true">↗</span></a>';
  }

  function contactDl(school) {
    const dl = document.createElement('dl');
    dl.innerHTML =
      '<dt>מנהל</dt><dd>' + school.principal.name + '</dd>' +
      '<dt>דוא״ל</dt><dd><a href="mailto:' + school.principal.email + '">' + school.principal.email + '</a></dd>' +
      '<dt>טלפון</dt><dd><a href="tel:' + school.principal.phone.replace(/[^0-9+]/g,'') + '">' + school.principal.phone + '</a></dd>' +
      '<dt>כתובת</dt><dd>' + school.address + '</dd>';
    return dl;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const p = page && page.page;
    if (p && renderers[p]) renderers[p]().catch((e) => console.error(e));
  });
})();
