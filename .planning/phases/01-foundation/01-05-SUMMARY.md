---
phase: 01-foundation
plan: 05
subsystem: infra
tags: [capacitor, spm, ios, android, smoke-test, dual-adapter, safe-area, supabase, better-auth, magic-link]

requires:
  - "01-01 (SvelteKit scaffold with dual-adapter config, TailwindCSS v4 tokens, self-hosted fonts)"
  - "01-02 (Supabase local + Drizzle schema with 9 tables migrated)"
  - "01-03 (Layout shell + Coming Soon home + SafeArea + SiteHeader + SiteFooter + auth-modal runes store)"
  - "01-04 (Better Auth + magic link + Resend + AuthModal + /account stub + hooks.server.ts)"
provides:
  - "Capacitor 8.3.0 initialized with SPM (not CocoaPods) — ios/ and android/ platform scaffolding committed"
  - "capacitor.config.ts with appId 'nyc.rule257.app', appName 'Rule 257', webDir 'build'"
  - "package.json cap:sync / cap:ios / cap:android scripts for Capacitor workflows"
  - "01-05-SMOKE-TEST-LOG.md with 4/4 PASS on Phase 1 ROADMAP success criteria"
  - "Human verification (Option B) confirming UI rendering, modal interactions, responsive layout, signed-out redirect, and session cookie"
  - "Phase 1 Foundation is COMPLETE — all success criteria met"
affects: [02-brand-portfolio, 03-loyalty-system, 04-native-mobile-apps]

tech-stack:
  added:
    - "@capacitor/core@8.3.0 — Capacitor runtime"
    - "@capacitor/cli@8.3.0 (devDependency) — Capacitor CLI for cap sync/add/open"
    - "@capacitor/ios@8.3.0 — iOS platform with SPM (Package.swift at ios/App/CapApp-SPM/)"
    - "@capacitor/android@8.3.0 — Android platform with Gradle project"
  patterns:
    - "cap:sync = npm run build:mobile && npx cap sync — always rebuild before syncing to native"
    - "iOS SPM path: ios/App/CapApp-SPM/Package.swift (Capacitor 8 canonical location, not ios/App/Package.swift)"
    - "Native build outputs (.gradle, app/build, xcworkspace, assets/public) in .gitignore; platform scaffolding (ios/, android/) is tracked"
    - "Smoke test log pattern: one section per ROADMAP success criterion, PASS/FAIL with captured evidence, Overall summary with count"

key-files:
  created:
    - "capacitor.config.ts"
    - "ios/ (full iOS platform scaffold with SPM)"
    - "android/ (full Android platform scaffold with Gradle)"
    - ".planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md"
  modified:
    - "package.json — +@capacitor/core, +@capacitor/ios, +@capacitor/android, +@capacitor/cli; +cap:sync, +cap:ios, +cap:android scripts"
    - "package-lock.json — locked Capacitor transitive tree"
    - ".gitignore — removed broad ios/android excludes, added specific native build-output excludes"

key-decisions:
  - "Phase 1 closed with Option B human-verify acceptance; real magic-link E2E email click deferred until Resend domain is verified"
  - "D-29 email template: svelte/server render() with hand-rolled Svelte 5 component accepted as substitute for React Email / svelte-email-tailwind (zero new deps, Svelte-only codebase)"
  - "Capacitor 8 SPM Package.swift lives at ios/App/CapApp-SPM/Package.swift (not ios/App/Package.swift as plan anticipated) — canonical Capacitor 8 path, SPM intent fully satisfied"

patterns-established:
  - "Smoke test log as phase gate: all ROADMAP success criteria must show PASS with captured evidence before phase closes"
  - "Human-verify checkpoint with Option A (full) / Option B (partial with documented caveats) resolution paths"

requirements-completed:
  - BRAND-06

metrics:
  duration: ~25min (split across two executor sessions — Task 1-2 by prior agent, Task 3 + closeout by continuation agent)
  started: 2026-04-11T02:58:00Z
  completed: 2026-04-12
---

# Phase 01 Plan 05: Capacitor and Smoke Test Summary

