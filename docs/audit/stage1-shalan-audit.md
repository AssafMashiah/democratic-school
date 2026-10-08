# Stage 1 — Shalan audit: democratic-school.pages.dev

> **Scope:** Read-only browser + code inspection of the static site on branch
> `democratic-school/design-repair-audit` (HEAD `2d44086`, matches `origin/dev`).
> All 5 HTML routes inspected at **mobile 360**, **mobile 390** (covered by 360
> — same layout, no horizontal overflow at either width), and **desktop 1440**,
> plus keyboard navigation and `:focus-visible` ring verification.
> Live canonical `https://democratic-school.pages.dev/` compared to local dev
> (`http://127.0.0.1:8765/`) — **both render the same HTML and the same CSS**
> for every page audited.
> **AI activation is paused** — `CHAT_ENABLED=false` per the project doc; the
> dormant chat shell is the only AI surface in scope and is treated as a
> regular UI element, not as live AI.

## TL;DR — bounded first pass under $5

9 verified defects (1 critical, 5 high, 3 medium). 4 are small enough for a
single PR. A clean Stage 2 implementation can land in a single branch without
framework changes, push to `dev`, and re-verify against the same evidence.

| # | Severity | Defect (one line) | Where |
|---|---|---|---|
| D1 | **Critical** | Dormant chat is rendered as an **active, submittable form** on the home page instead of "coming soon" copy | `assets/ai-chat.js:46-56` (status probe), `index.html:52-57` (section) |
| D2 | High | `<h1>` "בית החינוך הדמוקרטי …" in the site header **wraps to 2 lines on a 360px viewport**, pushing the brand band taller than the design target | `index.html:15` (static markup), `assets/styles.css:189` (`--fs-500` site-title size) |
| D3 | High | Hero `<h1>` (school full name) **wraps to 5 lines on a 360px viewport** — 36px font is too large for the available width | `assets/styles.css:235` (`--fs-700` hero h1), `assets/content.js:103` (content.js sets `school.name_full_he` into the h1) |
| D4 | High | **FAQ accordion is unstyled** on `new-parents.html` — questions, answers and source attribution run together with no padding/borders, the open item leaks its `מקור:` paragraph below the closed items | `new-parents.html:36` (target `.faq__item`/`.faq__q`/`.faq__a`/`.faq__source`), `assets/content.js:68-78` (JS adds the classes), `assets/styles.css` (no rules for any of them) |
| D5 | High | `pillarCard()` regex `\(([^)]+)\)\s*$` **silently drops the author** for pillars 4 (למידה פלורליסטית, "קן רובינסון") and 7 (שיתוף והשתתפות, "יעקב הכט") | `assets/content.js:40-42`, `content/philosophy.json:22, 37` |
| D6 | High | **Dead CSS** for `.ai-chat-fab` / `.ai-chat-panel` and `.brand-dot` — components are styled but never rendered; on the home page there is **no FAB, no panel, no brand dot** despite the brief asking for them | `assets/styles.css:197-201, 568-602`, `assets/ai-chat.js:13-42` (no FAB injected) |
| D7 | Medium | `<parents.html>` nav **omits "להורים חדשים"** — every other route has all 5 links; this one is missing one | `parents.html:19-21` |
| D8 | Medium | `data-assaf-only` attribute on the editor `<details>` is a **dead code marker** — never read by CSS/JS, so the editor steps are visible to all visitors (the attribute name implies otherwise) | `parents.html:29`, no matching CSS or JS |
| D9 | Medium | `<ai-chat>` shell renders a hard-coded `<h2 id="ai-chat-heading">שאל אותנו</h2>` **inside** a section already labelled "שאלות נפוצות" — duplicate h2 reading | `assets/ai-chat.js:17`, `index.html:52-53` |

Severity rubric:
- **Critical** — misleads users about a working feature.
- **High** — visible regression in the shipped design direction on the most
  common viewport (mobile 360).
- **Medium** — dead code, structure noise, nav inconsistency.
- **Low / subjective polish** — not raised here; backlog only.

## Evidence

Browser evidence collected against the live canonical
(`https://democratic-school.pages.dev/`) and the local dev server
(`http://127.0.0.1:8765/`) on the same worktree. Both surfaces render the
same HTML and CSS for every route — `git log` shows HEAD == `origin/dev`
== `2d44086` and the live site ships the same stylesheet. The `_headers`
CSP / HSTS / Permissions-Policy header stack was checked at the
local mirror and is not regressed in this branch.

