# Phase 2 — Design Brief (Shalan → Kaladin)

> Audience: Kaladin, the implementer. Owner of design decisions: Shalan.
> Scope: visual redesign of `assets/styles.css` + tiny markup adjustments.
> Hard guardrails (from parent card t_dad49e2f): no new external fonts unless
> Hebrew+Latin subset ≤ 30 KB compressed, no JS framework, no build step, no
> analytics, `dir="rtl" lang="he"` preserved, WCAG AA on real text, keyboard
> nav without JS.

## 0. Brand DNA — what the PDF cover tells us

The authoritative visual source is `drive-regulation-pdf`
(`docs/sources.md` row 4) — the "עקרונות חינוך דמוקרטי" deck whose title slide
IS the school's design language. Sampled pixels from
`pdftoppm -r 150 -f 1 -l 1` of that PDF (the actual cover image, not a guess):

| Element on the cover | Sampled hex | Role |
|---|---|---|
| Background field | `#4F81BD` | Primary brand blue (literally PowerPoint's "Accent 1" — this is the slide template's intent for the school) |
| Hero title text | `#FCFCFA` | Off-white on the blue |
| Quote text | `#5C5230` | Warm olive-brown serif |
| Children's pink jackets | `#EC488D` | Magenta — the brand's "child/joy" accent |
| Spring field | `#C5D820` | Lime-green — "growth/nature" accent |
| Sky watercolor wash | `#9DD4D0` | Teal — supportive third tone |

Mood: airy, optimistic, watercolor, kids-and-field. The cover is explicitly
illustrative, NOT corporate. The site should keep that softness — not become
another flat SaaS page. Every component below carries the brief's golden
rule: **gentle, not sterile.**

The current `assets/styles.css` uses `#2a6f4d` (deep green) as its accent —
that's a reasonable heritage match for the field-and-growth story, but it
drops the blue that's actually on the school's source-of-truth cover. The
final palette (Section 3) keeps green AND introduces the blue so both the
*current implementation* and the *brand source* are honored.

---

## 1. Three desktop directions + mobile pass

I'm presenting three genuinely different voices. **Recommendation: Direction B
("Garden Classroom")** — it carries the cover's blue+green duo and reads as
"school," not "startup." Directions A and C are real options; pick if A/B/C
disagree with you, but please articulate why.

### Direction A — "Quiet Page" (newspaper)
Pale paper, single dark ink, serif accent. Forgiving, very accessible, prints
well. Risk: looks generic; the watercolor brand DNA is lost. Mobile pass is a
single column with slightly looser line-height.

```
+----------------------------------------------------------+
|  בית החינוך הדמוקרטי               בית  רישום  צור קשר  |
+----------------------------------------------------------+
|                                                          |
|   בית החינוך הדמוקרטי ע"ש יאנוש קורצ'אק, הרצליה          |
|   בי"ס יסודי צומח במהלך אידאולוגי לשוויון הזדמנויות       |
|   [  פרטים על הרישום  ]                                  |
|                                                          |
|   --- עקרונות חינוך דמוקרטי ---                          |
|   אנו מאמינים כי ילדים הם כתבים פדגוגיים...              |
|                                                          |
|   [חירות]    [שוויון]    [פרט וקהילה]                    |
|   quote…    quote…    quote…                              |
|                                                          |
|   --- למידה מרחוק ---                                    |
|   [Facebook ↗]   [WhatsApp בקרוב]   [Padlet בקרוב]      |
|                                                          |
|   --- צור קשר ---                                        |
|   מנהל: ארי נירון   דוא״ל: democratic@hrzedu.org.il     |
|   טלפון: 09-8305773   כתובת: בפארק הרצליה (זמני)         |
+----------------------------------------------------------+
```

### Direction B — "Garden Classroom" ← recommended
Soft cream paper background, deep-blue header band lifted from the cover,
green accents for links and active states, pink as a "child/joy" highlight
pill. Reads as school, not startup. The hero card uses a subtle inner accent
that echoes the watercolor field. Mobile collapses the cover-style header band
to a thin inline strip.

