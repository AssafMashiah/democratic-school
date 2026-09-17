# Democratic School (Herzliya) — Web Site

> Minimal, mobile-first, Hebrew-first website for **בית החינוך הדמוקרטי ע"ש יאנוש קורצ'אק, הרצליה**.
> A static landing page that introduces the school, the educational philosophy, registration info, contact, and links to parent-community surfaces.
> An AI assistant is part of the design (scoped to site content) but **dormant by default** until Assaf flips it on.

---

## TL;DR

| Field | Value |
|---|---|
| Repo | https://github.com/AssafMashiah/democratic-school |
| Display name | בית החינוך הדמוקרטי, הרצליה |
| Audience | Parents of Herzliya (primary), educators, city officials |
| Language | Hebrew first; English second |
| Surface | Mobile-first responsive single-page site + a few sub-pages |
| Host target | Cloudflare Pages |
| Backend | None for v1 (static). v1.1: Cloudflare Worker + AI Gateway for the chat |
| Data sources | `sites.google.com/edu-herzliya.org.il/democratschoolhr/` + `עקרונות חינוך דמוקרטי.pdf` (Drive `177HSHU3hk8VN57UsISMPDHbp-BAXOwc`) |
| DB / KV / R2 | **None for v1**. No Cloudflare KV is used anywhere in the project. |
| Default branch | `dev` — workers branch off `dev`, never `main` |
| Branch prefix | `democratic-school/` |
| Principal | Assaf Mashiah (Telegram 6089876220) |

---

## Goal

A single, well-designed, mobile-friendly website that:

1. Tells parents what the school is, the educational philosophy, the daily experience.
2. Provides registration information and a clear next action.
3. Lists contact info and external surfaces (Facebook, WhatsApp, Padlet).
4. Houses a place for the **parents team (הנהגת הורים)** to publish messages to parents — v1 ships the page shell with the list mechanism stubbed; the data source is decided in a later card.
5. Hides an AI chat behind a feature flag so we can ship static HTML without exposing the chat prematurely.

---

## Out of scope (Dalinar must stop and confirm)

- Anything that touches production infrastructure (deploy targets, DNS, hosting) — Assaf must approve.
- Anything that mentions donors / recipients / students by name — Assaf must approve.
- Cross-project work that touches `building-is-art`, `sharp-thought`, `thrives-site`, `auth`, `open-knowledge`, or any other wired project — block and tell Assaf.
- Push to `main` without explicit Assaf approval.
- Auto-deploy on commit until Assaf sets up CI.

---

## Stack (decision)

### Front-end
- **Plain HTML + a tiny CSS layer + minimal vanilla JS**. No build step.
  - Why: zero JS toolchain weight, instant mobile load, Hebrew RTL "just works" with `<html dir="rtl" lang="he">`, easy to hand-edit on a phone. The school is small and the content is small.
  - Pages: `index.html` (home / about), `registration.html`, `contact.html`, `parents.html` (הנהגת הורים).
- **CSS approach:** single `assets/styles.css` with custom-properties for tokens (colors, spacing, type scale). RTL handled via logical properties (`margin-inline-start`, etc.).
- **Fonts:** system Hebrew stack (`"Heebo"`, `"Assistant"`, `"Noto Sans Hebrew"`, `system-ui`). No webfont download on v1.

### Hosting
- **Cloudflare Pages** — connect this GitHub repo, build command `none`, output `/.` (the static site is at the root). Custom domain wired later by Assaf.
- HTTP headers set via a `_headers` file: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Content-Security-Policy` (initial policy documented in `docs/security.md`).

### Data
- All content ships as **static JSON/HTML baked into the repo** at build time. Source documents are the Google Site pages and the PDF; we copy the relevant text into content files under `content/` so the site is self-contained and does not depend on third-party embeds.

### AI chat (dormant in v1)
- **Cloudflare Worker** at `functions/api/chat.js` (Pages Functions). Wired to **Workers AI** via the **AI Gateway** proxy.
- The chat route **exists** but returns `503` while the feature flag is off. The `<ai-chat>` web component is rendered in the page but shows a "Coming soon" state.
- When Assaf enables it: the function streams the catalog (built from `content/`) into the system prompt and forwards the question to `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (or whatever model Assaf confirms) through AI Gateway for logging + caching. See `docs/ai-chat.md` for the full wiring recipe.

### What we are NOT introducing

- ❌ Cloudflare KV (per TL hard constraint #10).
- ❌ D1, R2, Durable Objects (overkill for v1).
- ❌ Any external service without Assaf's approval.

---

## Local development

There is no build step in v1. To preview locally:

```bash
cd /home/thrallboy/Projects/democratic-school
python3 -m http.server 5173
# open http://localhost:5173/
```

The Pages Functions (`functions/api/chat.js`) require `wrangler` for local emulation:

```bash
npx wrangler pages dev . --port 5173 --binding AI=__dummy__
```

The dev binding is a dummy — the function returns `503` until Assaf sets `AI_GATEWAY_ID` and `AI_GATEWAY_KEY` in the Pages env.

---

## Deploy

Deployment is **manual** (no auto-deploy until Assaf sets up CI):

```bash
# 1. merge to dev (the TL's branch)
# 2. preview deploy from dev
npx wrangler pages deploy . --project-name democratic-school --branch dev

# 3. production deploy — Assaf merges dev -> main, then:
npx wrangler pages deploy . --project-name democratic-school --branch main
```

DNS / custom domain wiring is **out of scope** for this README; Assaf owns that step.

---

## Project layout

```
democratic-school/
├── README.md                       # this file
├── docs/
│   ├── PLAN.md                     # phased implementation plan
│   ├── ai-chat.md                  # Cloudflare AI Gateway wiring recipe
│   ├── security.md                 # CSP, headers, content-source notes
│   └── sources.md                  # provenance for every fact on the site
├── content/
│   ├── school.json                 # name, address, phone, principal, contact
│   ├── philosophy.json             # values / quotes / pedagogy pillars
│   ├── registration.json            # registration window, lottery info
│   ├── links.json                  # facebook, whatsapp, padlet
│   └── parents.json                # הנהגת הורים — initial structure, empty messages
├── assets/
│   ├── styles.css                  # RTL-first tokens + components
│   └── icons/                      # svg icons (facebook, whatsapp, padlet)
├── functions/
│   └── api/
│       └── chat.js                 # dormant AI chat route
├── index.html                      # home / about
├── registration.html
├── contact.html
├── parents.html
├── _headers                        # Cloudflare Pages security headers
└── robots.txt
```

---

## Verification

Per the TL operating manual §6, every worker task is verified by the TL before merge to `dev`:

- Visual: render at 360 px width and 1280 px width (mobile + desktop). RTL looks correct in both.
- Functional: every link on every page resolves to an anchor or an external URL that opens.
- Content: every fact on the site traces to `docs/sources.md`.
- Chat (when enabled): a single question about the school returns a response that quotes site content; out-of-scope questions return the rejection text from `docs/ai-chat.md`.
- No Cloudflare KV bindings anywhere.

---

## Status

| Date | Change |
|---|---|
| 2026-09-17 | Repo cloned empty, project + board created, scope doc authored. README drafted (decision: static + Cloudflare Pages + dormant AI chat). |