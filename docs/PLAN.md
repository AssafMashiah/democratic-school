# Implementation plan — Democratic School site

> Phase 0 is the only thing executed today (README + plan + skeleton + dev branch).
> Phases 1–5 each become a kanban card after Assaf approves the plan.

## Phase 0 — Foundations (this card)

Owner: Dalinar (this persona). No feature code in scope.

- [x] Read `~/Projects/dalinar-internal/projects/democratic-school.md`.
- [x] Read `chat-id-map.md` → project `democratic-school`, board `democratic-school`, chat `-5203676149`.
- [x] Inspect repo: empty, on `main`, no commits.
- [x] Inspect Google Site pages and the PDF for source content.
- [x] Author `README.md` (stack decision, deploy, layout, scope).
- [x] Author `docs/PLAN.md` (this file).
- [x] Create `dev` branch and make the first commit.
- [x] Update project scope doc with the new in-scope items (chat shell, parents page).
- [x] Surface plan + decisions to Assaf in the Telegram group.

No code, no deploy, no push to `main`.

---

## Phase 1 — Content extraction & skeleton

Assignee: Kaladin (sonnet / MiniMax-M3). One card. Branch: `democratic-school/feat-skeleton`.

Goal: A navigable, content-loaded, RTL-correct shell of the site with no styling polish yet — the goal of this phase is to prove the structure and prove the source-of-truth content files.

Scope:
- `content/school.json`, `content/philosophy.json`, `content/registration.json`, `content/links.json`, `content/parents.json` — all populated from the Google Site + the PDF. Every fact links to its source.
- `index.html`, `registration.html`, `contact.html`, `parents.html` — minimal HTML using `<link rel="stylesheet">` to a placeholder CSS.
- A tiny `assets/content.js` that injects the JSON into the page (so content authors can edit JSON without touching HTML). ~30 lines.
- `_headers` and `robots.txt`.
- A footer that links to the four pages.

Acceptance criteria:
- Visiting each page shows the correct content with `dir="rtl" lang="he"`.
- Every visible fact has a `source:` field in the JSON that points to a URL on `edu-herzliya.org.il` or the Drive file id.
- `python3 -m http.server 5173` serves the site without 404s.
- No JS framework, no build step.

Out of scope:
- Visual polish.
- AI chat.
- Deploy.

Verification (TL):
- `python3 -m http.server 5173` then curl every page returns 200 and contains the expected Hebrew strings.
- Spot-check that every JSON `source:` field is reachable (HEAD request).

---

## Phase 2 — Visual design + mobile

Assignee: Shalan first (UX/visual brief), then Kaladin (sonnet) for implementation.

Goal: Make the skeleton look like a real school site.

Steps:
- Shalan brief → `docs/design-brief.md` (palette, type, spacing, mobile breakpoints, RTL rules, links card pattern, "coming soon" badge for WhatsApp / Padlet).
- Kaladin implements `assets/styles.css` + `assets/icons/` against the brief.
- Two screenshots at 360 px and 1280 px.

Acceptance:
- Lighthouse mobile ≥ 95 performance, ≥ 95 accessibility, ≥ 95 SEO.
- All four pages look intentional, not boilerplate.
- RTL: every "next" / "previous" cue points the right direction.

Verification: TL loads the dev URL, runs Lighthouse, and visual checks both breakpoints.

---

## Phase 3 — Parents team page (הנהגת הורים)

Assignee: Kaladin. One card. Branch: `democratic-school/feat-parents-page`.

Goal: A real, useful place for parent-team messages.

Source-of-truth decision (this phase blocks on Assaf):

There are three viable shapes. **Dalinar recommends option A** for v1.

| Option | Data shape | Cost | Editability | Notes |
|---|---|---|---|---|
| **A. JSON in repo** | `content/parents.json` — array of `{date, author, title, body}` | $0 | Assaf edits the JSON via PR | Pure static. One PR per announcement. No backend. |
| B. Cloudflare Worker + R2 | PUT to a Worker that stores JSON in R2 | ~$0.01/mo + occasional writes | Browser-based form | Adds backend, auth, abuse surface. |
| C. WhatsApp link / Padlet embed | Embed the existing WhatsApp group or Padlet board | $0 | Same surface parents already use | Defers the design problem to WhatsApp/Padlet; loses site branding. |

Once Assaf picks the option, the card body specifies it.

Acceptance (for option A):
- `parents.html` renders messages newest-first.
- Each message has date, title, body, optional author.
- An "edit on GitHub" link on each message points to the right line in `content/parents.json`.
- Empty state shows "No announcements yet."

---

## Phase 4 — AI chat shell (dormant)

Assignee: Kaladin (sonnet). One card. Branch: `democratic-school/feat-chat-dormant`.

Goal: The chat route exists, is wired to AI Gateway, but is **off by default**.

Scope:
- `functions/api/chat.js` — Pages Function. Reads `CHAT_ENABLED` env (default `"false"`). When off, returns `503 {error: "chat-disabled"}`. When on, streams from Workers AI via AI Gateway with the catalog as system prompt.
- `<ai-chat>` web component in `assets/chat.js` — minimal. Renders a "Coming soon" pill in dormant mode, a chat window in enabled mode.
- A floating button in the bottom-right of every page that opens the chat.
- `docs/ai-chat.md` — full wiring recipe (env vars, model choice, gateway config, abuse mitigations).

Hard constraints:
- ❌ No KV. State (if any) lives in the request body, never persisted.
- The chat **only** answers from site content. Out-of-scope questions return a fixed refusal string.
- AI Gateway must be configured to log requests so we can audit later.
- Cost: model choice is a decision for Assaf. Default suggestion: `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (Workers AI native, no external billing).

Acceptance:
- `functions/api/chat.js` exists; calling it with `CHAT_ENABLED=false` returns 503.
- The `<ai-chat>` component renders the dormant UI on every page.
- Manual deploy to dev shows the floating button and the dormant state.

---

## Phase 5 — AI chat activation

Blocked until Assaf approves going live. No code from Kaladin without explicit go.

Steps (each its own card):
1. Assaf creates the AI Gateway in the Cloudflare dashboard, copies the gateway id and (optionally) the key.
2. Assaf adds `AI_GATEWAY_ID` (and `AI_GATEWAY_KEY` if using authenticated gateway) to Pages project env vars.
3. Assaf sets `CHAT_ENABLED=true`.
4. Kaladin verifies: asks "When does registration open?" — answer cites the registration window. Asks "What is the capital of France?" — answer is the refusal string.
5. Shalan audits the chat UI at desktop + mobile sizes.
6. TL reports to Assaf; Assaf decides main / public launch.

---

## Cross-card rules

- Every worker card carries `--project=democratic-school --board=democratic-school`.
- Every worker branch is `democratic-school/feat-<short-id>` off current `dev`.
- TL never merges to `main`; Assaf owns `main`.
- Any change that touches another project's repo, credentials, or token → block and tell Assaf.
- Cloudflare KV is **never** introduced.
- No external service is added without Assaf's explicit approval.
- Costs: target ≤ $2 per card. Page bundle + free Workers AI tier keeps us well under the $5 ceiling.