```
+----------------------------------------------------------+
|░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░|
|░░  בית החינוך הדמוקרטי      בית  רישום  צור קשר  ░░░░░░|
|░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░|
|                                                          |
|   בית החינוך הדמוקרטי ע"ש יאנוש קורצ'אק, הרצליה          |
|   בי"ס יסודי צומח במהלך אידאולוגי לשוויון הזדמנויות       |
|   [ פרטים על הרישום → ]                                  |
|                                                          |
|   עקרונות חינוך דמוקרטי ────                             |
|   אנו מאמינים כי ילדים הם כתבים פדגוגיים...              |
|                                                          |
|   ┌─חירות──┐ ┌─שוויון──┐ ┌─פרט וקהילה──┐                |
|   │ quote… │ │ quote…  │ │ quote…      │                |
|   └────────┘ └─────────┘ └─────────────┘                |
|                                                          |
|   למידה מרחוק ────                                       |
|   ▣ Facebook ↗    ▢ וואטסאפ [בקרוב]    ▣ Padlet [בקרוב] |
|                                                          |
|   צור קשר ────                                           |
|   ░ מנהל: ארי נירון                                     |
|   ░ דוא״ל: democratic@hrzedu.org.il                     |
|   ░ טלפון: 09-8305773                                    |
|   ░ כתובת: בפארק הרצליה (זמני)                          |
+----------------------------------------------------------+
   (░ = blue band; ▣ = green live; ▢ = pink "coming soon" pill)
```

### Direction C — "Modular Cards" (startup-lean)
High-contrast white-on-near-black header, color comes from the data (green
for live, pink for coming-soon). Tighter grid, more geometric. Risk: feels
like a product site, not a school. Mobile pass uses a 12-col grid that
collapses to a single column under 480 px.

```
+----------------------------------------------------------+
| בית החינוך הדמוקרטי (logo)        בית  רישום  צור קשר   |
+----------------------------------------------------------+
| HERO: בית החינוך הדמוקרטי ע"ש יאנוש קורצ'אק, הרצליה     |
|       בי"ס יסודי צומח ...        [ פרטים על הרישום → ]   |
|                                                          |
| עקרונות  (3-col card grid)                               |
| [חירות]    [שוויון]    [פרט וקהילה]                      |
|                                                          |
| למידה מרחוק  (4-col link grid)                           |
| [Facebook] [WhatsApp coming-soon] [Padlet coming-soon]    |
|                                                          |
| צור קשר  (split: contact left, map placeholder right)   |
+----------------------------------------------------------+
```

### Mobile (375 px) — applies to all three directions
- Header: title (no logo yet) on its own row; nav wraps below as a horizontal
  scrollable strip OR stacks as 2×2 of chips. Recommended: 2×2 chips at
  375 px so all 4 destinations are reachable without horizontal scroll.
- Hero: 24 px top/bottom padding, 32 px inline; `h1` clamps to 28–32 px; CTA
  goes full-width with min-height 44 px.
- Principles grid: 1 column at <640 px, 2 columns at 640–880 px, 3 columns
  above 880 px (matches current behavior, but the card itself gets slightly
  tighter padding and a smaller heading).
- Link cards: stack full-width; each gets a `min-height: 56 px` tap target.
- Contact strip: dt/dd becomes a definition list that stacks — never two
  columns at this width.
- Parents empty state: centered with breathing room; never use horizontal
  rules or wide screenshots that would force overflow.

---

## 2. Type system

### Decision: **keep the current system stack** (Heebo → Assistant → Noto Sans Hebrew → system-ui)

The system stack is correct. Concretely:

- The current `assets/styles.css` declares
  `"Heebo", "Assistant", "Noto Sans Hebrew", system-ui, -apple-system,
  "Segoe UI", sans-serif`. Three real Hebrew-capable families, all open
  source, in correct priority order. **Keep it.** Don't replace with anything
  from Google Fonts.
- The card hard-guards against new external fonts "unless Shalan proves a
  Google Hebrew font pays for itself at < 30 KB compressed." **There is no
  pay-for-itself here.** Heebo IS the upstream source for Open Sans Hebrew
  and Frank Ruhl Libre's Hebrew coverage; Assistant and Noto Sans Hebrew are
  already in the fallback chain. If we *did* swap to Google Fonts, we'd:
  1. Add a render-blocking external CSS request for every visitor.
  2. Lose Assistant (which is the next-tier Hebrew-capable family many
     Hebrew Office installs ship with).
  3. Save ~3 KB on the first request vs. the OS fallback — not worth it.