**Capacitor 8.3.0 with SPM initialized, iOS and Android platforms scaffolded, full Phase 1 smoke test log capturing 4/4 PASS on ROADMAP success criteria (dual-adapter build, responsive layout + safe area, Supabase + Drizzle 9 tables, Better Auth magic link wired), human-verified via Option B with E2E email click deferred until Resend domain verification**

## Performance

- **Duration:** ~25 min (split: ~15 min Tasks 1-2, ~10 min Task 3 + closeout)
- **Started:** 2026-04-11T02:58:00Z
- **Completed:** 2026-04-12
- **Tasks:** 3/3
- **Files created/modified:** 77 (75 created in ios/ + android/ scaffolding + capacitor.config.ts + smoke test log, 2 modified: package.json + .gitignore)

## Accomplishments

- Capacitor 8.3.0 installed and initialized with `appId: 'nyc.rule257.app'`, `appName: 'Rule 257'`, `webDir: 'build'`, `bundledWebRuntime: false`
- iOS platform added via `--packagemanager SPM` — `ios/App/CapApp-SPM/Package.swift` references `capacitor-swift-pm.git` at exact 8.3.0; no Podfile exists (CocoaPods correctly absent per RESEARCH.md Pitfall #3)
- Android platform scaffolded with Gradle project, `MainActivity.java` set to `nyc.rule257.app`
- `npx cap sync` succeeded after `npm run build:mobile` — web bundle copied into both `ios/App/App/public/` and `android/app/src/main/assets/public/`
- Full smoke test log written with 4/4 PASS on all Phase 1 ROADMAP success criteria:
  1. Dual-adapter build: `build:vercel` and `build:mobile` both exit 0, `build/index.html` contains "Coming Soon" and "Rule 257"
  2. Mobile-responsive + safe area: `viewport-fit=cover`, safe-area CSS vars, `md:` breakpoints, `min-h-11` touch targets, safe-area-inset in built CSS
  3. Supabase + Drizzle schema: 9 public tables (account, point_transaction, profile, redemption, reward, scan_token, session, user, verification)
  4. Better Auth magic link wired: 9/9 code-level greps, HTTP 200 on `/api/auth/get-session` and `/api/auth/sign-in/magic-link`
- Human verification (Option B) completed: UI rendering, modal open/close, responsive layout, signed-out redirect, session cookie all confirmed visually

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Capacitor 8, initialize with SPM, add iOS + Android platforms** — `f97a0e8` (feat)
2. **Task 2: Run Phase 1 smoke test and capture evidence log** — `238bcf6` (test)
3. **Task 3: Human-verify magic link (Option B accepted)** — No file-modifying commit (checkpoint task; human verification section appended to smoke test log during closeout)

## Files Created/Modified

- `capacitor.config.ts` — Capacitor 8 config with appId, appName, webDir, bundledWebRuntime
- `ios/` — Full iOS platform scaffold (Xcode project, AppDelegate.swift, SPM Package.swift, storyboards, assets)
- `android/` — Full Android platform scaffold (Gradle project, MainActivity.java, resources, splash screens)
- `.planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md` — Smoke test evidence log with 4/4 PASS + Human Verification section
- `package.json` — Added @capacitor/core, @capacitor/ios, @capacitor/android deps + cap:sync, cap:ios, cap:android scripts
- `.gitignore` — Removed broad ios/android excludes, added specific native build-output excludes

## Decisions Made

1. **Phase 1 closed with Option B** — User walked steps 1-6 and 11-14 of the verification script (UI rendering, modal interactions, responsive layout, signed-out redirect, devtools cookies). Steps 7-10 (email send/receive/click) skipped because `RESEND_API_KEY` is a placeholder. Code-level + endpoint-level PASS accepted as sufficient evidence of Criterion 4. Real E2E email click deferred to post-Resend-domain-verification.

2. **D-29 email template substitution accepted** — `svelte/server render()` with a hand-rolled Svelte 5 inline-styled component replaces the CONTEXT.md D-29 literal "React Email templates". The component-based + server-rendered + brand-typography intent is preserved with zero new deps in a pure Svelte codebase.

3. **Capacitor 8 SPM path deviation** — Plan anticipated `ios/App/Package.swift` but Capacitor 8 places it at `ios/App/CapApp-SPM/Package.swift`. The SPM intent is fully satisfied at the canonical path; no Podfile exists.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Capacitor 8 SPM Package.swift at non-anticipated path**
- **Found during:** Task 1 (step 7: add iOS platform)
- **Issue:** Plan expected `ios/App/Package.swift` but Capacitor 8.3.0 creates `ios/App/CapApp-SPM/Package.swift` as its canonical SPM location
- **Fix:** Accepted the canonical path. Plan verification adjusted to check the actual path. SPM intent (no CocoaPods) is fully satisfied.
- **Files modified:** None (path is correct as-is)
- **Verification:** `test -f ios/App/CapApp-SPM/Package.swift && test ! -f ios/App/Podfile` both pass
- **Committed in:** `f97a0e8`

**2. [Rule 3 - Blocking] Removed broad ios/android .gitignore excludes**
- **Found during:** Task 1 (step 11: update .gitignore)
- **Issue:** Pre-existing `.gitignore` had broad `ios` and `android` directory excludes which would prevent committing the platform scaffolding
- **Fix:** Removed the broad excludes; added specific native build-output excludes (ios/App/App.xcworkspace, ios/App/App/public, ios/App/build, ios/Pods, android/.gradle, android/app/build, android/build, android/app/src/main/assets/public, android/local.properties)
- **Files modified:** `.gitignore`
- **Verification:** `git status` shows ios/ and android/ files as trackable; build outputs excluded
- **Committed in:** `f97a0e8`

**3. [Rule 1 - Bug] Plan script used non-existent `npx supabase db execute --local`**
- **Found during:** Task 2 (Criterion 3 smoke test)
- **Issue:** Plan's smoke test command `npx supabase db execute --local "SELECT ..."` does not exist in Supabase CLI 2.x
- **Fix:** Fell back to `docker exec supabase_db_rule257.nyc psql -U postgres -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"` which returned all 9 tables successfully
- **Files modified:** `.planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md` (evidence captured with the working command)
- **Verification:** Query output shows exactly 9 tables matching the expected set
- **Committed in:** `238bcf6`

**4. [Informational] Plan probed /api/auth/session (404); correct endpoint is /api/auth/get-session (200 null)**
- **Found during:** Task 2 (Criterion 4 smoke test)
- **Issue:** Plan's curl script hit `/api/auth/session` which returns 404 in Better Auth 1.6. The canonical route is `/api/auth/get-session`
- **Fix:** Probed both endpoints; documented the 404 on `/session` and the 200 on `/get-session`. The 200 is the authoritative proof of wiring.
- **Files modified:** `.planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md`
- **Committed in:** `238bcf6`

**5. [Informational] Supabase local uses Mailpit on :54324 (not Inbucket as plan referenced)**
- **Found during:** Task 2 (Criterion 3 smoke test)
- **Issue:** Plan referenced "Inbucket" as the local email catcher, but `npx supabase status` shows "Mailpit" at http://127.0.0.1:54324
- **Fix:** Documented in the smoke test log notes. Functional behavior is identical (catches all outbound SMTP).
- **Committed in:** `238bcf6`

**6. [Informational] RESEND_API_KEY is still placeholder**
- **Found during:** Task 2 (Criterion 4 smoke test)
- **Issue:** `RESEND_API_KEY=re_placeholder_for_plan_04` causes Resend API calls to fail, but Better Auth returns `{"status":true}` for email enumeration protection
- **Fix:** Documented as a known limitation. Endpoint-level wiring is proven. Real email delivery deferred to post-Resend-domain-verification.
- **Committed in:** `238bcf6`

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking) + 3 informational
**Impact on plan:** All auto-fixes necessary for correctness. Informational items are documentation-only. No scope creep.

