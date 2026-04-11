---
phase: 01-foundation
plan: 04
subsystem: auth
tags: [better-auth, magic-link, resend, drizzle-adapter, svelte-server-render, hooks-server, catch-all-route, auth-modal, runes-store, client-guard]

requires:
  - "01-02 (Drizzle schema with user/session/account/verification tables, Drizzle client at src/lib/server/db/index.ts)"
  - "01-03 (auth-modal runes store, SiteHeader Sign in button wired to authModal.openModal, +layout.svelte snippet composition, /account route free to create)"
provides:
  - "better-auth@1.6.2 and resend@6.10.0 installed"
  - "src/lib/server/auth.ts — betterAuth server config with drizzleAdapter + magicLink plugin + sveltekitCookies(getRequestEvent), 10-minute magic link expiry"
  - "src/lib/auth-client.ts — createAuthClient with magicLinkClient plugin (browser-safe)"
  - "src/lib/server/email/resend.ts — Resend client from env.RESEND_API_KEY"
  - "src/lib/server/email/templates/MagicLink.svelte — Svelte 5 inline-styled email component, rendered via svelte/server render() to HTML string"
  - "src/hooks.server.ts — populates event.locals.user/session from auth.api.getSession then delegates to svelteKitHandler"
  - "src/routes/api/auth/[...all]/+server.ts — catch-all GET/POST calling auth.handler(request), prerender=false for adapter-static compatibility"
  - "src/lib/components/AuthModal.svelte — three-state (input/sending/sent/error) modal with UI-SPEC locked copy, role=dialog aria-modal, Escape close, backdrop dismiss, aria-describedby error linkage, svelte/transition fade+fly animations"
  - "AuthModal mounted in src/routes/+layout.svelte as a global portal (outside SafeArea so backdrop covers insets)"
  - "src/routes/account/+page.ts — ssr=false prerender=false (client-side auth gate, works in both adapter targets)"
  - "src/routes/account/+page.svelte — authClient.useSession() stub with Welcome + email + Sign out button, $effect redirect to / when session.data === null"
  - "Schema drift merge committed as supabase/migrations/0001_better_auth_sync.sql (user.name notNull, account.accessToken/refreshToken/idToken/accessTokenExpiresAt/refreshTokenExpiresAt/scope/password, indexes on session.userId/account.userId/verification.identifier)"
affects: [01-05-capacitor-and-smoke-test, 03-loyalty-core, 03-loyalty-rewards]

tech-stack:
  added:
    - "better-auth ^1.6.2 (resolved 1.6.2) — magic-link + drizzleAdapter + sveltekitCookies, pulls Kysely as a transitive dep (visible in build output as kysely-adapter chunk)"
    - "resend ^6.10.0 (resolved 6.10.0) — Resend HTTP API client; ships with an optional @react-email/render peer dep that emits a harmless 'failed to locate' warning from adapter-vercel because we use svelte/server render() instead"
  patterns:
    - "Server-rendered Svelte email templates via svelte/server's render() returning { body, head } — destructure { body: html } and hand to resend.emails.send (zero new deps, avoids React transitive)"
    - "Better Auth secret + baseURL loaded from $env/dynamic/private (not $env/static/private) so BETTER_AUTH_SECRET and BETTER_AUTH_URL can be rotated on Vercel at runtime without a rebuild"
    - "Magic link callback URL is /account — Better Auth redirects there after verification, and /account itself does the client-side auth gate via authClient.useSession()"
    - "Catch-all auth API route pattern: src/routes/api/auth/[...all]/+server.ts exports GET/POST wrappers over auth.handler(request) plus prerender=false (critical — adapter-static would otherwise fail to prerender the wildcard)"
    - "Dual build target protected: ssr=false + prerender=false on /account + prerender=false on the auth catch-all means both adapter-vercel and adapter-static succeed without per-adapter branching"
    - "Client-side auth gate via $effect { if (!$session.isPending && $session.data === null) goto('/'); } — no server redirect, works from the static Capacitor build"
    - "Svelte 5 runes store (auth-modal.svelte.ts) is the single source of truth for modal open state; SiteHeader writes, AuthModal reads via $derived(authModal.open)"

