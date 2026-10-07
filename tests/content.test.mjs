// Regression: content renderer — pillar attributions, parents messages and
// per-section load-failure isolation.
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, readJson, FAIL } from './helpers.mjs';

const HOME_IDS = ['hero-name', 'hero-tagline', 'philosophy-intro', 'pillars', 'links', 'contact-strip'];

test('every pillar quote_author is an exact attribution present in body_he', () => {
  const { pillars } = readJson('content/philosophy.json');
  for (const p of pillars) {
    assert.ok(p.quote_author, `missing quote_author: ${p.title_he}`);
    assert.ok(p.body_he.includes(`(${p.quote_author})`), `not exact: ${p.quote_author}`);
  }
});

test('pillar body renders verbatim (no regex stripping), no duplicate author footer', async () => {
  const { pillars } = readJson('content/philosophy.json');
  const els = await renderPage('home', HOME_IDS);
  const cards = els.pillars.children;
  assert.equal(cards.length, pillars.length);
  cards.forEach((card, i) => {
    const [body] = card.findAll('pillar__body');
    assert.equal(body.textContent, pillars[i].body_he);
    assert.equal(card.findAll('pillar__quote-author').length, 0);
    assert.equal(card.textContent.split(pillars[i].quote_author).length - 1, 1, 'author appears once');
  });
});

test('pillar without quote_author renders no author line', async () => {
  const phil = { intro: 'x', pillars: [{ title_he: 'כותרת', body_he: 'טקסט (לא מחבר)' }] };
  const els = await renderPage('home', HOME_IDS, { 'philosophy.json': phil });
  const [card] = els.pillars.children;
  assert.equal(card.findAll('pillar__body')[0].textContent, 'טקסט (לא מחבר)');
  assert.equal(card.findAll('pillar__quote-author').length, 0);
});

const PARENT_IDS = ['parents-desc', 'parents-list'];

test('messageCard honors schema title_he/body_he', async () => {
  const data = { description: 'הודעות הנהגת הורים', messages: [
    { id: 'm_20261001_test', date: '2026-10-01', title_he: 'כותרת', body_he: 'גוף', author: 'הנהגת הורים', source: 'heneget-direct' },
  ] };
  const els = await renderPage('parents', PARENT_IDS, { 'parents.json': data });
  const [card] = els['parents-list'].children;
  assert.equal(card.findAll('message__title')[0].textContent, 'כותרת');
  assert.equal(card.findAll('message__body')[0].textContent, 'גוף');
  assert.equal(card.findAll('message__author')[0].textContent, 'הנהגת הורים');
});

test('messageCard still accepts legacy title/body; *_he wins when both exist', async () => {
  const data = { description: 'd', messages: [
    { date: '2026-10-01', title: 'ישן', body: 'גוף ישן' },
    { date: '2026-10-02', title_he: 'חדש', title: 'ישן', body_he: 'גוף חדש', body: 'גוף ישן' },
    { date: '2026-10-03' },
  ] };
  const els = await renderPage('parents', PARENT_IDS, { 'parents.json': data });
  const [legacy, both, empty] = els['parents-list'].children;
  assert.equal(legacy.findAll('message__title')[0].textContent, 'ישן');
  assert.equal(legacy.findAll('message__body')[0].textContent, 'גוף ישן');
  assert.equal(both.findAll('message__title')[0].textContent, 'חדש');
  assert.equal(both.findAll('message__body')[0].textContent, 'גוף חדש');
  // Missing fields render nothing rather than "undefined".
  assert.equal(empty.findAll('message__title').length, 0);
  assert.equal(empty.findAll('message__body').length, 0);
  assert.doesNotMatch(empty.textContent, /undefined/);
});

test('empty parents board shows empty state', async () => {
  const els = await renderPage('parents', PARENT_IDS);
  assert.match(els['parents-list'].textContent, /אין הודעות כרגע/);
});

// Load-failure isolation: a failed file shows a Hebrew reload hint in its own
// section only; independent sections still render; no placeholder lingers.
const LOAD_ERROR = 'לא הצלחנו לטעון את התוכן. נסו לרענן את הדף.';
const LOADING = 'טוען…';
const shows = (el) => el.findAll('load-error').length === 1 && el.textContent === LOAD_ERROR;
const failPage = (page, ids, files, initial = {}) => renderPage(page, ids, files, { initial, expectErrors: true });

for (const [mode, fail] of Object.entries(FAIL)) {
  test(`home: ${mode} failure is isolated per section`, async () => {
    const init = { 'hero-name': 'בית החינוך הדמוקרטי, הרצליה', 'hero-tagline': LOADING, 'philosophy-intro': LOADING };
    const school = await failPage('home', HOME_IDS, { 'school.json': fail }, init);
    assert.equal(school['hero-name'].textContent, init['hero-name'], 'static heading kept');
    assert.ok(shows(school['hero-tagline']));
    assert.ok(shows(school['contact-strip']));
    assert.equal(school.pillars.children.length, readJson('content/philosophy.json').pillars.length);
    assert.ok(school.links.findAll('link-card').length > 0);

    const phil = await failPage('home', HOME_IDS, { 'philosophy.json': fail }, init);
    assert.ok(shows(phil['philosophy-intro']));
    assert.ok(shows(phil.pillars));
    assert.equal(phil['hero-tagline'].textContent, readJson('content/school.json').tagline_he);
    assert.ok(phil['contact-strip'].children.length > 0 && !shows(phil['contact-strip']));

    const links = await failPage('home', HOME_IDS, { 'links.json': fail }, init);
    assert.ok(shows(links.links));
    assert.ok(links.pillars.children.length > 0);
  });

  test(`new-parents: ${mode} failure is isolated per section`, async () => {
    const ids = ['np-title', 'np-tagline', 'np-intro', 'np-faq-list'];
    const init = { 'np-title': 'חדשים כאן?', 'np-tagline': LOADING, 'np-intro': LOADING };
    const faqFail = await failPage('new-parents', ids, { 'faq.json': fail }, init);
    assert.equal(faqFail['np-title'].textContent, 'חדשים כאן?', 'static heading kept');
    assert.ok(shows(faqFail['np-intro']));
    assert.ok(shows(faqFail['np-faq-list']));
    assert.equal(faqFail['np-tagline'].textContent, readJson('content/school.json').tagline_he);

    const schoolFail = await failPage('new-parents', ids, { 'school.json': fail }, init);
    assert.ok(shows(schoolFail['np-tagline']));
    assert.equal(schoolFail['np-faq-list'].findAll('faq__item').length, readJson('content/faq.json').items.length);
    assert.notEqual(schoolFail['np-intro'].textContent, LOADING);
  });

  test(`registration: ${mode} failure shows reload hint`, async () => {
    const ids = ['reg-window', 'reg-audience', 'reg-lottery', 'reg-payment', 'reg-transport'];
    const els = await failPage('registration', ids, { 'registration.json': fail }, Object.fromEntries(ids.map((id) => [id, LOADING])));
    for (const id of ids) assert.ok(shows(els[id]), id);
  });

  test(`contact: ${mode} failure shows reload hint`, async () => {
    const els = await failPage('contact', ['contact-card'], { 'school.json': fail }, { 'contact-card': LOADING });
    assert.ok(shows(els['contact-card']));
  });

  test(`parents: ${mode} failure shows reload hint`, async () => {
    const els = await failPage('parents', PARENT_IDS, { 'parents.json': fail }, { 'parents-desc': LOADING });
    assert.ok(shows(els['parents-desc']));
    assert.ok(shows(els['parents-list']));
  });
}