## Accepted User Decisions

1. **D-29 email template substitution** — `svelte/server render()` instead of React Email / svelte-email-tailwind. Accepted by user during human-verify checkpoint. Zero new deps, Svelte-only codebase, component-based + server-rendered + brand-typography intent preserved.

2. **Option B checkpoint resolution** — Email click-through (steps 7-10) deferred to post-Resend-domain-verification. Code+endpoint verification accepted as sufficient evidence of Criterion 4.

## Issues Encountered

None beyond the documented deviations.

## User Setup Required

None - no external service configuration required for this plan. (Resend API key configuration is documented as a Phase 2+ item.)

## Phase 1 DONE

All four ROADMAP Phase 1 success criteria are met:

| Criterion | Status | Evidence |
|-----------|--------|----------|
| 1. Dual-adapter build (adapter-vercel + adapter-static via BUILD_TARGET) | PASS | Both builds exit 0; `build/index.html` contains "Coming Soon" and "Rule 257" |
| 2. Mobile-responsive layout with safe area handling | PASS | viewport-fit=cover, safe-area CSS vars, md: breakpoints, min-h-11 touch targets |
| 3. Supabase local + Drizzle schema migrated (9 tables) | PASS | 9 public tables: account, point_transaction, profile, redemption, reward, scan_token, session, user, verification |
| 4. Test user can sign up and log in via Better Auth | PASS (code+endpoint) | 9/9 code greps, HTTP 200 on /api/auth/get-session and /api/auth/sign-in/magic-link; E2E email click deferred |