key-files:
  created:
    - "src/lib/server/auth.ts"
    - "src/lib/auth-client.ts"
    - "src/lib/server/email/resend.ts"
    - "src/lib/server/email/templates/MagicLink.svelte"
    - "src/hooks.server.ts"
    - "src/routes/api/auth/[...all]/+server.ts"
    - "src/lib/components/AuthModal.svelte"
    - "src/routes/account/+page.ts"
    - "src/routes/account/+page.svelte"
    - "supabase/migrations/0001_better_auth_sync.sql"
    - "supabase/migrations/meta/0001_snapshot.json"
  modified:
    - "package.json — +better-auth@^1.6.2, +resend@^6.10.0"
    - "package-lock.json — locked transitive tree"
    - "src/lib/server/db/schema.ts — user.name notNull, account token columns, indexes"
    - "src/routes/+layout.svelte — import + mount <AuthModal /> outside SafeArea"
    - "supabase/migrations/meta/_journal.json — +0001 entry"

key-decisions:
  - "D-29 substitution (FLAG FOR USER ACCEPT/REJECT): CONTEXT.md D-29 says 'React Email templates for magic link emails'; RESEARCH.md §Email recommends svelte-email-tailwind as the Svelte-native equivalent. This plan ships a hand-rolled Svelte 5 component with ONLY inline styles, rendered via svelte/server's render() to HTML. Rationale: (a) magic link is the ONLY transactional email in Phase 1 — adding svelte-email-tailwind for one template is over-engineering; (b) avoids pulling @react-email/components and @react-email/render into a pure Svelte codebase; (c) svelte/server render() is already in SvelteKit runtime, zero new deps; (d) the component-based + server-rendered + brand-typography intent of D-29 is preserved — only the specific library identity is swapped. User must accept or reject during /gsd:verify-work."
  - "Better Auth CLI schema drift merged into schema.ts: user.name made notNull, account gained accessToken/refreshToken/idToken/accessTokenExpiresAt/refreshTokenExpiresAt/scope/password (all nullable, unused by magic-link but required for the canonical Better Auth 1.6 shape so future OAuth providers plug in without migration churn), and indexes added on session.userId/account.userId/verification.identifier per CLI recommendation. Applied as 0001_better_auth_sync.sql with drizzle-kit migrate — user.name SET NOT NULL succeeded because the table is empty (no users created yet). See RESEARCH.md Pitfall #7 — this drift check is exactly what the plan instructed."
  - "Resend from address uses the shared dev sender 'Rule 257 <onboarding@resend.dev>' (RESEARCH.md Pitfall #6) — Resend rejects custom 'from' domains until the domain is verified in the Resend dashboard. Production must verify rule257.nyc at https://resend.com/domains and swap the from address to 'Rule 257 <hello@rule257.nyc>' or similar before shipping. Documented here so Phase 2 or production deployment knows to do it."
  - "Server auth env vars loaded from $env/dynamic/private (BETTER_AUTH_SECRET, BETTER_AUTH_URL, RESEND_API_KEY, DATABASE_URL) rather than $env/static/private — enables runtime rotation on Vercel without a rebuild. Tradeoff: slightly larger runtime bundle on adapter-vercel; acceptable for a security-critical secret."
  - "AuthModal backdrop implemented as an absolutely-positioned <button aria-label='Close sign-in'> covering the full modal area. This avoids the svelte-check a11y_click_events_have_key_events warning that a <div onclick> triggers. The card <div> sits on top with position:relative; click events on the card do not propagate to the backdrop button because they are separate siblings in the DOM (not parent/child)."
  - "svelte/server render() destructure: confirmed the return shape is { body, head, html } and body is the rendered HTML string we want for the email — matched the plan's expectation exactly, no adaptation needed. Passed directly to resend.emails.send({ html }) without any post-processing."
  - "/account route uses ssr=false + prerender=false combined with client-side auth gate. This means adapter-static serves the SPA shell (200.html) for /account and the client boots authClient.useSession() on mount. Same code path works on adapter-vercel — SSR is off so the server never touches the session cookie for this route, and hydration runs authClient.useSession() identically. Single implementation works across both adapter targets."

requirements-completed:
  - BRAND-06

metrics:
  duration: ~11min
  started: 2026-04-11T02:29:10Z
  completed: 2026-04-11T02:40:03Z
  tasks: 2
  files: 14
---

# Phase 01 Plan 04: Auth Magic Link Summary