Selected measurements:

| Element | Selector | Computed | Note |
|---|---|---|---|
| body bg | `body` | `rgb(247, 243, 234)` (cream) | matches `--c-bg` |
| header bg | `.site-header` | `rgb(47, 94, 148)` (brand-deep) | contrast 6.49:1 vs nav text (AA) |
| nav text | `.site-nav a` | `rgb(252, 252, 250)` | 6.49:1 on header (AA) |
| btn primary | `.btn--primary` | bg `rgb(196, 38, 116)` (joy), text `#fff` | 5.42:1 (AA-normal) — a11y commit `adbc0e5` |
| btn primary hover | `.btn--primary:hover` | bg `rgb(79, 129, 189)` (brand), text `#fff` | 4.03:1 (AA-large, 17px/700 bold) — passes |
| focus ring (body) | `:focus-visible` | 3px solid `var(--c-focus-ring)` = `#2F7A55` | 4.70:1 on cream (AA) |
| focus ring (header) | `.site-nav a:focus-visible` | 3px solid `rgb(252, 252, 250)` (override) | 6.49:1 (AA) — a11y fix verified |
| disabled card label | `.link-card[aria-disabled="true"] .link-card__label` | color `var(--c-text-soft)` on `--c-joy-soft` | 5.47:1 (AA) |
| footer text | `.site-footer` | `var(--c-text-soft)` on `--c-surface-alt` | 6.01:1 (AA) |
| footer link | `.site-footer a` | `var(--c-accent-deep)` on `--c-surface-alt` | 7.27:1 (AAA) |

Horizontal overflow at 360px and 1440px is **0px on every route** (the
brief's "no horizontal overflow at 360px" gate passes — the wrap is
vertical, not horizontal).

Keyboard tab order works: focus traverses the brand title → nav links → main
CTAs → content. `:focus-visible` outline width confirmed at 3px on
focused elements after a real `Input.dispatchKeyEvent type="keyDown" Tab`.

## Detailed findings

### D1 — Critical · dormant chat rendered as active form (live site too)

**Repro (live):**
1. Open `https://democratic-school.pages.dev/` and scroll to the bottom.
2. The "שאלות נפוצות" section shows a chat with heading "שאל אותנו",
   a Hebrew textarea, and a pink "שלח" submit button.
3. `CHAT_ENABLED` is `false`; the system prompt doc and the project doc both
   state the chat must stay off.

**Why it happens:** `assets/ai-chat.js:46-52`:
```js
const r = await fetch("/api/chat", { method: "GET" });
if (r.status === 405) {
  this.setEnabled();              // ← 405 treated as "chat works"
  return;
}
this.setDisabled(r.status === 503 ? "dormant" : "unavailable");
```
The `functions/api/chat.js:83-89` `onRequestGet` handler returns 405 with
`{"ok":false,"error":"post_only"}` regardless of `CHAT_ENABLED`. The probe
mistakes the "wrong verb" reply for "endpoint healthy and accepting POST".
A user who types and submits gets a confusing error on submit instead of
the calm "coming soon" message the brief specifies.

**Verified on:**
- Live `https://democratic-school.pages.dev/` — form visible, status hidden
  (`live_ai_chat_form_visible: True`, `live_ai_chat_status_visible: False`).
- Local dev — `python -m http.server` returns 404 (no Functions handler), so
  the form is **hidden** and the status shows "הצ׳אט אינו זמין כרגע"
  (the wrong copy — should be "dormant"). Both surfaces disagree about
  what the user should see, and neither matches the design intent.

**Fix acceptance criteria:**
- On the live site, with `CHAT_ENABLED=false`, the home page must show the
  dormant message "הצ׳אט כבוי כרגע ויופעל בקרוב" and **no form**.
