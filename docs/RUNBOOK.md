# Runbook — auto-deploy on `dev` push (dashboard-only)

> Goal: every push to `dev` publishes automatically to
> https://democratic-school.pages.dev/, replacing the manual `wrangler pages
> deploy` step.
>
> **Why this is a dashboard task:** CF Pages Git integration is provisioned
> by the CF GitHub App, not by the API. `wrangler` cannot attach a repo to a
> Pages project.

## What I already did from CLI
- Created the Pages project `democratic-school` (`dev` = production branch).
- Created a deploy hook via direct upload (so the site is live today).
- `wrangler.toml` + `package.json` are committed on `dev` so future manual
  deploys remain a one-liner: `npm run deploy:dev`.

## What you need to click

1. Open https://dash.cloudflare.com → Workers & Pages → `democratic-school`.
2. **Settings → Builds → Connect to Git → GitHub**.
3. If CF asks: install the **Cloudflare Pages** GitHub App on
   `AssafMashiah/democratic-school` (account-level install covers all your
   repos; repo-level works too).
4. Pick the GitHub repo: `AssafMashiah/democratic-school`.
5. **Build settings:**
   - **Production branch:** `dev`  ← already correct as the project's `production_branch`
   - **Build command:** *(leave blank — the site is static, no build step)*
   - **Build output directory:** `/`  ← repo root; matches `pages_build_output_dir = "."` in `wrangler.toml`
   - **Root directory (advanced):** `/`
   - **Environment variables:** none yet (Phase 5 AI Gateway adds `AI_GATEWAY_ID` + `CHAT_ENABLED`; you'll set them here when you flip the chat on)
6. Click **Save and Deploy**. The first build reads the current `dev` HEAD and pushes it. Should be green in < 30s — it's a static site.
7. Sanity: refresh https://democratic-school.pages.dev/. If you see a fresh deploy timestamp on the dashboard's Deployments page, the hook is live.

## What changes after the click
- No more `npm run deploy:dev`. Push to `dev` from any machine and the site updates within ~60s.
- `wrangler.toml` and `package.json` still work if you want a manual escape hatch (e.g. when GitHub is down).
- The current live deploy keeps serving the same content until a new `dev` push triggers a rebuild — no flash gap.

## Preview branches
- Once Git is connected, opening a PR against `dev` (or pushing any branch that isn't `dev`) creates a **preview deployment** at
  `<branch-name>.democratic-school.pages.dev` — accessible only if you have link knowledge.
- Optional: Workers & Pages → `democratic-school` → Settings → Builds →
  **Preview browser render** can capture a screenshot for each preview.
  Turn it on later if you want Slack-style preview thumbnails.

## Watch-outs

- **Build token rot** — the `cloudflare-pages` skill documents that the
  per-project build token can silently expire after CF-side rotations
  (token rotation, account changes, CF cleanup). Symptom: a deploy fails
  with code 10000 on the build-token endpoint. Fix is dashboard-only:
  Workers & Pages → `democratic-school` → Settings → Builds → paste a
  fresh User API token (Pages:Edit) into the build-token field, then
  re-push `dev`. If you want zero-downtime insurance later, I can
  replace the git hook with a tiny GitHub Actions workflow that runs
  `wrangler pages deploy . --project-name democratic-school --branch dev`
  instead — but per your August rule, deploy stays out of GH Actions for
  now.

- **Don't set a build command.** The site has no `package.json` build step
  (only the deploy scripts). CF will fail the build with
  "Could not find `wrangler` in your project" if you teach it to run
  `npm install && npm run build`.

- **Conflict with the manual deploy.** After Git is connected, the CLI
  deploy still works (it uses the same Pages API). Both paths coexist;
  whichever ran last wins. No cleanup needed.

## Phase 5 (AI chat) — what to add to the project env when we get there
These go in **Settings → Environment variables** (not yet):
- `AI_GATEWAY_ID` = the gateway id from the CF dashboard
- `AI_MODEL_DEFAULT` = `...70b-instruct-fp8-fast` (or whatever you pick)
- `CHAT_ENABLED` = `false` initially; you flip to `true` when ready.
- `WORKERS_AI_BINDING` is automatically injected when you add the AI
  binding under Settings → Functions → Bindings.