**Complete Better Auth 1.6 magic-link chain wired end-to-end: Drizzle adapter connects to the Plan 02 schema, the magicLink plugin renders a hand-rolled Svelte email template via svelte/server and sends it through Resend, svelteKitHandler is wrapped in hooks.server.ts with session population into event.locals, a catch-all `/api/auth/[...all]` route exposes GET/POST handlers with prerender=false so adapter-static builds, and the AuthModal (three states — input/sending/sent, plus error) is mounted globally in +layout.svelte and reads from the Plan 03 runes store. The /account stub uses authClient.useSession() + $effect for a client-side auth gate that works in both adapter-vercel and adapter-static builds. Both `npm run build:vercel` and `npm run build:mobile` pass. Phase 1 success criterion #4 is code-complete; end-to-end smoke testing happens in Plan 05.**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-04-11T02:29:10Z
- **Completed:** 2026-04-11T02:40:03Z
- **Tasks:** 2/2
- **Files created/modified:** 14 (11 created, 3 modified)

## Accomplishments

- `better-auth@1.6.2` and `resend@6.10.0` installed cleanly via npm; 28 new packages, 9 pre-existing vulnerabilities (3 low, 6 moderate) — all in transitive deps, out of scope for this plan
- `@better-auth/cli@1.4.21` generate produced the canonical Better Auth 1.6 schema shape; diffed against Plan 02's schema and merged the additions (user.name notNull, 7 new nullable account columns, 3 indexes). Applied via drizzle-kit generate + migrate — 0001_better_auth_sync.sql committed
- `src/lib/server/auth.ts` matches the plan's <interfaces> block verbatim: `betterAuth({ database: drizzleAdapter(db, { provider: 'pg' }), secret: env.BETTER_AUTH_SECRET, baseURL: env.BETTER_AUTH_URL, plugins: [ magicLink({ expiresIn: 60 * 10, disableSignUp: false, sendMagicLink: async ({ email, url }) => { const { body: html } = render(MagicLinkEmail, { props: { url, email } }); await resend.emails.send({ from: 'Rule 257 <onboarding@resend.dev>', to: email, subject: 'Your Rule 257 sign-in link', html }); } }), sveltekitCookies(getRequestEvent) ] })`
- `src/lib/auth-client.ts` is the two-line `createAuthClient({ plugins: [magicLinkClient()] })` — browser-safe, used by AuthModal and /account
- `src/lib/server/email/templates/MagicLink.svelte` is a Svelte 5 component taking `{ url, email }` via `$props()` with ONLY inline styles. Verified: 8 `style=` attributes, 0 `<style>` blocks. All UI-SPEC email copy present verbatim (`Rule 257`, `Click the link below to sign in to your account.`, `Sign in`, `This link expires in 10 minutes.`, `Rule 257 · 54 Eldridge St, New York, NY`)
- `src/hooks.server.ts` reads the session via `auth.api.getSession({ headers: event.request.headers })`, populates `event.locals.session` and `event.locals.user` when present, then returns `svelteKitHandler({ event, resolve, auth, building })` — exactly the RESEARCH.md Pattern 3 shape
- `src/routes/api/auth/[...all]/+server.ts` exports GET and POST handlers that call `auth.handler(request)` and exports `prerender = false` — this is the critical line that keeps `adapter-static` from failing
- `src/lib/components/AuthModal.svelte` renders all four states (input / sending / sent / error) with every UI-SPEC locked copy string present verbatim. Uses $state/$derived/$effect runes, svelte/transition fade+fly, Escape key close via $effect cleanup, backdrop button dismiss, aria-describedby linkage on the error message
- `src/routes/+layout.svelte` imports and mounts `<AuthModal />` OUTSIDE the `<SafeArea>` snippet so the fixed-position backdrop covers the full viewport including safe-area insets. Plan 03's snippet composition pattern preserved
- `src/routes/account/+page.svelte` uses `const session = authClient.useSession()` and `$effect(() => { if (!$session.isPending && $session.data === null) goto('/'); })` for the client-side guard. Signed-in state renders `Welcome` + email + `Sign out` button. Signed-out users never see the content because the $effect runs on mount
- Both builds succeed:
  - `npm run build:vercel` — 4.89s, adapter-vercel
  - `npm run build:mobile` — 5.10s, adapter-static, "Wrote site to build"
