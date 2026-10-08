# Stage 1 audit review corrections

The original Stage 1 audit is preserved in `stage1-shalan-audit.md`. Dalinar's implementation review overrides these points:

- The chat client must fail closed. HTTP 405 and 503 both keep the form hidden; malformed and network responses must never enable it. This pass does not modify the backend or activate AI.
- Mobile typography may wrap naturally but must not use `nowrap` or clip the full school name.
- The FAQ fix styles native `<details>`; the source is already correctly hidden when a detail is closed.
- `body_he` remains verbatim. `quote_author` is structured metadata extracted only from an existing attribution; it does not reattribute the complete mixed prose.
- Floating chat/FAB and brand-dot UI are deliberately absent while AI is paused, so their unused styles are removed.
- The audit's primary-button hover contrast conclusion was incorrect: 17px bold text is not WCAG large text. Hover now uses the darker brand token.
- The parents renderer accepts the schema's `title_he`/`body_he` fields, while retaining a safe legacy fallback.

Verification evidence is captured by the local test suite and browser checks in this change set.
