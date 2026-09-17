# Security headers and content policy (v1)

> Subject to change as we add the AI chat. Reviewed in Phase 4.

## `_headers` (Cloudflare Pages)

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://gateway.ai.cloudflare.com https://api.cloudflare.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

Adjustments when Phase 4 ships the chat:
- `connect-src` already includes the AI Gateway host.
- If we add any external font / image CDN, that origin must be added to
  the appropriate directive.

## robots.txt

```
User-agent: *
Allow: /
Sitemap: /sitemap.xml
```

## Content rules

- No third-party trackers (no Google Analytics, no Meta pixel) without
  Assaf's approval. v1 ships with zero analytics.
- No external scripts. The site is fully self-hosted.
- Form data (registration, contact) routes to `mailto:` or a Cloudflare
  Form handler only after Assaf approves the destination.
- The dormant AI chat never makes outbound calls until `CHAT_ENABLED=true`.