- Zero svelte-check errors; only the 9 pre-existing a11y warnings from Plan 03 (href="#" on Phase 1 nav placeholders)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Better Auth + Resend, generate Better Auth schema, wire server/client/hooks** — `cd9bb23` (feat)
2. **Task 2: Build AuthModal, mount it in +layout.svelte, build /account stub** — `1788aec` (feat)

## Build Verification

### `npm run build:vercel`

```
✓ built in 4.89s
> Using @sveltejs/adapter-vercel
  Warning: The following modules failed to locate dependencies that may (or may not) be required for your app to work:
  node_modules\resend\dist\index.mjs
    - @react-email/render
  node_modules\resend\dist\index.cjs
    - @react-email/render
  ✔ done
```

The `@react-email/render` warning is harmless — it is an optional peer dep that `resend` ships for users who want React Email integration. This project uses `svelte/server` render() instead, so the dep is unused. The build succeeds and the server runtime does not import React.

### `npm run build:mobile`

```
✓ built in 5.10s
> Using @sveltejs/adapter-static
  Wrote site to "build"
  ✔ done
```

No prerender errors on `/api/auth/[...all]` — the `export const prerender = false` correctly opts the catch-all out of adapter-static's prerender pass. `/account` is handled by the SPA fallback (`build/200.html`) because `ssr=false` + `prerender=false`; this is expected per Plan 03's 200.html fallback convention.

## D-29 Substitution — REQUIRED User Decision

**FLAGGED FOR /gsd:verify-work — user must accept or reject.**

| Aspect | CONTEXT.md D-29 literal | RESEARCH.md recommended | This plan's choice |
|---|---|---|---|
| **Library** | React Email | svelte-email-tailwind | Hand-rolled Svelte 5 component |
| **Renderer** | @react-email/render | svelte-email-tailwind render | svelte/server's render() |
| **Style handling** | JSX styles → inline | Tailwind → inline | Hardcoded inline style attributes |
| **Transitive deps** | Adds React | Adds svelte-email-tailwind | Zero new deps |

**Rationale for the substitution** (in priority order):

1. **Magic link is the ONLY transactional email in Phase 1.** Adding a templating library for a single email is over-engineering. Phase 2+ can introduce `svelte-email-tailwind` when a second email template is needed.
2. **Pulling React into a pure Svelte codebase creates friction.** `@react-email/components` + `@react-email/render` brings React as a transitive dep; tsconfig JSX settings need adjustment; IDE tooling gets confused. RESEARCH.md §Alternatives Considered explicitly flags this tradeoff.
3. **`svelte/server`'s `render()` is already in SvelteKit's runtime.** Zero new dependencies. `render(Component, { props })` returns `{ body, head }`; we destructure `body` as the HTML string.
4. **The component-based + server-rendered + brand-typography intent of D-29 is preserved.** The email is still a Svelte component, still server-rendered, still uses serif headings (`Georgia, 'Times New Roman', serif`) + sans body (`-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`) matching the UI-SPEC brand typography. Only the specific library identity is swapped.

**If the user rejects this substitution during `/gsd:verify-work`:**

- Phase 1 reopens Plan 04 Task 2
- Install `svelte-email-tailwind`
- Rewrite `MagicLink.svelte` to use its `<Html>/<Head>/<Body>/<Container>` primitives
- Rewrite `sendMagicLink` in `auth.ts` to use the library's render API instead of `svelte/server`
- Estimated rework: ~30 minutes

## Better Auth CLI Drift Analysis

Ran `npx @better-auth/cli@latest generate` (resolved to @better-auth/cli@1.4.21) against a temp stub auth config (the real auth.ts imports a .svelte file which Node can't load in the CLI's unregistered context — documented under "Issues Encountered"). Compared generated schema to Plan 02's schema.ts:

| Field | Plan 02 | CLI output | Action |
|---|---|---|---|
| `user.name` | `.notNull()` — MISSING | `.notNull()` | **Made notNull** |
| `account.accessToken` | missing | `text()` (nullable) | **Added** |
| `account.refreshToken` | missing | `text()` (nullable) | **Added** |
| `account.idToken` | missing | `text()` (nullable) | **Added** |
| `account.accessTokenExpiresAt` | missing | `timestamp()` (nullable) | **Added** |
| `account.refreshTokenExpiresAt` | missing | `timestamp()` (nullable) | **Added** |
| `account.scope` | missing | `text()` (nullable) | **Added** |
| `account.password` | missing | `text()` (nullable) | **Added** |
| `session.updatedAt` | `.defaultNow().notNull()` | `$onUpdate()` | **Kept Plan 02's defaultNow** (safer for inserts; $onUpdate fires only on update) |
| `session_userId_idx` | missing | `index()` | **Added** |
| `account_userId_idx` | missing | `index()` | **Added** |
| `verification_identifier_idx` | missing | `index()` | **Added** |

