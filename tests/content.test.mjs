// Regression: content renderer — pillar attributions and parents messages.
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, readJson } from './helpers.mjs';

const HOME_IDS = ['hero-name', 'hero-tagline', 'philosophy-intro', 'pillars', 'links', 'contact-strip'];

test('every pillar quote_author is an exact attribution present in body_he', () => {
  const { pillars } = readJson('content/philosophy.json');
  for (const p of pillars) {
    assert.ok(p.quote_author, `missing quote_author: ${p.title_he}`);
    assert.ok(p.body_he.includes(`(${p.quote_author})`), `not exact: ${p.quote_author}`);
  }
});

test('pillar body renders verbatim (no regex stripping) + structured author', async () => {
  const { pillars } = readJson('content/philosophy.json');
  const els = await renderPage('home', HOME_IDS);
  const cards = els.pillars.children;
  assert.equal(cards.length, pillars.length);
  cards.forEach((card, i) => {
    const [body] = card.findAll('pillar__body');
    assert.equal(body.textContent, pillars[i].body_he);
    const authors = card.findAll('pillar__quote-author');
    assert.equal(authors.length, 1);
    assert.equal(authors[0].textContent, pillars[i].quote_author);
    assert.equal(authors[0].getAttribute('aria-hidden'), 'true');
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