- The chat endpoint must return a status that lets the probe distinguish
  "endpoint present, disabled" from "endpoint present, enabled". Suggested:
  return `200 {"ok":true,"enabled":false}` on `GET` when disabled, and have
  the JS read `data.enabled`. (Keep the 405 for non-disabled as a "method
  not allowed" sanity check, but no longer treat 405 as "enabled".)
- No change to the `CHAT_ENABLED` flag or to the system prompt; this is a
  pure wiring fix.
- A regression test must assert that with `CHAT_ENABLED=false`, the home
  page's `#ai-chat-form` is `hidden` and `#ai-chat-status` text is the
  dormant copy.

### D2 — High · brand `<a class="site-title">` wraps on 360px

**Repro (local 360):**
- `index.html` line 15: `<a class="site-title" href="index.html">בית החינוך הדמוקרטי</a>`
- Rendered at `font-size: var(--fs-500)` = 23px / 700 in a 360px-wide header
  band with the nav wrapping to 2 lines below it.
- Brand title h: 36px; nav y: 63–155px; title visually crowded against the
  first nav row.

**Why:** The site-title is 15 Hebrew characters at 23px. At 360px wide,
the title and the nav share `flex-wrap: wrap` in `.site-header__inner` and
the title itself doesn't break early, so the header balloons.

**Fix acceptance criteria:**
- At 360px the brand title fits on 1 line and the nav wraps cleanly
  underneath (currently 92px tall — target ≤ 56px).
- At 1280px the title is unchanged (1 line, 23px).
- Suggest: drop the title to `var(--fs-400)` (19px) at ≤ 480px, keep
  `var(--fs-500)` (23px) at ≥ 480px. No design token churn.

### D3 — High · hero `<h1>` wraps to 5 lines on 360px

**Repro (local 360):**
- `index.html` line 28: static h1 "בית החינוך הדמוקרטי, הרצליה".
- `assets/content.js:103` overrides it with `school.name_full_he` =
  `"בית החינוך הדמוקרטי ע\"ש יאנוש קורצ'אק, הרצליה"` (long form).
- At 360px, `--fs-700` = 36px renders the long form in **5 lines,
  182.75px tall** (rect `x:40, y:237, w:276, h:183`).
- At 1440px the same h1 wraps to 2 lines (96px tall) — acceptable.

**Why:** 36px is the desktop hero size; mobile-first practice is to scale
hero type down. There is no media query that reduces the hero h1 below
`--fs-700`.

**Fix acceptance criteria:**
- At 360px the hero h1 must render in ≤ 3 lines (target 1–2).
- At ≥ 880px the hero h1 keeps `--fs-700` (36px).
- Suggest: `font-size: var(--fs-600)` (28px) at ≤ 480px, `var(--fs-700)`
  (36px) at ≥ 480px. Same approach as D2 — no new tokens.
- Or: keep `--fs-700` everywhere but use a shorter mobile h1 (e.g. the
  static "בית החינוך הדמוקרטי, הרצליה" from `index.html:28`) and reserve
  the full `name_full_he` for the page `<title>` and the contact section.
  Either is acceptable; pick one.

### D4 — High · FAQ accordion unstyled on `new-parents.html`

**Repro (live):**
- Visit `https://democratic-school.pages.dev/new-parents.html` and scroll to
  "שאלות נפוצות".
- Open the first Q (already open by default), close it, open the second.
- The disclosure marker (▼) and the body run together; the open Q's
  `מקור: gh-site-home` paragraph leaks **below** the closed items because
  the closed `<details>` doesn't visually contain the source line.
- Browser support: the same defect is visible on local dev. Both surfaces
  ship the same `assets/styles.css`.

**Why:** `assets/content.js:68-78` builds FAQ items with classes
`.faq__item`, `.faq__q`, `.faq__a`, `.faq__source`. `assets/styles.css` has
**no rules for any of these classes**. The browser's default `<details>`
and `<summary>` styles render with no padding, no border, no visual
distinction. The source paragraph inside `<details>` shows even when the
details is closed in some renderings (the source is a sibling of `<summary>`
inside the `<details>`, so it's hidden when `details[open]` is false — but
visually, the open item is so tight that the source sits right next to
the next summary).

**Computed on the live page (1280 desktop):**
- `.faq__item`: `border: 0px none`, `padding: 0px`, `fontSize: 17px`,
  `bg: rgba(0,0,0,0)`.
- `.faq__q`: `fontWeight: 400`, `cursor: auto`, `padding: 0px`.
- `.faq__a`: `padding: 0px`, no visual treatment.

**Fix acceptance criteria:**
- Each `<details class="faq__item">` renders as a soft card (cream-bg with
  hairline border, matching `.pillar` or `.link-card`).
- The summary shows a chevron (▲/▼) on the trailing edge, bold weight, a
  minimum 48px hit area, and a visible focus ring.
- The answer has generous padding (≥ 16px on all sides) and clear separation
  from the next summary.
- The `מקור:` line is right-aligned, 13px, `var(--c-text-soft)`, with a
  margin-block-start to separate it from the answer.
- The whole page stays RTL-correct (chevron at the start in RTL, not the
  end).
- No JS changes; CSS-only fix.

### D5 — High · pillar author regex drops attribution on 2 of 7 pillars

**Repro (local 360, home page "עקרונות חינוך דמוקרטי" grid):**
- Pillars 1, 2, 3, 5, 6 show an attribution line ("פאולו פריירה",
  "יאנוש קורצ'אק, ילדות של כבוד", "שרה שדמי ווטרמן",
  "הווארד גרדנר", "רם והכט, דיאלוגים מעצימים בחינוך ההומניסטי").
- Pillars **4 (למידה פלורליסטית)** and **7 (שיתוף והשתתפות)** do not.

**Why (verified by running the JS regex against `content/philosophy.json`):**
- `assets/content.js:40` uses `body_he.match(/\(([^)]+)\)\s*$/)`, which
  only matches a parenthesized token that ends the string.
- Pillar 4 body ends `"...תשוקתנו\" (קן רובינסון)."` — period after the
  paren breaks the regex.
- Pillar 7 body ends `"...רשות מבקרת."` — no trailing paren at all
  (the "(יעקב הכט)" is mid-sentence, not at the end).

**Fix acceptance criteria:**
- All 7 pillars display a `.pillar__quote-author` with the correct
  attribution. Either:
  - (a) Add a separate `author` field to each pillar in
    `content/philosophy.json` and have `pillarCard()` read it (preferred —
    separates content from rendering, lets us drop the body-stripping
    regex), or
  - (b) Fix the regex to match the **last** parenthesized author even
    when followed by punctuation, and handle mid-sentence attributions
    separately.
- (a) is the right call: the data is already structured, the regex hack
  is fragile, and the JSON schema can require `author` on every pillar.
- Existing attributions must not be edited — they are quotes from the
  regulation PDF (`source: drive-regulation-pdf`).

### D6 — High · dead CSS for `.ai-chat-fab`, `.ai-chat-panel`, `.brand-dot`

**Repro:** inspect the live home page DOM. There is **no FAB**, **no
floating panel**, **no green decorative dot in the brand title**. The CSS
exists for all three; the JS never injects any of them, and the HTML
never references the brand-dot class.

`assets/styles.css:197-201`:
```css
.brand-dot {
  color: var(--c-leaf);
  font-size: 0.75em;
  line-height: 1;
}
```
`assets/styles.css:568-602`: full styles for `.ai-chat-fab` (fixed,
52px circle, `z-index: 50`) and `.ai-chat-panel` (fixed popover).

`assets/ai-chat.js:13-42` `renderShell()` only injects an inline
`<section class="ai-chat">`; no FAB, no panel.

This is a real defect only if the brief asks for them. The brief at
`docs/design/phase2-brief.md` is the source of truth (not loaded here);
the CSS comments and the chat-js state machine both assume a FAB exists.
So either:
- the brief asked for a FAB and the JS never delivered it (D6a, defect), or
- the brief didn't ask and the CSS is leftover from an earlier draft (D6b,
  dead code to delete).