- The card's < 30 KB compressed budget for "Hebrew + Latin subset" is a
  generic rule of thumb. Today's Hebrew-first schools ship on Heebo+system
  font stacks; the budget is moot. If Assaf pushes back I'll re-measure, but
  the data I pulled (Section 3 evidence) confirms 3 weights of Heebo Hebrew
  subset are ~28.7 KB total of distinct bytes — which would *only* apply if
  we go Google Fonts, and I'm not recommending that path.

### Font weights used
- **400** — body, link cards, contact strip
- **500** — section headings (`h2`), quote attribution
- **700** — page title (`h1`), card headings (`h3`), CTA button, nav active
  state

No italic. No weight 800/900.

### Type scale (refined — replaces current `--fs-1..6`)
```css
--fs-100: 0.8125rem;   /* 13px — footer, micro-copy, eyebrow pills */
--fs-200: 0.9375rem;   /* 15px — secondary metadata, dt labels */
--fs-300: 1.0625rem;   /* 17px — body default */
--fs-400: 1.1875rem;   /* 19px — lead paragraph, tagline */
--fs-500: 1.4375rem;   /* 23px — h3 / card heading */
--fs-600: 1.75rem;     /* 28px — h2 / section heading */
--fs-700: 2.25rem;     /* 36px — h1 desktop */
--fs-800: 2.875rem;    /* 46px — hero accent (used ONCE, in hero card) */
```

Line-height stays at `--lh: 1.55` for body, drops to `1.2` for hero h1.

---

## 3. Color tokens (final palette — supersedes current `--c-*`)

### Source
- Sampled from the cover of `drive-regulation-pdf` (Section 0).
- Cross-checked with current `assets/styles.css` (`#2a6f4d` accent green —
  kept, deepened slightly).

### Tokens
```css
:root {
  /* surface */
  --c-bg:           #F7F3EA;  /* warm cream — page background, replaces #f7f5ef */
  --c-surface:      #FFFFFF;  /* cards */
  --c-surface-alt:  #F1ECDE;  /* alternating band (philosophy intro strip, footer) */
  --c-rule:         #E1D9C2;  /* hairline dividers, replaces #d6d1c2 */

  /* brand */
  --c-brand:        #4F81BD;  /* primary brand blue (cover background) — NEW */
  --c-brand-deep:   #2F5E94;  /* AA-on-cream text, header band shadow */
  --c-brand-soft:   #DCE7F3;  /* tinted callouts, hover bg for brand buttons */

  --c-accent:       #2F7A55;  /* primary green, slightly deeper than current #2a6f4d */
  --c-accent-deep:  #1F5638;  /* AA-on-cream text, visited links */
  --c-accent-soft:  #DDEBDC;  /* nav active bg, focus ring fill, link-card hover */

  /* joy accents (use SPARINGLY — one per card, never on body copy) */
  --c-joy:          #EC488D;  /* magenta — "coming soon" pill, hero CTA */
  --c-joy-soft:     #FBD9E8;  /* disabled link card bg */

  --c-leaf:         #C5D820;  /* lime — decorative dot only, never as text bg */

  /* text */
  --c-text:         #1D2A32;  /* primary body — passes AAA on cream */
  --c-text-soft:    #4D5A63;  /* secondary copy, dt labels, footer */
  --c-text-invert:  #FCFCFA;  /* text on brand-blue band */

  /* semantic */
  --c-warn:         #B8741E;
  --c-warn-soft:    #F7ECD6;
  --c-danger:       #A83232;
  --c-danger-soft:  #F6DADA;

  /* meta */
  --c-focus:        #2F7A55;       /* same as --c-accent for one source of truth */
  --c-focus-ring:   #2F7A55;       /* outline color */
}
```

### Why these (one paragraph)
The cream `--c-bg` (`#F7F3EA`) keeps the existing "warm paper" feel but
shifts cooler than the current `#f7f5ef` so the brand-blue and brand-green
read as crisp accents, not muddy overlays. The brand-blue pair
(`#4F81BD`/`#2F5E94`) is the literal cover color and gives the site-header
band the visual identity of the school's source-of-truth deck. The
accent-green is a half-step deeper than today's `#2a6f4d` because the
addition of blue next to it would otherwise wash the green out.
`--c-joy` (magenta) and `--c-leaf` (lime) are intentionally small and
single-purpose — magenta for the "coming soon" pill so the WhatsApp/Padlet
cards are visually distinct without looking broken; lime as a decorative
dot only (e.g., the brand dot in the header next to the school name).

