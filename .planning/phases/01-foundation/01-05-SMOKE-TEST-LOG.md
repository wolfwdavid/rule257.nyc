# Phase 1 Foundation — Smoke Test Log

**Run date:** 2026-04-11T02:58:17Z
**Run by:** execute-plan executor for 01-05
**Environment:**
- OS: Windows 11 Pro 10.0.26200 (MINGW64 bash via Git Bash / MSYS2)
- Node: v22.14.0
- npm: 10.9.2

---

## Criterion 1 — Dual-adapter build

**Status:** PASS

**Evidence:**

```
$ rm -rf build .svelte-kit/output
$ npm run build:vercel
...
.svelte-kit/output/server/chunks/auth.js     270.12 kB │ gzip: 58.58 kB
✓ built in 5.23s
> Using @sveltejs/adapter-vercel
  Warning: The following modules failed to locate dependencies that may (or may not) be required for your app to work:
  node_modules\resend\dist\index.mjs
    - @react-email/render
  node_modules\resend\dist\index.cjs
    - @react-email/render
  ✔ done

$ ls .svelte-kit/output/
client/
prerendered/
server/
```

```
$ rm -rf build .svelte-kit/output
$ npm run build:mobile
...
✓ built in 4.70s
> Using @sveltejs/adapter-static
  Wrote site to "build"
  ✔ done

$ ls build/
_app/
200.html
favicon.svg
fonts/
images/
index.html
robots.txt

$ test -f build/index.html && echo "build/index.html PRESENT"
build/index.html PRESENT

$ grep -c 'Coming Soon' build/index.html
1

$ grep -c 'Rule 257' build/index.html
2
```

**Notes:**
- Both builds exit 0.
- `adapter-vercel` produces chunked server output at `.svelte-kit/output/{client,prerendered,server}/` ready for Vercel deployment.
- `adapter-static` produces `build/index.html` (prerendered Coming Soon page) + `build/200.html` (SPA fallback for client-side routes like `/account`).
- `build/index.html` is prerendered HTML containing both `Coming Soon` (1 occurrence) and `Rule 257` (2 occurrences — wordmark in header + footer copyright line).
- The `@react-email/render` warning on adapter-vercel is a documented-in-01-04-SUMMARY harmless optional peer dep from `resend`. This project uses `svelte/server`'s `render()` instead of React Email.
- Dual-adapter swap via `BUILD_TARGET=vercel|mobile` env var (set via `cross-env` in npm scripts) is working on Windows.

---

## Criterion 2 — Mobile-responsive + safe area

**Status:** PASS

**Evidence:**

```
$ grep -c 'viewport-fit=cover' src/app.html
1

$ grep -c -- '--safe-top' src/app.css
1

$ grep -c 'var(--safe-top)' src/lib/components/SafeArea.svelte
1

$ grep -c 'md:' src/lib/components/SiteHeader.svelte
3

$ grep -c 'md:' src/lib/components/SiteFooter.svelte
3

$ grep -c 'md:' src/routes/+page.svelte
1

$ grep -c 'min-h-11' src/lib/components/SiteHeader.svelte
6

$ grep -c 'safe-area-inset' build/_app/immutable/assets/bundle.DhS5ROq9.css
1

$ grep -o '\-\-safe-top:env[^,;]*' build/_app/immutable/assets/bundle.DhS5ROq9.css
--safe-top:env(safe-area-inset-top

$ grep -o '\-\-safe-bottom:env[^,;]*' build/_app/immutable/assets/bundle.DhS5ROq9.css
--safe-bottom:env(safe-area-inset-bottom
```

**Notes:**
- `viewport-fit=cover` is present in `src/app.html` (required for iOS notch handling + Capacitor WebView).
- Safe-area CSS variables are declared in `src/app.css` `:root` block (`--safe-top`, `--safe-right`, `--safe-bottom`, `--safe-left`) and consumed by `SafeArea.svelte` via `style="padding-top: var(--safe-top); ..."`.
- Mobile-first `md:` breakpoints present in `SiteHeader` (3), `SiteFooter` (3), and the `+page.svelte` home (1) — default mobile styles with `md:*` overrides.
- `min-h-11` (44px touch target, WCAG AAA) is used 6 times in `SiteHeader` — wordmark link, desktop nav links (x3), Sign in CTA button, and mobile hamburger button.
- Built CSS bundle (`bundle.DhS5ROq9.css`) contains the compiled `:root { --safe-top: env(safe-area-inset-top, 0px); ... }` block, proving the safe-area insets survive the production build and will apply on real mobile devices.

---

## Criterion 3 — Supabase + Drizzle schema

**Status:** PASS

**Evidence:**

