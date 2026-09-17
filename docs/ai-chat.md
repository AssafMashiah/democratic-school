# AI Chat — Cloudflare Workers AI + AI Gateway recipe

> The chat is **dormant by default**. The function returns `503` until
> Assaf sets `CHAT_ENABLED=true` and supplies the AI Gateway id.
> This doc is the wiring recipe — Phase 4 implements the shell, Phase 5
> (a future card) flips the switch.

## What we want

- A chat widget on every page (Hebrew RTL, mobile-first).
- Answers are grounded **only** in site content (`content/*.json`).
- Out-of-scope questions get a fixed refusal string (no hallucination).
- All requests flow through Cloudflare **AI Gateway** so we have a single
  place to log, cache, rate-limit, and audit.
- No persistent user state. The conversation lives in the page; the server
  is stateless beyond the gateway log.

## Components

| Piece | Where | Role |
|---|---|---|
| `<ai-chat>` web component | `assets/chat.js` | UI: floating button + dialog. |
| Pages Function | `functions/api/chat.js` | Stateless proxy. Validates input, builds system prompt, calls the model. |
| AI Gateway | Cloudflare dashboard (Assaf-owned) | Logs every prompt/response. Optional cache. |
| Workers AI model | Cloudflare-native | The actual LLM. |

## Env vars (set by Assaf in Pages → Settings → Environment variables)

| Name | Required | Default | Notes |
|---|---|---|---|
| `CHAT_ENABLED` | yes | `false` | Master switch. `true` flips the route live. |
| `AI_GATEWAY_ID` | yes | — | e.g. `democratic-school-chat`. Created by Assaf in the CF dashboard. |
| `AI_GATEWAY_KEY` | optional | — | Only if the gateway is configured for authenticated endpoints. |
| `AI_MODEL` | optional | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Default model. Workers AI native, no external billing. |

> Hard rule: **no Cloudflare KV**. State is held in the gateway log, not in KV.

## Request shape

`POST /api/chat`

```json
{
  "messages": [
    {"role": "user", "content": "מתי נפתחת ההרשמה?"}
  ]
}
```

The function replies with `text/event-stream` (SSE) or `application/json`
if `Accept` does not include `text/event-stream`.

## System prompt (built from `content/*.json` at request time)

```
You are the assistant for בית החינוך הדמוקרטי, הרצליה.
Answer ONLY using the following catalog. If the answer is not in the catalog,
reply exactly with the refusal string and nothing else.

<catalog>
{{JSON.stringify(school)}}
{{JSON.stringify(philosophy)}}
{{JSON.stringify(registration)}}
{{JSON.stringify(links)}}
{{JSON.stringify(parents)}}
</catalog>

Refusal string (Hebrew):
"סליחה, אין לי מידע על כך. ניתן לפנות לבית הספר בדוא\"ל democratic@hrzedu.org.il או בטלפון 09-8305773."
```

## AI Gateway setup (one-time, Assaf does this)

1. Cloudflare dashboard → **AI** → **AI Gateway** → **Create**.
2. Name: `democratic-school-chat` (or whatever Assaf prefers).
3. Logging: **on**. Cache: **off** for v1 (we want fresh answers while we tune).
4. Rate limiting: optional; not needed in v1 since traffic is low.
5. Copy the **Gateway ID** into `AI_GATEWAY_ID`.

## Workers AI binding (Pages Functions)

In `wrangler.toml` (or Pages dashboard → Functions → Compatibility flags):

```toml
[[ai]]
binding = "AI"
```

The Pages Function calls:

```js
const stream = await env.AI.run(
  await env.AI.gateway(env.AI_GATEWAY_ID).getModel(env.AI_MODEL),
  { messages, stream: true }
);
```

(Exact call shape varies by Workers AI release — Phase 4 picks the version
that matches the live `wrangler` on this box.)

## Abuse mitigations (server-side, no KV)

- Reject requests with > 4 KB body.
- Reject conversations with > 8 messages.
- Reject if a single user message is > 500 chars.
- Reject if user message rate > 10 req/min per IP (best-effort via gateway logs, not enforced server-side in v1).
- The refusal string is the only allowed fallback.

## Verification (Phase 4 acceptance)

- `POST /api/chat` with `CHAT_ENABLED=false` → `503 {"error":"chat-disabled"}`.
- With `CHAT_ENABLED=true`:
  - "מתי נפתחת ההרשמה?" → answer contains the registration window dates from `registration.json`.
  - "מהי בירת צרפת?" → returns the refusal string verbatim.
- Gateway log shows every request.

## Out of scope (must NOT be added)

- ❌ Cloudflare KV (per TL hard constraint #10).
- ❌ Persistent user identity, auth, history.
- ❌ Any external LLM provider (OpenAI, Anthropic) — Workers AI only.
- ❌ Streaming audio / images / file uploads.