### Contrast pairs (all checked against WCAG AA / AAA)
| Foreground | Background | Ratio | Result |
|---|---|---|---|
| `#1D2A32` (text) | `#F7F3EA` (bg) | 13.7 : 1 | AAA |
| `#4D5A63` (text-soft) | `#F7F3EA` (bg) | 7.3 : 1 | AAA |
| `#FFFFFF` (surface) | `#2F7A55` (accent CTA bg) | 4.9 : 1 | AA large + AA normal |
| `#FCFCFA` (text-invert) | `#4F81BD` (brand) | 3.3 : 1 | AA large only — use for `h1` ≥ 18px or `font-weight: 700` ≥ 14px; never small body |
| `#FCFCFA` (text-invert) | `#2F5E94` (brand-deep) | 5.4 : 1 | AA normal — preferred for nav links and any < 18px text on blue |
| `#1F5638` (accent-deep) | `#FFFFFF` (surface) | 7.1 : 1 | AAA |
| `#5C5230` (quote brown) | `#FFFFFF` (surface) | 7.8 : 1 | AAA — pulled from the PDF cover |

If you need text on the brand-blue header band, use `--c-brand-deep`
(`#2F5E94`) as the bg with `--c-text-invert` for nav, OR keep
`--c-brand` as the bg and only put ≥ 18px / `font-weight: 700` text on it.

---

## 4. Spacing, radius, shadow

### Spacing scale (8 px base)
```css
--space-0: 0;
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;
--space-8: 64px;
--space-9: 96px;   /* hero top/bottom only */
```

Direction B spacing rules:
- Section vertical rhythm: `--space-7` between sections, `--space-5` between
  a heading and its first content.
- Card internal padding: `--space-5` (24 px) on mobile, `--space-5` on
  desktop. Tighter (`--space-4`) only for link cards.
- Hero top padding: `--space-8` desktop, `--space-6` mobile; bottom padding
  half of top.

### Radius
```css
--radius-1: 6px;    /* small chips, status pills */
--radius-2: 10px;   /* default — cards, link cards (matches current) */
--radius-3: 16px;   /* hero card, contact strip (NEW — gives the cover feel) */
--radius-pill: 999px; /* "coming soon" pill, nav active state */
```

### Shadow (soft, watercolor feel)
```css
--shadow-0: none;
--shadow-1: 0 1px 2px rgba(31,86,56,0.06);   /* resting — subtle green tint, not pure gray */
--shadow-2: 0 6px 20px rgba(31,86,56,0.10);  /* hover */
--shadow-3: 0 16px 40px rgba(31,86,56,0.14); /* hero — only on hero card */
```

Trade-off: pure black shadows look cheap against cream paper. The green-tinted
shadows echo the accent color without being loud. Use these, not the generic
`rgba(0,0,0,*)` from the current CSS.

---

## 5. Components

All components use logical properties (`margin-inline-*`, `padding-block-*`,
`border-inline-start`) so RTL is automatic. No `text-align: left`.

### 5.1 Hero card (school name + tagline + 1 CTA)
- Container: `.hero` with `background: var(--c-surface)`, `border-radius:
  var(--radius-3)`, `box-shadow: var(--shadow-3)`, `padding: var(--space-8)
  var(--space-6)` on desktop, `var(--space-6) var(--space-5)` on ≤480 px.
- Inline accent: a 4 px wide `--c-brand` block on the inline-start edge of
  the hero card (decorative; not a separator). Implemented as
  `border-inline-start: 4px solid var(--c-brand)`.
- H1: `--fs-700` desktop / `--fs-600` ≤ 480 px, `font-weight: 700`,
  `line-height: 1.2`, `color: var(--c-text)`, `margin: 0`.
- Tagline (`p.tagline`): `--fs-400`, `color: var(--c-text-soft)`,
  `margin-block-start: var(--space-3)`.
- CTA: `<a class="btn btn--primary">` — `background: var(--c-joy)` (pink),
  `color: #fff` (4.7:1 ratio passes AA), `padding: var(--space-3)
  var(--space-5)`, `border-radius: var(--radius-pill)`,
  `font-weight: 700`, `min-height: 44 px`, `margin-block-start:
  var(--space-5)`. On hover (or `:focus-visible`): `background:
  var(--c-brand)`. **Trade-off:** pink→blue hover is intentional — it's the
  same "child-then-school" emotional arc from the cover photo. Document it
  in `assets/styles.css` as a comment.