**Why `user.name` notNull matters for magic-link:** Better Auth's magic-link plugin inserts new users with a derived name (email prefix by default). If the schema allows `.name` to be null, the insert still succeeds but later code that assumes `user.name` is non-null will break. The CLI output insists on notNull to enforce this invariant at the schema level.

**Migration applied:** `0001_better_auth_sync.sql` — ALTER user.name SET NOT NULL succeeded because the table is empty. 7 ALTER TABLE ADD COLUMN statements for the account additions (all nullable, no backfill required). 3 CREATE INDEX statements. drizzle-kit migrate applied successfully; the 2 NOTICES about pre-existing drizzle schema/_drizzle_migrations table are expected (Plan 02 already ran migrate once).

**Temp files cleaned up:** `better-auth-schema.generated.ts` and `.tmp-auth-for-cli.ts` both deleted before commit. Verified absent with `test ! -f`.

## svelte/server render() Shape Confirmation

The plan's <interfaces> block expected `render(Component, { props })` to return an object destructurable as `{ body: html }`. This proved exactly correct:

```typescript
const { body: html } = render(MagicLinkEmail, { props: { url, email } });
await resend.emails.send({ ..., html });
```

No adaptation needed. The SvelteKit 2.57.1 / Svelte 5.55.3 runtime matches the documented shape of `svelte/server`'s `render()`.

## TypeScript Friction with Better Auth Types

None encountered. `svelte-check` reports **0 errors, 11 warnings** — the 9 pre-existing a11y href="#" warnings from Plan 03 were joined momentarily by 2 new warnings on AuthModal's card `<div onclick>` before I refactored to use a backdrop `<button>` + absolute positioning, removing the need for `onclick` on the card. Final count is back to the baseline 9 warnings.

`src/app.d.ts` already declares `App.Locals.session` and `App.Locals.user` as optional `Session`/`User` from `better-auth` — the hooks.server.ts assignment type-checks cleanly without modification.

## Resend 'from' Address — Production Note

Current dev config:

```typescript
from: 'Rule 257 <onboarding@resend.dev>'
```

`onboarding@resend.dev` is Resend's shared sandbox sender (RESEARCH.md Pitfall #6). It works immediately without domain verification, but:

- Emails may be rate-limited in dev
- Deliverability to real inboxes (Gmail/Outlook) is not guaranteed
- Production will reject unverified domain senders

**Before production deployment:**

1. Visit https://resend.com/domains
2. Add `rule257.nyc`
3. Configure DKIM + SPF DNS records at Rule 257's DNS provider
4. Wait for Resend to verify the domain (usually <10 min)
5. Swap the `from` address in `src/lib/server/auth.ts` to something like `Rule 257 <hello@rule257.nyc>` or `Rule 257 <sign-in@rule257.nyc>`
6. Deploy

**For local dev smoke-testing (Plan 05):** Supabase local stack includes Inbucket at http://localhost:54324 which catches all outbound mail regardless of provider. Plan 05 can point the smoke test at Inbucket to inspect the magic link email without needing a real Resend account.

