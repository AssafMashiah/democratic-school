// functions/api/chat.js
// Dormant AI chat endpoint. Returns 503 until CHAT_ENABLED=true.
//
// When enabled, calls Cloudflare Workers AI via AI Gateway, with the
// system prompt built from every file in /content/. Only answers from
// site data; refuses off-topic questions in Hebrew.
//
// Env vars (set in Pages → Settings → Environment variables):
//   CHAT_ENABLED   — "true" / "false". Default false.
//   AI_GATEWAY_ID  — Cloudflare AI Gateway id (e.g. "ds-chat")
//   AI_MODEL_DEFAULT — Workers AI model id
//                      default: "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
//
// Bundle (set in Pages → Settings → Functions → Bindings):
//   AI  — Workers AI binding

const REFETCH = "no-store"; // always get the latest content on a single edge hit
const CORS_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};
const REFUSAL_HE = "אני יכול לענות רק על שאלות שמבוססות על תוכן האתר של בית החינוך הדמוקרטי בהרצליה.";

export async function onRequestPost(context) {
  const { request, env } = context;
  if ((env.CHAT_ENABLED ?? "false") !== "true") {
    return new Response(JSON.stringify({ ok: false, error: "chat_disabled" }), {
      status: 503,
      headers: CORS_HEADERS,
    });
  }
  if (!env.AI) {
    return new Response(JSON.stringify({ ok: false, error: "ai_binding_missing" }), {
      status: 503,
      headers: CORS_HEADERS,
    });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "bad_json" }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }
  const question = String(body?.question ?? "").trim();
  if (!question || question.length > 1000) {
    return new Response(JSON.stringify({ ok: false, error: "bad_question" }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const systemPrompt = await buildSystemPrompt(context);
  const gatewayId = env.AI_GATEWAY_ID || "ds-chat";
  const model = env.AI_MODEL_DEFAULT || "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

  try {
    const result = await env.AI.run(model, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      // Route through the AI Gateway for logging, caching, rate-limiting.
      // The Gateway id is part of the URL; Workers AI binding does not
      // accept a `gateway` field, so we construct the route manually.
    }, { gateway: { id: gatewayId, cacheTtl: 3600, skipCache: false } });

    const answer = result?.response || REFUSAL_HE;
    return new Response(JSON.stringify({ ok: true, answer }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "ai_failure", message: String(err) }), {
      status: 502,
      headers: CORS_HEADERS,
    });
  }
}

export async function onRequestGet() {
  // GET is intentionally a no-op: cheap health check, never returns the
  // answer over GET (no caching semantics).
  return new Response(JSON.stringify({ ok: false, error: "post_only" }), {
    status: 405,
    headers: { ...CORS_HEADERS, allow: "POST" },
  });
}

// Build the system prompt by concatenating every content/*.json shipped
// with the site. Pages Functions can `fetch` from the same deployment's
// public assets.
//
// We only include files we know are safe to embed (small, JSON). New
// files would require explicit allow-list additions.
async function buildSystemPrompt(context) {
  const files = [
    "content/school.json",
    "content/philosophy.json",
    "content/registration.json",
    "content/links.json",
    "content/parents.json",
  ];
  const url = new URL(context.request.url);
  const origin = `${url.protocol}//${url.host}`;
  const parts = [];
  for (const f of files) {
    try {
      const r = await fetch(`${origin}/${f}`, { cf: { cacheTtl: 60 }, cache: REFETCH });
      if (r.ok) parts.push(`\n\n<!-- ${f} -->\n` + (await r.text()));
    } catch {
      // tolerant — one missing file should not break the chat
    }
  }
  return `אתה עוזר וירטואלי לאתר בית החינוך הדמוקרטי ע"ש יאנוש קורצ'אק, הרצליה.
ענה בעברית בלבד, רק על סמך המידע שלהלן. אם השאלה אינה קשורה לבית הספר, או שהתשובה אינה נמצאת במידע, ענה בדיוק:
"${REFUSAL_HE}"
אל תמציא שמות, תאריכים, מספרי טלפון או כתובות שאינם במידע.
המידע המאושר:${parts.join("")}`;
}