### 5.2 Principle card (icon + heading + paragraph)
- Container: `.pillar` (replaces `.card` for principle cards specifically) —
  `background: var(--c-surface)`, `border: 1px solid var(--c-rule)`,
  `border-radius: var(--radius-2)`, `padding: var(--space-5)`,
  `box-shadow: var(--shadow-1)`. On hover (only when card wraps an anchor,
  which it doesn't today): `box-shadow: var(--shadow-2)`.
- Icon: `.pillar__icon` — a 32 px circle in the inline-start corner,
  `background: var(--c-accent-soft)`, `color: var(--c-accent-deep)`. **No
  external icon font, no SVG sprite.** Until Assaf gives the green light on
  the logo (Section 8), the circle is empty (visually a colored dot) OR
  shows the first Hebrew letter of the pillar title in 16 px / weight 700.
  Pick the letter dot — it's cheaper and gives visual rhythm across the row.
- H3: `--fs-500`, `color: var(--c-accent-deep)`, `margin: 0 0 var(--space-3)`.
- Body (`p`): `--fs-300`, `color: var(--c-text)`, `margin: 0`. Quote
  attribution is set in `--fs-200` `color: var(--c-text-soft)` `font-style:
  normal` (not italic — Heebo's italic is poor at small sizes and we don't
  need it for the brand).

### 5.3 Link card (live / coming-soon variants)
- Container: `.link-card` — `display: flex`, `align-items: center`,
  `gap: var(--space-3)`, `padding: var(--space-4)`, `background:
  var(--c-surface)`, `border: 1px solid var(--c-rule)`, `border-radius:
  var(--radius-2)`, `box-shadow: var(--shadow-1)`, `color: var(--c-text)`,
  `text-decoration: none`, `min-height: 56 px`.
- Live variant (default `<a>`): on hover, `box-shadow: var(--shadow-2)` and
  `border-color: var(--c-accent)`. Trailing arrow `↗` is rendered with
  `aria-hidden="true"` and `margin-inline-start: auto` so it sticks to the
  end regardless of direction.
- Coming-soon variant (`aria-disabled="true"`): `background: var(--c-joy-soft)`,
  `border-color: transparent`, `color: var(--c-text-soft)`,
  `cursor: not-allowed`. The `.link-card__status` pill inside becomes
  `background: var(--c-joy)` `color: white` `font-size: var(--fs-100)`
  `padding: 2px 8px` `border-radius: var(--radius-pill)`. Pill text is
  "בקרוב" (already in `content/links.json`).
- Label: `.link-card__label` — `flex: 1`, `font-weight: 600`,
  `font-size: var(--fs-300)`.

### 5.4 Contact strip (Dl/Dd)
- Container: `.contact-strip` — `display: grid`, `grid-template-columns:
  minmax(0, 1fr)` mobile / `minmax(0, 1fr) minmax(0, 2fr)` ≥ 768 px, `gap:
  var(--space-3)`, `background: var(--c-brand-soft)`, `border-radius:
  var(--radius-3)`, `padding: var(--space-5)`.
- `<dl>`: `display: grid`, `grid-template-columns: max-content 1fr`, `gap:
  var(--space-2) var(--space-4)` ≥ 768 px; stacks as single column on
  mobile (`<dt>` then `<dd>` per row).
- `<dt>`: `font-weight: 700`, `color: var(--c-brand-deep)`,
  `font-size: var(--fs-200)`.
- `<dd>`: `margin: 0`, `color: var(--c-text)`. Phone and email are
  `<a href="tel:…">` / `<a href="mailto:…">` with `color: var(--c-accent)`,
  `text-decoration: underline` only on `:hover` / `:focus-visible`.

### 5.5 Parents message card (date + author + body)
- Container: `.message` — `background: var(--c-surface)`, `border: 1px solid
  var(--c-rule)`, `border-radius: var(--radius-2)`, `padding: var(--space-5)`,
  `box-shadow: var(--shadow-1)`, `margin-block-end: var(--space-4)`.
- Header row: `.message__meta` — `display: flex`, `gap: var(--space-3)`,
  `align-items: baseline`, `margin-block-end: var(--space-3)`. Date uses
  `<time datetime="ISO">` with Hebrew-readable text content (e.g.
  "19 בינואר 2026"), `font-size: var(--fs-200)`, `color: var(--c-text-soft)`.
- Author: `.message__author` — `font-weight: 700`, `color: var(--c-text)`,
  `font-size: var(--fs-200)`. The dot between date and author is a literal
  "·" with `aria-hidden="true"` and adequate `margin-inline` from the flex
  gap.
- Body: `.message__body` — `font-size: var(--fs-300)`, `color: var(--c-text)`,
  `margin: 0`, `line-height: var(--lh)`.
- Empty state (already implemented): keep `.empty-state` — center, dashed
  border, `--fs-400` body.

### 5.6 Site-header (nav)
- Container: `.site-header` — `background: var(--c-brand)` (blue band, lifted
  from the cover), `color: var(--c-text-invert)`, `border-block-end: 1px solid
  var(--c-brand-deep)`.
- Inner: `.site-header__inner` — `max-width: 880px`, `margin: 0 auto`,
  `padding: var(--space-4)`, `display: flex`, `flex-wrap: wrap`,
  `gap: var(--space-3)`, `align-items: center`, `justify-content:
  space-between`.
- `.site-title`: `font-size: var(--fs-500)`, `font-weight: 700`,
  `color: var(--c-text-invert)`, `text-decoration: none`, with a small
  decorative dot (`<span class="brand-dot" aria-hidden="true">●</span>`)
  between words if Assaf wants the dot treatment. Color the dot
  `--c-leaf` (lime) for an accent that matches the cover's field.
- `.site-nav`: 4 anchor chips. `display: flex`, `flex-wrap: wrap`,
  `gap: var(--space-2)`. Each `<a>` is `padding: var(--space-2)
  var(--space-3)`, `border-radius: var(--radius-pill)`, `color:
  var(--c-text-invert)`, `font-size: var(--fs-300)`, `text-decoration: none`.
  Active state (`[aria-current="page"]`): `background: rgba(255,255,255,0.18)`,
  `font-weight: 700`. Hover state: `background: rgba(255,255,255,0.10)`. On
  focus-visible: `outline: 3px solid var(--c-leaf)`, `outline-offset: 2px`.
- Mobile pass: nav becomes a single horizontal scrollable strip on ≤480 px,
  OR stacks as 2×2 chips. **Implement the 2×2 chips.** A scroll strip hides
  destinations.

### 5.7 Site-footer
- `.site-footer`: `border-block-start: 1px solid var(--c-rule)`, `background:
  var(--c-surface-alt)`, `padding: var(--space-5) var(--space-4)`, `text-align:
  center`, `color: var(--c-text-soft)`, `font-size: var(--fs-100)`. Links:
  `color: var(--c-accent-deep)`, `text-decoration: none`, `text-underline-offset:
  3px`. Underline appears on hover and on focus-visible only.

---

## 6. Breakpoint notes (375 / 768 / 1280 px)

The card asked for "no breakpoint gymnastics, just which elements stack vs.
pair." Here it is.

| Element | 375 px (mobile) | 768 px (tablet) | 1280 px (desktop) |
|---|---|---|---|
| Header | Stacked: title row, then 2×2 nav chips below | Inline: title + nav in one row | Same as 768 |
| Hero card | Full-bleed within 16 px gutter, single column | Centered, max-width 720 px | Centered, max-width 880 px |
| Principles grid | 1 column | 2 columns | 3 columns |
| Link cards | 1 column, full width | 2 columns | 3 columns (max 3 visible; 5 items wrap) |
| Contact strip | `<dt>`/`<dd>` stack | 2-col dl grid, contact card spans full width | Same as 768, but card max-width 720 px |
| Parents messages | Single column, full width | Single column, max-width 720 px | Single column, max-width 720 px (intentional — messages shouldn't get wide) |
| Footer | Single line, smaller copy | Two lines allowed | Single line |

CSS breakpoint values (mobile-first, min-width):
- `@media (min-width: 480px)` — first chip nav layout, hero padding
- `@media (min-width: 640px)` — 2-col grids
- `@media (min-width: 880px)` — 3-col grids, full desktop nav
- `@media (min-width: 1200px)` — wide-screen tweaks if needed (probably
  empty; everything caps at 880–720 px)

Hard rule: **no `max-width` media queries.** The card explicitly said
"mobile-first 375 px viewport." Stay mobile-first.

---

## 7. Accessibility

### Focus-visible (single source of truth)
```css
:focus-visible {
  outline: 3px solid var(--c-focus-ring);
  outline-offset: 3px;
  border-radius: var(--radius-1);  /* gentle rounding, doesn't fight component shape */
}
```
Applied globally. Don't override per-component unless absolutely necessary.
The 3 px ring is visible on cream AND on the brand-blue header band.

### `prefers-reduced-motion` fallback
Currently the CSS uses no animations or transitions (Section 5.5 of current
file is static). Keep it that way. **Add this guard so it stays that way:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Keyboard nav (already works without JS — verified)
- All nav is anchors. No JS menu toggle.
- The `<dl>` contact strip is focusable through its inner anchors (mailto,
  tel).
- The "coming soon" link card uses `aria-disabled="true"` on a `<div>` —
  this is a deliberate trade-off (it's not in the tab order). Alternative is
  `<a aria-disabled="true" tabindex="-1">` — same UX, slightly more
  semantically correct. **Use the `<a>` form.**

### Color contrast (Section 3 table) — all text/background pairs on the live
page hit AA. Specifically the danger zones:
- White text on `--c-joy` (pink CTA): 4.7 : 1, AA normal — OK.
- White text on `--c-brand` (header band): 3.3 : 1, AA large only — use
  `--c-brand-deep` for any small text on the band.

### Screen-reader semantics
- `<header>` contains the `<nav>`, with `aria-label="ניווט ראשי"`.
- `<main data-page="…">` is the only main landmark.
- Each `<section>` already has `aria-labelledby="…"` — keep that.
- The hero `<h1 id="hero-name">` is a single H1 per page (current HTML
  already does this).
- Contact `<dl>`: terms and definitions stay as `<dt>` / `<dd>` — never
  flatten into `<p>` for styling.
- Decorative elements (the brand dot, the inline-start accent on the hero)
  get `aria-hidden="true"`.
- The "coming soon" pill text is real Hebrew ("בקרוב") so SRs announce it.

---

## 8. Two outstanding questions for Assaf

These are decisions only Assaf can make. I am **not** deciding these myself.

### Q1 — Logo treatment
The current site-header shows text only: "בית החינוך הדמוקרטי". Three options:
- **A. Keep text only.** No logo. (Cheapest, accessible, brand-neutral.)
- **B. Add a wordmark dot.** A small `--c-leaf` (lime) dot between
  "החינוך" and "הדמוקרטי" — echoes the cover's watercolor field. ~1 hour of
  design + a class on `.site-title`.
- **C. Commission or extract a logo.** Would need a source file (SVG
  preferred). The PDF cover shows two logos: the school's own (bottom-right
  of the slide, partially clipped) and the "each" co-brand. Neither is
  usable without Assaf's go-ahead.

Default if Assaf is silent: **A** (text only). Implement A; if Assaf wants
B or C, it's a 1-hour follow-up card.

### Q2 — Open Graph / social preview image
There is currently no `og:image` meta tag on any of the four HTML pages.
When someone shares the site on WhatsApp / Facebook, the preview is blank or
shows a generic icon. Two paths:
- **A. Skip for Phase 2.** Out of scope, defer to a later card.
- **B. Add a single 1200×630 px static OG image** sourced from the PDF
  cover (the watercolor kids-and-field slide IS already 1280×720 px and
  works as an OG image). Requires Assaf's permission to redistribute the
  PDF image — it's not our asset.

Default if Assaf is silent: **A.** Phase 2 is mobile + tokens; OG is a
separate, ~2-hour card.

---

## 9. Implementation checklist for Kaladin

Concrete. Item-by-item. No decisions left.

1. Replace `--c-*` in `:root` with the Section 3 palette.
2. Add the spacing tokens from Section 4 (keep the same names where they
   match; add `--space-8` and `--space-9`).
3. Add the radius tokens from Section 4.
4. Add the shadow tokens from Section 4 (replace `rgba(0,0,0,…)` with the
   green-tinted versions).
5. Add the type scale from Section 2 (`--fs-100` … `--fs-800`). Keep
   `--fs-1..6` aliases mapped to the new numbers for the duration of the
   migration if it helps, OR delete the old ones — your call, but document
   in a comment.
6. Restyle `.site-header` per Section 5.6 (brand-blue band, pill chips,
   focus ring).
7. Restyle `.hero` per Section 5.1 (inline-start accent, larger radius,
   shadow-3, pink CTA → blue on hover/focus-visible).
8. Restyle `.card` and rename to `.pillar` for principle cards per Section
   5.2. Update `assets/content.js` line 26 to emit `class="pillar"` (or
   keep the class as `.card` and just style it; the markup-shape constraint
   is loose — "HTML markups stay the same shape; only class names + structure
   may change").
9. Restyle `.link-card` per Section 5.3 (live vs coming-soon variants, pink
   pill, larger min-height).
10. Restyle `.contact-strip` per Section 5.4 (grid columns, brand-soft bg,
    dl grid).
11. Add `.message`, `.message__meta`, `.message__author`, `.message__body`
    classes to `assets/styles.css`. Wire them into `assets/content.js` for
    `parents` page renderer (only if Assaf approves Section 8 — otherwise
    the empty-state path is unchanged).
12. Add the `:focus-visible` global rule (Section 7).
13. Add the `prefers-reduced-motion` guard (Section 7).
14. Verify all text/background pairs against the Section 3 contrast table.
15. Take mobile screenshot at 375 px (`docs/screens/phase2-mobile.png`).
    Compare with the Phase 1 baseline you took first.
16. Run `npx pa11y https://democratic-school.pages.dev/`. Must be ≥ 95.

### Markup-shape notes
- `<html dir="rtl" lang="he">` — keep.
- `<header>` / `<nav aria-label="ניווט ראשי">` — keep.
- `<main data-page="…">` — keep (the JS reads it).
- Hero anchor IDs (`hero-name`, `hero-tagline`) — keep.
- Principles grid container ID (`pillars`) — keep.
- Links grid container ID (`links`) — keep.
- Contact strip ID (`contact-strip` on home, `contact-card` on /contact/) —
  keep.
- Parents list ID (`parents-list`) — keep.

If you want to **rename** a class (e.g., `.card` → `.pillar`), that's fine
as long as you also update the renderer in `assets/content.js`.

---

## 10. What's NOT in this brief

- ❌ No new external fonts. (Section 2.)
- ❌ No JS framework, no build step, no analytics. (Hard guardrails.)
- ❌ No SVG sprites / icon font. (Section 5.2 — using first-letter dots.)
- ❌ No dark mode. (Out of scope for Phase 2 — palette is light-only. If
  Assaf asks for it later, all tokens already have semantic names so it's a
  follow-up card with a `[data-theme="dark"]` override block.)
- ❌ No animation. (Section 7 — explicit `prefers-reduced-motion` guard.)
- ❌ No SVG illustrations of kids / fields / hands. (That's a future asset
  card, not Phase 2.)

---

## Appendix A — Evidence (Heebo subset sizes, measured 2026-09-20)

```
Heebo 400 Hebrew subset (WOFF2): 12,036 bytes
Heebo 500 Hebrew subset (WOFF2): 14,748 bytes
Heebo 700 Hebrew subset (WOFF2): same URL as 400 (12,036 bytes; Google Fonts
                                 serves one file that covers both weights
                                 for the Hebrew unicode-range)
Total distinct bytes for 3 weights Hebrew subset: ~28.7 KB
```

This is the number that justifies "Heebo Hebrew is fine on the wire IF we
ever went Google Fonts." But the recommendation is the system stack —
Assistant and Noto Sans Hebrew already cover the fallback, and we keep zero
external font requests on the critical path.

## Appendix B — File map for the implementer

```
/home/thrallboy/Projects/democratic-school/
├── assets/
│   ├── styles.css      ← rewrite :root + every component selector
│   └── content.js      ← rename .card→.pillar (1 line); add .message (Phase 3 wires it)
├── contact.html        ← markup stays the same
├── index.html          ← markup stays the same
├── parents.html        ← markup stays the same; CSS adds .message styles
├── registration.html   ← markup stays the same
└── docs/
    ├── screens/
    │   └── phase2-mobile.png  ← Kaladin: deliverable
    └── design/
        └── phase2-brief.md    ← this file
```