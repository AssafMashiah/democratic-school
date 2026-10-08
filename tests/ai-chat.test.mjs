// Regression: the <ai-chat> status probe must fail closed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadAiChat, read } from './helpers.mjs';

const res = (status, body) => ({
  status,
  ok: status >= 200 && status < 300,
  json: async () => (typeof body === 'string' ? JSON.parse(body) : body),
});

const cases = [
  ['405 (current post-only GET)', async () => res(405, { ok: false, error: 'post_only' }), 'dormant'],
  ['503 (chat disabled)', async () => res(503, { ok: false, error: 'chat_disabled' }), 'dormant'],
  ['500', async () => res(500, {}), 'unavailable'],
  ['200 malformed JSON', async () => res(200, '{not json'), 'unavailable'],
  ['200 ok:false', async () => res(200, { ok: false }), 'unavailable'],
  ['200 ok:true without enabled', async () => res(200, { ok: true }), 'unavailable'],
  ['200 enabled:"true" (string)', async () => res(200, { ok: true, enabled: 'true' }), 'unavailable'],
  ['network error', async () => { throw new TypeError('Failed to fetch'); }, 'offline'],
  ['200 ok:true enabled:true', async () => res(200, { ok: true, enabled: true }), 'enabled'],
];

for (const [name, fetchImpl, want] of cases) {
  test(`probe: ${name} -> ${want}`, async () => {
    const { AiChat } = loadAiChat();
    assert.equal(await AiChat.probe(fetchImpl), want);
  });
}

test('refreshStatus never reveals the form unless enabled', async () => {
  const { AiChat, ctx } = loadAiChat();
  for (const [name, fetchImpl, want] of cases) {
    ctx.fetch = fetchImpl;
    const el = Object.create(AiChat.prototype);
    el.form = { hidden: true };
    el.status = { hidden: true, textContent: '' };
    await el.refreshStatus();
    assert.equal(el.form.hidden, want !== 'enabled', name);
    if (want !== 'enabled') assert.ok(el.status.textContent.length > 0, name);
  }
});

test('real backend GET (unchanged) keeps the chat dormant', async () => {
  const src = read('functions/api/chat.js');
  const mod = await import('data:text/javascript,' + encodeURIComponent(src));
  const r = await mod.onRequestGet();
  const { AiChat } = loadAiChat();
  assert.equal(await AiChat.probe(async () => r), 'dormant');
});

test('chat heading is h3 (nested under the section h2)', () => {
  const src = read('assets/ai-chat.js');
  assert.match(src, /<h3 id="ai-chat-heading">/);
  assert.doesNotMatch(src, /<h2 id="ai-chat-heading">/);
});