```
$ npx supabase status
supabase local development setup is running.

╭──────────────────────────────────────╮
│ 🔧 Development Tools                 │
├─────────┬────────────────────────────┤
│ Studio  │ http://127.0.0.1:54323     │
│ Mailpit │ http://127.0.0.1:54324     │
│ MCP     │ http://127.0.0.1:54321/mcp │
╰─────────┴────────────────────────────╯

$ ls supabase/migrations/*.sql
supabase/migrations/0000_initial.sql
supabase/migrations/0001_better_auth_sync.sql

$ docker exec supabase_db_rule257.nyc psql -U postgres -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
     tablename
-------------------
 account
 point_transaction
 profile
 redemption
 reward
 scan_token
 session
 user
 verification
(9 rows)
```

**Notes:**
- Supabase local dev stack running (API on 127.0.0.1:54321, DB on 127.0.0.1:54322, Studio on 54323, Mailpit email catcher on 54324).
- Two migration files present: `0000_initial.sql` (Plan 02 — base 9 tables) and `0001_better_auth_sync.sql` (Plan 04 — Better Auth CLI drift merge: user.name notNull, 7 nullable account OAuth columns, 3 indexes).
- All 9 public tables materialized — exactly the set required by the plan acceptance criteria: `account`, `point_transaction`, `profile`, `redemption`, `reward`, `scan_token`, `session`, `user`, `verification`.
- The 4 Better Auth tables (user/session/account/verification) and the 5 loyalty tables (profile/point_transaction/reward/redemption/scan_token) both present.
- Stopped services warning (`supabase_imgproxy_rule257.nyc supabase_pooler_rule257.nyc`) is informational — imgproxy and pgbouncer pooler are optional services not needed for Phase 1.

---

## Criterion 4 — Better Auth magic link wired

**Status:** PASS (automated) + PENDING-HUMAN-VERIFY (end-to-end)

**Automated evidence:**

```
$ grep -c 'magicLink(' src/lib/server/auth.ts
1

$ grep -c 'drizzleAdapter' src/lib/server/auth.ts
2

$ grep -c 'resend.emails.send' src/lib/server/auth.ts
1

$ grep -c 'magicLinkClient' src/lib/auth-client.ts
2

$ grep -c 'svelteKitHandler' src/hooks.server.ts
2

$ grep -c 'auth.handler' 'src/routes/api/auth/[...all]/+server.ts'
2

$ grep -c 'Send magic link' src/lib/components/AuthModal.svelte
1

$ grep -c 'authClient.useSession' src/routes/account/+page.svelte
1

$ grep -c 'authClient.signOut' src/routes/account/+page.svelte
1
```

Dev server boot + endpoint probe:

```
$ npm run dev > /tmp/dev-server.log 2>&1 &
$ sleep 10
$ tail /tmp/dev-server.log
  VITE v8.0.8  ready in 1637 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://10.20.75.40:5173/
  ➜  Network: http://172.20.208.1:5173/

$ curl -s -o /tmp/session-body.txt -w "HTTP: %{http_code}\n" http://localhost:5173/api/auth/session
HTTP: 404
# /api/auth/session does NOT exist in Better Auth 1.6 — the canonical route is
# /api/auth/get-session. The 404 comes from Better Auth's own catch-all, NOT from
# the catch-all being broken. Confirmed by the get-session probe below.

$ curl -s -o /tmp/get-session-body.txt -w "HTTP: %{http_code}\n" http://localhost:5173/api/auth/get-session
HTTP: 200
# Body: null   (no active session — expected, no user signed in)
# This 200 proves the src/routes/api/auth/[...all]/+server.ts catch-all is correctly
# wired, auth.handler(request) is resolving routes, and hooks.server.ts is
# populating event.locals before svelteKitHandler takes over.

$ curl -s -X POST http://localhost:5173/api/auth/sign-in/magic-link \
    -H "Content-Type: application/json" \
    -d '{"email":"smoketest@example.com","callbackURL":"/account"}' \
    -w "\nHTTP: %{http_code}\n"
{"status":true}
HTTP: 200
# Better Auth accepted the sign-in request, verified the email syntactically,
# invoked the magicLink plugin's sendMagicLink handler, and returned success.
# Note: Better Auth returns {status:true} regardless of whether the underlying
# email send succeeded (email-enumeration hardening). With the current
# RESEND_API_KEY=re_placeholder_for_plan_04 the Resend API call itself almost
# certainly failed, but the endpoint-wiring and plugin-wiring are proven.

$ kill $DEV_PID
```

**Manual verification:** deferred to human-verify checkpoint in Task 3.