### Files Created Across Plans 01-01 through 01-05

**Plan 01 (Scaffold):** svelte.config.js, src/app.html, src/app.css, src/app.d.ts, static/fonts/*, tailwind v4 @theme tokens
**Plan 02 (Supabase + Drizzle):** src/lib/server/db/schema.ts, src/lib/server/db/index.ts, supabase/config.toml, supabase/migrations/0000_initial.sql, .env
**Plan 03 (Layout shell):** src/routes/+layout.svelte, src/routes/+page.svelte, src/lib/components/SafeArea.svelte, SiteHeader.svelte, SiteFooter.svelte, src/lib/stores/auth-modal.svelte.ts
**Plan 04 (Auth):** src/lib/server/auth.ts, src/lib/auth-client.ts, src/hooks.server.ts, src/routes/api/auth/[...all]/+server.ts, src/lib/components/AuthModal.svelte, src/routes/account/+page.svelte, src/lib/server/email/*, supabase/migrations/0001_better_auth_sync.sql
**Plan 05 (Capacitor + smoke test):** capacitor.config.ts, ios/*, android/*, 01-05-SMOKE-TEST-LOG.md

### Leftover Items for Phase 2+

- **Resend domain verification:** Swap `onboarding@resend.dev` for a verified `rule257.nyc` address (requires DNS DKIM+SPF setup at https://resend.com/domains)
- **Real RESEND_API_KEY:** Replace `re_placeholder_for_plan_04` in `.env` with a real Resend API key
- **Hero image:** Replace Coming Soon placeholder with real Rule 257 photography
- **Nav link hrefs:** Replace `#` placeholders in SiteHeader/SiteFooter with real routes as Phase 2 builds them
- **iOS simulator build:** Not exercised on Windows; Phase 4 will build and run the native apps on macOS + Xcode 26+
- **E2E magic link email click test:** Deferred until Resend domain is verified and a real API key is configured

## Known Stubs

- `/account` is a deliberate Phase 1 stub per CONTEXT.md D-34/D-35/D-36: renders only Welcome + email + Sign out. Phase 3 (LOYAL-01 through LOYAL-09) builds the real loyalty dashboard.
- `RESEND_API_KEY=re_placeholder_for_plan_04` in `.env` is a local-dev placeholder. Real email delivery requires a production Resend key.
- `from: 'Rule 257 <onboarding@resend.dev>'` is Resend's shared dev sender. Production must use a verified rule257.nyc address.
- SiteHeader and SiteFooter nav links use `href="#"` placeholders for routes not yet built (The Space, Menu, Visit, etc.).

## Self-Check: PASSED

All claimed files exist on disk and all claimed commits exist in git history:

**Files:**
- `capacitor.config.ts` -- FOUND
- `ios/App/CapApp-SPM/Package.swift` -- FOUND
- `android/build.gradle` -- FOUND
- `.planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md` -- FOUND
- `.planning/phases/01-foundation/01-05-SUMMARY.md` -- FOUND (this file)
- `ios/` directory -- FOUND
- `android/` directory -- FOUND
- `ios/App/Podfile` -- CONFIRMED ABSENT (SPM, not CocoaPods)

**Commits:**
- `f97a0e8` (Task 1: Capacitor init + iOS SPM + Android) -- FOUND
- `238bcf6` (Task 2: smoke test log) -- FOUND

---

*Phase: 01-foundation*
*Completed: 2026-04-12*