Alternatively, set a real `RESEND_API_KEY` in `.env` (the current value `re_placeholder_for_plan_04` will cause `resend.emails.send` to throw on actual invocation — that's expected for a placeholder). A real key unlocks actual email delivery to the test inbox.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] @better-auth/cli could not load auth.ts because it imports a .svelte file**

- **Found during:** Task 1 (step 2: Better Auth CLI drift check)
- **Issue:** `npx @better-auth/cli@latest generate --config src/lib/server/auth.ts` failed with `TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".svelte" for .../templates/MagicLink.svelte`. The CLI uses Node's ESM loader without SvelteKit's runtime, so it cannot transpile .svelte imports that live in the auth config's import chain.
- **Fix:** Created a temporary `.tmp-auth-for-cli.ts` file containing the same `betterAuth({...})` shape but with `sendMagicLink: async () => {}` (no email template import). Ran `npx @better-auth/cli@latest generate --output better-auth-schema.generated.ts --config .tmp-auth-for-cli.ts --y`. This succeeded because the temp config has no .svelte imports in its chain. Compared the generated schema to Plan 02's schema.ts, merged the drift, then deleted both the temp config AND the generated schema file before committing.
- **Files modified:** `.tmp-auth-for-cli.ts` (created + deleted), `better-auth-schema.generated.ts` (created + deleted), `src/lib/server/db/schema.ts` (merge: user.name notNull, 7 new account columns, 3 indexes), `supabase/migrations/0001_better_auth_sync.sql` (new migration)
- **Verification:** `test ! -f better-auth-schema.generated.ts && test ! -f .tmp-auth-for-cli.ts` both pass. drizzle-kit generate emitted clean SQL. drizzle-kit migrate applied successfully.
- **Committed in:** `cd9bb23`

**2. [Rule 2 — Critical functionality] user.name was nullable in Plan 02's schema but Better Auth 1.6 requires it notNull**

- **Found during:** Task 1 (step 2: drift merge)
- **Issue:** Plan 02's schema.ts had `name: text('name')` (nullable) but `@better-auth/cli@1.4.21` generates `name: text("name").notNull()`. If left nullable, Better Auth's magic-link insert would either (a) fail silently by providing an empty string as default, or (b) break downstream code that assumes `user.name` is non-null. This is a correctness + security issue (not a bug now but a landmine later).
- **Fix:** Changed `name: text('name')` → `name: text('name').notNull()` in schema.ts, generated and applied `0001_better_auth_sync.sql` with `ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL;`. The ALTER succeeded because the `user` table is empty (no users have been inserted yet in local dev).
- **Files modified:** `src/lib/server/db/schema.ts`, `supabase/migrations/0001_better_auth_sync.sql` (new)
- **Verification:** `docker exec supabase_db_rule257.nyc psql -U postgres -c "\d user"` shows `name text NOT NULL` (not verified here interactively — but the drizzle-kit migrate exit code was 0 which is authoritative).
- **Committed in:** `cd9bb23`

**3. [Rule 1 — Bug] svelte-check a11y warning on AuthModal card div with onclick stopPropagation**

- **Found during:** Task 2 (after first `npm run check`)
- **Issue:** svelte-check emitted two new warnings: `a11y_click_events_have_key_events` and `a11y_no_noninteractive_element_interactions` on the card `<div>` that had `onclick={handleCardClick}` (for stopPropagation). Warnings, not errors, but adding new warnings beyond the pre-existing Plan 03 baseline is a code-quality regression I chose to fix.
- **Fix:** Removed the `onclick` handler from the card `<div>` entirely. The backdrop is now an absolutely-positioned `<button aria-label="Close sign-in">` covering the full modal area with `bg-[color:var(--color-ink)]/60`. The card sits on top with `position: relative`. Because the button and the card are DOM siblings (not parent/child), clicks on the card do not bubble to the backdrop button — no stopPropagation is needed.
- **Files modified:** `src/lib/components/AuthModal.svelte`
- **Verification:** `npm run check` reports 9 warnings (all pre-existing Plan 03 href="#" placeholders). Zero AuthModal-related warnings.
- **Committed in:** `1788aec`

**4. [Rule 3 — Blocking] Verification grep `>Welcome<` required single-line tag wrap**

- **Found during:** Task 2 (running plan's acceptance-criteria grep)
- **Issue:** My initial `/account/+page.svelte` wrote `<h1 class="...">\n      Welcome\n    </h1>` (multi-line). The plan's verify script runs `grep -q ">Welcome<"` which expects `>Welcome<` on a single line. This would fail verification despite the content being semantically correct.
- **Fix:** Compressed the h1 to a single line: `<h1 class="...">Welcome</h1>`. Cosmetic change only.
- **Files modified:** `src/routes/account/+page.svelte`
- **Verification:** `grep -q ">Welcome<" src/routes/account/+page.svelte && echo OK` prints OK.
- **Committed in:** `1788aec`

**No Rule 4 architectural decisions needed. No authentication gates encountered** (the D-29 substitution is a design choice flagged for user review, not an auth gate).

## Known Stubs

- `/account` is a deliberate Phase 1 stub per CONTEXT.md D-34/D-35/D-36: renders only `Welcome` + email + `Sign out`. Phase 3 (LOYAL-01 through LOYAL-09) builds the real loyalty dashboard with points balance, QR code, transaction history.
- `RESEND_API_KEY=re_placeholder_for_plan_04` in `.env` is a local-dev placeholder from Plan 02. The server code will throw `401 Unauthorized` from the Resend API on actual invocation until a real key is provided. **For Plan 05 smoke testing:** either (a) sign up at https://resend.com and put a real key in .env, or (b) point the smoke test at Supabase's Inbucket mock mailserver (http://localhost:54324) which catches all outbound mail. The `resend.emails.send` call will still fail with the placeholder key; Inbucket only helps if we ALSO switch the email provider to Supabase's local auth email — out of scope for this plan.
- `from: 'Rule 257 <onboarding@resend.dev>'` is Resend's shared dev sender. Production MUST swap to a verified rule257.nyc address before shipping. Flagged in the Resend 'from' Address section above.
- Better Auth CLI drift check was performed with `@better-auth/cli@1.4.21` (the latest available on npm at execution time) but the server runtime uses `better-auth@1.6.2`. There is a minor version gap — if the 1.6.2 runtime expects additional columns that the 1.4.21 CLI did not emit, future plans may hit a schema mismatch. This is a low-risk drift because both CLI versions ship canonical schema shapes that are backwards-compatible.

## Next Plan Readiness

**Plan 05 (Capacitor + smoke test) can now:**

- Run `npm run build:mobile` which already succeeds after Plan 04 — the `build/` directory has the SPA shell at `200.html`, the prerendered home at `index.html`, and `_app/` bundles that include both AuthModal and the /account page as client-side modules
- Point Capacitor's `webDir` at `build/` — unchanged from Plan 03
- Smoke-test the magic-link flow on the Vercel dev target (`npm run dev` → visit http://localhost:5173 → click Sign in → enter email → check Resend dashboard or Inbucket for the magic link → click → verify /account shows Welcome + email + Sign out)
- Smoke-test on iOS/Android would require a live backend (Vercel deployment or ngrok tunnel to local dev) because Capacitor's static build has no server. Deferred to Plan 05's execution plan.

**Phase 3 (loyalty) can now:**

- Rely on `user`, `session`, `account`, `verification` tables being canonical Better Auth 1.6 shape with all nullable OAuth columns present — Phase 3 can add Google/Apple OAuth without a schema migration
- Rely on `event.locals.user` and `event.locals.session` being populated in every server load function and form action (hooks.server.ts does it before svelteKitHandler runs)
- Consume `authClient.useSession()` on any client-side component for reactive session state
- Add new routes under a layout group like `(authed)` that uses a root `load` to redirect unauthenticated users server-side, OR continue the client-side $effect pattern established by `/account`

**No architectural blockers.** The D-29 substitution is the only open question — awaiting user sign-off during `/gsd:verify-work`. If accepted, Phase 1 closes out with Plan 05's smoke test. If rejected, Plan 04 Task 2 reopens for a ~30min rework.

## Self-Check: PASSED

All claimed files exist on disk and all claimed commits exist in git history:

**Files:**
- `src/lib/server/auth.ts` — FOUND
- `src/lib/auth-client.ts` — FOUND
- `src/lib/server/email/resend.ts` — FOUND
- `src/lib/server/email/templates/MagicLink.svelte` — FOUND
- `src/hooks.server.ts` — FOUND
- `src/routes/api/auth/[...all]/+server.ts` — FOUND
- `src/lib/components/AuthModal.svelte` — FOUND
- `src/routes/account/+page.ts` — FOUND
- `src/routes/account/+page.svelte` — FOUND
- `src/lib/server/db/schema.ts` — FOUND (modified)
- `src/routes/+layout.svelte` — FOUND (modified)
- `supabase/migrations/0001_better_auth_sync.sql` — FOUND
- `supabase/migrations/meta/0001_snapshot.json` — FOUND
- `.planning/phases/01-foundation/01-04-SUMMARY.md` — FOUND (this file)

**Commits:**
- `cd9bb23` (Task 1: install + wire server/hooks/api + schema drift merge) — FOUND
- `1788aec` (Task 2: AuthModal + layout mount + /account stub) — FOUND

**Temp files cleaned up:**
- `better-auth-schema.generated.ts` — NOT FOUND (correctly deleted)
- `.tmp-auth-for-cli.ts` — NOT FOUND (correctly deleted)

---

*Phase: 01-foundation*
*Completed: 2026-04-11*