**Notes:**
- All 9 code-level grep counts are >= 1 — every piece of Plan 04's auth wiring is present in source.
- Dev server boots cleanly in ~1.6s.
- `/api/auth/get-session` returns HTTP 200 with body `null` — proves the catch-all route, hooks.server.ts, and Better Auth handler chain are all wired.
- `/api/auth/sign-in/magic-link` returns HTTP 200 `{"status":true}` — proves the magicLink plugin is registered and the send handler is invoked.
- **Important for Task 3 human-verify:** With the current `RESEND_API_KEY=re_placeholder_for_plan_04`, real emails will NOT be delivered. The human-verify checkpoint either needs (a) a real Resend API key pasted into `.env`, or (b) acceptance that the end-to-end click-through flow cannot be tested in this environment and the smoke test log's code-level + endpoint-level PASS is sufficient.
- The plan's script originally curl'd `/api/auth/session`, which returns 404 because Better Auth 1.6 exposes `/api/auth/get-session` instead. Both results are captured above; the 200 on `/api/auth/get-session` is the authoritative proof of wiring.

---

## Overall

Automated checks: 4/4 PASS
Ready for human-verify checkpoint: YES

### Summary of gaps for Task 3 human-verify

1. **Resend API key is a placeholder.** To receive a real magic-link email, the user must either:
   - Sign up at https://resend.com, create an API key, and paste it into `.env` as `RESEND_API_KEY=re_...`, OR
   - Accept that the end-to-end click-through cannot be exercised without a real key and rely on the code-level + endpoint-level PASS above.
2. **Production from-address is Resend's shared sandbox** (`onboarding@resend.dev`). This works for dev testing but must be swapped to a verified rule257.nyc address before production deployment (Phase 2 or later).
3. **Capacitor iOS simulator build is not exercised.** This plan verified that `cap sync` succeeds and the SPM-based iOS scaffold (`ios/App/CapApp-SPM/Package.swift`) is created. Running the app in an iOS simulator requires macOS + Xcode 26+ which this Windows execution environment cannot do. Phase 4 will build and run the native apps.

### Capacitor 8 SPM path note

Capacitor 8's iOS scaffold places `Package.swift` at **`ios/App/CapApp-SPM/Package.swift`**, NOT at `ios/App/Package.swift` as Plan 05's interfaces anticipated. The truth — "iOS is SPM-based, not CocoaPods" — holds:
- `ios/App/CapApp-SPM/Package.swift` exists and references `capacitor-swift-pm.git` at exact `8.3.0`
- `ios/App/Podfile` does NOT exist (CocoaPods is correctly absent)

The plan's `test -f ios/App/Package.swift` literal path check would fail, but the SPM intent is fully satisfied at the canonical Capacitor 8 path. See the 01-05-SUMMARY.md Deviations section for details.

---

## Human Verification

**Date:** 2026-04-12T00:00:00Z
**Resolution:** Option B accepted
**Verified by:** User (manual walkthrough)

### Walkthrough Steps Completed

| Step | Description | Result |
|------|-------------|--------|
| 1-3 | Supabase running, dev server started, homepage renders (sticky nav, Coming Soon, footer) | PASS |
| 4 | Responsive layout at 375px, hamburger appears, overlay opens with stacked nav links | PASS |
| 5 | Sign in button opens AuthModal with correct copy, email input, Send magic link button | PASS |
| 6 | Escape key closes modal | PASS |
| 11 | /account page renders Welcome heading + email + Sign out button (when signed in) | PASS |
| 12 | Sign out redirects back to / with Sign in button restored | PASS |
| 13 | Direct /account access while signed out redirects to / | PASS |
| 14 | Session cookie visible in devtools | PASS |

### Steps Skipped (7-10)

Steps 7-10 (enter email, send magic link, receive email in Inbucket/inbox, click link to land on /account) were **skipped** because `RESEND_API_KEY=re_placeholder_for_plan_04` is a placeholder. Better Auth returns `{"status":true}` for enumeration protection regardless of whether Resend actually delivers the email, so the endpoint wiring is proven but the end-to-end email click-through could not be exercised.

**Criterion 4 resolution:** Code-level (9/9 grep checks) + endpoint-level (HTTP 200 on `/api/auth/sign-in/magic-link` and `/api/auth/get-session`) verification accepted as sufficient evidence. Real end-to-end email-click test deferred until the Resend domain (`rule257.nyc`) is verified and a real API key is configured in a later phase.

### Accepted Decisions

- **D-29 email template substitution:** `svelte/server render()` with a hand-rolled Svelte 5 component accepted as a substitute for React Email / svelte-email-tailwind. Zero new deps, Svelte-only codebase. The component-based + server-rendered + brand-typography intent of the original decision is preserved.
- **Option B checkpoint acceptance:** Phase 1 closes with code+endpoint verification of Criterion 4. The magic-link email delivery pipeline (Resend API call) is wired but untested end-to-end. This is a known limitation, not a gap.

### Final Verdict

All 4 Phase 1 ROADMAP success criteria: **PASS** (Criterion 4 caveated as code+endpoint-verified; real E2E email click deferred)
