# Democratic School (Herzliya) — Web Site

> Minimal, mobile-first, Hebrew-first website for **בית החינוך הדמוקרטי ע"ש יאנוש קורצ'אק, הרצליה**.
> A static landing page that introduces the school, the educational vision, registration details,
> and how to get in touch — with a dormant AI chat (site-scoped only) ready to be turned on later.

## Live

https://democratic-school.pages.dev/

Auto-deploy on every push to `dev` once the Cloudflare Pages GitHub App is connected (see `docs/RUNBOOK.md`).
Until then, manual deploys via `npm run deploy:dev`.

## What lives here

```
README.md                   — this file
docs/PLAN.md                — implementation plan (5 phases)
docs/ai-chat.md             — Cloudflare Workers AI + AI Gateway recipe
docs/sources.md             — provenance for every fact
docs/security.md            — CSP + _headers policy
docs/RUNBOOK.md             — Git ↔ Pages connect runbook (dashboard clicks)
index.html                  — home
registration.html           — registration
contact.html                — contact
parents.html                — הנהגת הורים (parent council messages)
content/                    — JSON data per page (Hebrew)
assets/styles.css           — placeholder CSS (Phase 2 redesign)
assets/content.js           — vanilla JS loader (~80 lines, no framework)
_headers                    — security headers (CSP, HSTS, Permissions-Policy)
robots.txt
wrangler.toml               — Pages binding
package.json                — deploy scripts
```

## Stack

- **Static** HTML + CSS + vanilla JS. No build step.
- **Cloudflare Pages** for hosting. `dev` is the production branch.
- **Dormant AI chat** via Pages Functions + Workers AI + AI Gateway — off by default, gated on `CHAT_ENABLED`.
- **No DB / KV / R2** in v1. Zero CF resources besides Pages.

## Local dev

Just open `index.html` in a browser, or serve the folder:

```
npx serve .                 # or any static server
```

For Pages Functions (Phase 4):
```
npx wrangler pages dev .    # local Pages emulator with Functions
```

## Deploy

Manual (current):
```
npm run deploy:dev
```

Auto (after Git is connected — see RUNBOOK):
```
git push origin dev
```

## Locale

- Primary language: Hebrew (`<html dir="rtl" lang="he">`)
- Encoding: UTF-8
- Fonts: system Hebrew stack (`Heebo`, `Assistant`, `Noto Sans Hebrew`)
- No English translation in v1.

## Contribution

- Every content fact traces to a row in `docs/sources.md`.
- No new external services without Assaf sign-off.
- Costs kept to near zero (Pages free tier + Workers AI free tier).