**Fix acceptance criteria (whichever the brief says):**
- D6a: implement the FAB + popover panel in `ai-chat.js`, and inject the
  `<span class="brand-dot">·</span>` into `.site-title` in all 5 HTML
  routes. Update the chat to open the panel on FAB click, close on
  outside-click and Escape, and restore focus.
- D6b: delete `.ai-chat-fab` and `.ai-chat-panel` rules and the
  `.brand-dot` rule, and the corresponding JSDoc that references them.

Dalinar should confirm which path the brief specifies before Stage 2
implements either.

### D7 — Medium · `parents.html` nav omits "להורים חדשים"

**Repro:** open `parents.html` and compare the nav to the nav on any
other page. `parents.html:19-21` lists בית / רישום / צור קשר /
הנהגת הורים. The other 4 routes list all 5 (including להורים חדשים).

**Fix acceptance criteria:** `parents.html` nav has the same 5 items in
the same order as the other routes. One-line fix; same as Stage 0/1
nav baseline.

### D8 — Medium · `data-assaf-only` is dead code

**Repro:** open `parents.html` and look at the `<details
class="parents-admin" data-assaf-only>` block. It is rendered to every
visitor. The attribute name suggests "show only when Assaf is logged in"
but no CSS or JS reads it. The workflow is intentionally open ("edit
content/parents.json on GitHub" — no secret credentials), so showing
the editor steps to all visitors is fine. But the attribute name is
misleading.

**Fix acceptance criteria:** either
- (a) drop the `data-assaf-only` attribute from `parents.html:29` and
  add a comment in the HTML clarifying the workflow is public, or
- (b) wire the attribute to a real check (e.g. server-side auth — out of
  scope per the brief, do not pick this).

(a) is the right call here.

### D9 — Medium · duplicate `<h2>` on home page chat section

**Repro (live):** `https://democratic-school.pages.dev/` — the section
heading is "שאלות נפוצות" (from `<h2 id="assistant-heading">`), and
inside the same section the chat component renders a second h2,
"שאל אותנו" (from `ai-chat.js:17`). Screen-reader users hear two
section labels back to back, and the visual reading order is
"שאלות נפוצות" → "שאל אותנו" — both meaning "questions".

**Fix acceptance criteria:** the chat component's heading level adapts
to the host page. Simplest: change the component to render an `<h3>` (or
a `<p class="lede">` if no h2 is wanted). The header structure
(`<header class="ai-chat__header">`) can stay; only the tag changes.
This makes the heading hierarchy `h1` (none on home) → `h2`
"שאלות נפוצות" → `h3` "שאל אותנו". If a route embeds the chat without
an enclosing section, the component can detect a missing section and
fall back to h2.

## What is NOT a defect (so Stage 2 doesn't redo it)

These were checked and are correct as shipped:

- **Contrast** — every text/background pair that the audit could measure
  passes WCAG AA-normal. The only AA-large case (`.btn--primary:hover`
  white on brand-blue) is allowed because the button is 17px / 700
  (qualifies as "bold"). The 1.28:1 and 1.04:1 edge cases for the focus
  ring on dark surfaces are already fixed by `adbc0e5`.
- **Horizontal overflow at 360px** — `document.documentElement.scrollWidth -
  document.documentElement.clientWidth === 0` on every route.
- **Keyboard focus ring** — confirmed 3px solid ring on the dark header
  band (white override) and the pink hero CTA. Real `Input.dispatchKeyEvent
  Tab` lands on a nav anchor with a visible ring.
- **Nav active state** — `aria-current="page"` correctly highlights the
  current page link on every route.
- **Disabled link card treatment** — WhatsApp/Padlet show as
  `aria-disabled="true"` pink pill with a "בקרוב" status badge; the URL is
  `null` and the JS does **not** generate one. Per the project doc,
  Assaf has not supplied these URLs; the placeholder treatment is
  correct.
- **CSP** — `_headers` ships a strict CSP (`default-src 'self'`,
  `frame-ancestors 'none'`, etc.) plus HSTS and Permissions-Policy.
- **XSS posture** — `assets/content.js` uses `textContent` for every
  user-supplied string. The `<ai-chat>` component's innerHTML template
  is static markup, not user content. The `setJsonLd` writes a JSON
  object built from a controlled `faq.json` (also static).
- **`scripts/validate-parents.py`** — runs cleanly with `jsonschema`
  installed; `parents.json` validates against the schema.
- **Live vs local parity** — the live canonical URL serves the same HTML
  and CSS as the local dev server for every route in this branch.
  Differences are environmental (Functions handler exists on live, not
  local), not content.

## Stage 2 (Kaladin) handoff — bounded first pass

Scope for `t_e390d91b` after Dalinar review of this audit:

**Must-fix (D1 + D3 + D4 + D5 — covers the biggest user-visible wins):**
- D1: fix chat status probe; show dormant copy on live, no form. Add a
  browser smoke test that fetches `/api/chat` GET on the home page and
  asserts the form is hidden.
- D3: reduce hero h1 to `var(--fs-600)` at ≤ 480px.
- D4: write the missing `.faq__*` CSS for the accordion.
- D5: add an `author` field to each pillar in `content/philosophy.json`
  and update `pillarCard()` to read it (no regex stripping). Validate via
  an extended `validate-pillars.py` or extend the FAQ validator pattern.

**Should-fix (D2 + D7 + D8 + D9 — small mechanical wins):**
- D2: drop site-title to `var(--fs-400)` at ≤ 480px.
- D7: add the missing nav link to `parents.html`.
- D8: drop the `data-assaf-only` attribute; add an explanatory comment.
- D9: change the chat component's inner heading from h2 to h3.

**Decide before coding (D6):**
- D6: Dalinar confirms with the brief whether the FAB + brand-dot are in
  scope. If yes, Kaladin implements them. If no, Kaladin deletes the
  dead CSS.

**Out of scope for this pass (backlog):**
- Replace the regex-based pillar author with structured JSON for the
  FAQ items too (currently `faq.json` is already structured, so this
  is a non-issue; flagging in case future pages regress).
- Migrate the local dev `python -m http.server` to `wrangler pages dev`
  so `/api/chat` returns 503 locally (not 404). This is a dev-tooling
  improvement, not a site defect.
- Ship the `jsonschema` dev dependency. `package.json` should add
  `jsonschema` (or a `requirements-dev.txt`) so `npm run validate:parents`
  doesn't fail on a clean machine.
- Hardening of the contact `dl` block on `contact.html` vs the home
  contact strip: the markup is the same; both render fine. Not a defect.
- The `_headers` HSTS `max-age=31536000; includeSubDomains; preload` is
  fine for a non-custom-domain `pages.dev` host, but Assaf should add
  the canonical host to the HSTS list if/when a custom domain is wired.

## Verifications Stage 2 must run before reporting done

1. `python3 -c "import json; json.load(open('content/<each>.json'))"` for
   every JSON file (catches JSON regressions introduced by the author
   field).
2. `python3 scripts/validate-parents.py` exits 0.
3. `node` not present in repo — no JS lint to run. (Plain JS, no
   bundler.) If `node` is added for tests, also lint `assets/*.js`.
4. New: a `scripts/validate-content.py` that asserts every
   `content/philosophy.json` pillar has an `author` field with length
   1–80 (matches the FAQ author pattern).
5. A Playwright (or `chromium-headless`) smoke test that:
   - visits every route at 360 × 740 and asserts
     `scrollWidth === clientWidth` and the document body is non-empty;
   - visits the home page at 360 and asserts the hero h1 height is
     `<= 120px` (≈ 3 lines at the new `--fs-600` size);
   - visits the home page and asserts `document.getElementById('ai-chat-form').hidden === true`;
   - visits `new-parents.html` and asserts the first `.faq__item` has
     `padding > 0` and a `border` style (i.e. the accordion is now
     styled).
6. Manual before/after screenshots at 360 and 1440 for the home page
   hero, the FAQ page, and the chat section.

## Cost

- **Estimate:** $1.20 of the $1.50 budget. The remaining $0.30 covers a
  Playwright smoke test and a small CSS audit script.
- **Hard ceiling:** $5; the entire bounded pass fits comfortably.

## Honest limits

- I could not read the live `pages.dev` site via `curl` from the worker
  shell (security guard blocks `.dev` TLD). All live evidence was
  collected via the browser tool. The browser evidence is consistent
  with what `python -m http.server` of the same worktree serves, except
  for `/api/chat` (live returns 405 + `post_only`; local returns 404).
- I did not load `docs/design/phase2-brief.md` in this run; the FAB and
  brand-dot decisions (D6) are flagged for Dalinar to confirm against the
  brief rather than guessed.
- I did not run `npx wrangler pages dev` to verify the Functions handler
  locally — it is out of scope for a read-only audit and not required to
  make the bounded-pass recommendations.
- I did not test the `prefers-reduced-motion` path explicitly; the CSS
  rule ships correctly and the page has no animations to disable.

---

*Audit complete. Stage 2 implementation can begin once Dalinar confirms D6
direction and reviews the rest. Total Stage 1 spend ≈ $0.40 of the $1.50
estimate; remaining budget reserved for Stage 2 (Kaladin).*
