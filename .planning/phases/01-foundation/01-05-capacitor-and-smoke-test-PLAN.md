---
phase: 01-foundation
plan: 05
type: execute
wave: 4
depends_on:
  - "01-04"
files_modified:
  - package.json
  - capacitor.config.ts
  - ios/App/Package.swift
  - android/build.gradle
  - .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md
autonomous: false
requirements:
  - BRAND-06
user_setup:
  - service: none
    why: "Smoke test is local; Xcode/Android Studio only needed if the user wants to verify the native shell opens — plan does NOT run the app in a simulator"
must_haves:
  truths:
    - "Capacitor is initialized with appId 'nyc.rule257.app' and appName 'Rule 257'"
    - "iOS platform is added with SPM (Package.swift present, Podfile absent)"
    - "Android platform is added"
    - "All four Phase 1 success criteria from ROADMAP.md are demonstrably met in a single smoke-test log"
    - "`npx cap sync` runs successfully after `build:mobile`"
  artifacts:
    - path: "capacitor.config.ts"
      provides: "Capacitor 8 config pinning webDir to build/"
      contains: "webDir"
    - path: "ios/App/Package.swift"
      provides: "SPM-based iOS platform (NO Podfile)"
      contains: "swift-package"
    - path: "android/"
      provides: "Android platform scaffolding"
    - path: ".planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md"
      provides: "Evidence that all 4 phase success criteria passed"
      contains: "PASS"
  key_links:
    - from: "capacitor.config.ts"
      to: "build/ directory"
      via: "webDir: 'build'"
      pattern: "webDir.*build"
    - from: "package.json scripts"
      to: "build:mobile + cap sync"
      via: "cap:sync script"
      pattern: "cap:sync"
---

<objective>
Initialize Capacitor 8 with SPM (not CocoaPods — RESEARCH.md Pitfall #3), add iOS and Android native platforms, run a full end-to-end smoke test that verifies every one of Phase 1's four ROADMAP.md success criteria, and capture the evidence in a signed smoke-test log. A final human-verify checkpoint confirms the auth flow works with a real magic link click.

Purpose: This plan is the integration seam. Plans 01–04 built the pieces; Plan 05 proves they work together. If `cap sync` fails, if `build:mobile` produces a broken static site, or if the magic link flow doesn't actually log a user in, Phase 1 is not done. This is the gate between Phase 1 and Phase 2.

Output: `ios/` and `android/` directories, a capacitor.config.ts, updated package.json scripts for Capacitor workflows, and a smoke-test log with PASS/FAIL entries for every success criterion.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation/01-RESEARCH.md
@.planning/phases/01-foundation/01-CONTEXT.md
@.planning/ROADMAP.md
@.planning/phases/01-foundation/01-01-SUMMARY.md
@.planning/phases/01-foundation/01-02-SUMMARY.md
@.planning/phases/01-foundation/01-03-SUMMARY.md
@.planning/phases/01-foundation/01-04-SUMMARY.md
@package.json
@svelte.config.js
@.env

<interfaces>
<!-- EXACT values -->

Packages to install:
```
@capacitor/core@^8.3.0
@capacitor/cli@^8.3.0 (devDependency)
@capacitor/ios@^8.3.0
@capacitor/android@^8.3.0
```

capacitor.config.ts — EXACT (RESEARCH.md Pattern 6):
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nyc.rule257.app',
  appName: 'Rule 257',
  webDir: 'build',
  bundledWebRuntime: false
};

export default config;
```

package.json scripts additions (merge with Plan 01's scripts):
```json
"cap:sync": "npm run build:mobile && npx cap sync",
"cap:ios": "npm run cap:sync && npx cap open ios",
"cap:android": "npm run cap:sync && npx cap open android"
```

Phase 1 ROADMAP.md success criteria (the smoke-test log must map 1:1):
1. SvelteKit builds with adapter-vercel AND adapter-static via BUILD_TARGET
2. Mobile-responsive layout on any device width with safe area handling
3. Supabase local dev is running with Drizzle schema migrated (9 tables)
4. Test user can sign up and log in via Better Auth on the web
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Install Capacitor, initialize with SPM, and add native platforms</name>
  <files>
    package.json,
    capacitor.config.ts,
    ios/App/Package.swift,
    android/build.gradle
  </files>
  <read_first>
    package.json,
    .planning/phases/01-foundation/01-RESEARCH.md,
    .planning/phases/01-foundation/01-01-SUMMARY.md,
    svelte.config.js
  </read_first>
  <action>
    1. Install runtime: `npm install @capacitor/core@^8.3.0 @capacitor/ios@^8.3.0 @capacitor/android@^8.3.0`
    2. Install dev: `npm install -D @capacitor/cli@^8.3.0`
    3. Verify Node is 22+: `node --version` (must be `v22.x.x` or higher). If not, abort with a clear error message pointing at `.nvmrc`.
    4. Make sure `build/` exists by running `npm run build:mobile`. Capacitor's init flow checks the webDir.
    5. Initialize Capacitor non-interactively: `npx cap init "Rule 257" "nyc.rule257.app" --web-dir build`. This writes `capacitor.config.ts`. If the file is already present from a previous attempt, `cap init` will ask — delete the existing file first if it exists.
    6. Overwrite `capacitor.config.ts` with the EXACT content from <interfaces>. The CLI's default may not include `bundledWebRuntime: false` — the interfaces version is authoritative.
    7. Add iOS platform with EXPLICIT SPM flag (RESEARCH.md Pitfall #3 — CocoaPods is entering maintenance mode): `npx cap add ios --packagemanager SPM`.
       - On Windows, this command creates the `ios/App/` directory but may not fully configure the Xcode project (that requires macOS). The `Package.swift` file MUST be created. If the command errors with "this platform requires Xcode", continue anyway IF the `ios/` directory was created AND `ios/App/Package.swift` exists — the scaffold succeeded even if the platform-specific follow-up didn't.
       - CRITICAL: After this step runs, verify `test -f ios/App/Package.swift` succeeds AND `test ! -f ios/App/Podfile` succeeds. If `Podfile` exists, the --packagemanager SPM flag was silently ignored — DELETE `ios/` and re-run with the flag explicitly.
    8. Add Android platform: `npx cap add android`. This creates `android/` directory with a Gradle project.
    9. Edit `package.json` scripts to add the three cap:* scripts from <interfaces> (merge — do not remove Plan 01's scripts). Final scripts block should have: `dev`, `build`, `build:vercel`, `build:mobile`, `preview`, `check`, `cap:sync`, `cap:ios`, `cap:android`.
    10. Run `npx cap sync` to push the `build/` output into the native projects. This copies the web bundle into `ios/App/App/public/` and `android/app/src/main/assets/public/`. If this fails, `build/` is likely missing or malformed — re-run `npm run build:mobile` and retry.
    11. Update `.gitignore` to include native build outputs (not the platform scaffolding — keep `ios/` and `android/` tracked). Add:
        ```
        ios/App/App.xcworkspace
        ios/App/App/public
        ios/App/build
        ios/Pods
        android/.gradle
        android/app/build
        android/build
        android/app/src/main/assets/public
        android/local.properties
        ```
  </action>
  <verify>
    <automated>test -f capacitor.config.ts && grep -q "appId: 'nyc.rule257.app'" capacitor.config.ts && grep -q "appName: 'Rule 257'" capacitor.config.ts && grep -q "webDir: 'build'" capacitor.config.ts && grep -q "bundledWebRuntime: false" capacitor.config.ts && test -d ios && test -f ios/App/Package.swift && test ! -f ios/App/Podfile && test -d android && test -f android/build.gradle && grep -q '"cap:sync"' package.json && grep -q '"cap:ios"' package.json && grep -q '"cap:android"' package.json && test -d node_modules/@capacitor/core && test -d node_modules/@capacitor/ios && test -d node_modules/@capacitor/android</automated>
  </verify>
  <acceptance_criteria>
    - File `capacitor.config.ts` contains ALL four literals: `appId: 'nyc.rule257.app'`, `appName: 'Rule 257'`, `webDir: 'build'`, `bundledWebRuntime: false`
    - Directory `ios/` exists
    - File `ios/App/Package.swift` exists (SPM marker)
    - File `ios/App/Podfile` does NOT exist (CocoaPods marker would be a failure per RESEARCH.md Pitfall #3)
    - Directory `android/` exists
    - File `android/build.gradle` exists
    - `package.json` scripts contains all three of: `"cap:sync"`, `"cap:ios"`, `"cap:android"`
    - `package.json` scripts still contains all four of Plan 01's scripts: `"dev"`, `"build:vercel"`, `"build:mobile"`, `"check"`
    - `node_modules/@capacitor/core/`, `node_modules/@capacitor/ios/`, `node_modules/@capacitor/android/`, `node_modules/@capacitor/cli/` all exist
    - `npx cap sync` exits 0 after `npm run build:mobile`
  </acceptance_criteria>
  <done>
    Capacitor 8 is initialized. iOS is SPM-based (not CocoaPods). Android scaffold exists. `npx cap sync` succeeds, proving the static build in `build/` is properly wired into both native projects.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Run full smoke test against all 4 Phase 1 success criteria and write SMOKE-TEST-LOG.md</name>
  <files>
    .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md
  </files>
  <read_first>
    .planning/ROADMAP.md,
    .planning/phases/01-foundation/01-CONTEXT.md,
    package.json,
    src/routes/+page.svelte,
    src/lib/server/db/schema.ts,
    src/lib/server/auth.ts,
    svelte.config.js,
    .env
  </read_first>
  <action>
    Execute each of the four ROADMAP.md Phase 1 success criteria as an automated check, capture the output, and write a PASS/FAIL log. The log file `.planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md` must have one section per criterion with the command output embedded.

    CRITERION 1 — Dual-adapter build
    Commands:
    ```
    rm -rf build .svelte-kit/output
    npm run build:vercel 2>&1 | tail -20
    ls .svelte-kit/output/
    rm -rf build .svelte-kit/output
    npm run build:mobile 2>&1 | tail -20
    ls build/
    test -f build/index.html && echo "build/index.html PRESENT"
    grep -c 'Coming Soon' build/index.html
    grep -c 'Rule 257' build/index.html
    ```
    PASS condition: Both builds exit 0. `build/index.html` exists and contains both `Coming Soon` and `Rule 257`. Record all outputs in the log.

    CRITERION 2 — Mobile-responsive layout + safe area
    Commands (these are grep-based evidence checks — a real visual check happens in the human-verify checkpoint):
    ```
    grep -c 'viewport-fit=cover' src/app.html
    grep -c -- '--safe-top' src/app.css
    grep -c 'var(--safe-top)' src/lib/components/SafeArea.svelte
    grep -c 'md:' src/lib/components/SiteHeader.svelte
    grep -c 'md:' src/lib/components/SiteFooter.svelte
    grep -c 'md:' src/routes/+page.svelte
    grep -c 'min-h-11' src/lib/components/SiteHeader.svelte
    # Verify built output has the safe-area CSS variable
    grep -rn 'safe-area-inset' build/_app/ | head -5
    ```
    PASS condition: `viewport-fit=cover` in app.html, safe-area CSS vars in app.css AND SafeArea.svelte, mobile-first `md:` breakpoints present in header/footer/home, `min-h-11` on touch targets. Built CSS contains the safe-area insets.

    CRITERION 3 — Supabase local running + Drizzle schema migrated
    Commands:
    ```
    npx supabase status 2>&1 | head -15
    ls supabase/migrations/*.sql
    # List tables in the local database
    npx supabase db execute --local "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;" 2>&1 || docker exec $(docker ps --format '{{.Names}}' | grep supabase_db | head -1) psql -U postgres -c "\dt"
    ```
    PASS condition: Supabase is running (API URL printed). Migration SQL files exist. Table list contains at least: account, point_transaction, profile, redemption, reward, scan_token, session, user, verification.
    If Supabase is NOT running (`supabase status` fails), run `npx supabase start` as a remediation step and re-try. If Docker is not running, record the failure clearly in the log and flag the checkpoint task as blocked.

    CRITERION 4 — Test user can sign up and log in via Better Auth on the web (code-level verification + checkpoint)
    Automated portion:
    ```
    grep -c 'magicLink(' src/lib/server/auth.ts
    grep -c 'drizzleAdapter' src/lib/server/auth.ts
    grep -c 'resend.emails.send' src/lib/server/auth.ts
    grep -c 'magicLinkClient' src/lib/auth-client.ts
    grep -c 'svelteKitHandler' src/hooks.server.ts
    grep -c 'auth.handler' 'src/routes/api/auth/[...all]/+server.ts'
    grep -c 'Send magic link' src/lib/components/AuthModal.svelte
    grep -c 'authClient.useSession' src/routes/account/+page.svelte
    grep -c 'authClient.signOut' src/routes/account/+page.svelte
    # Actually boot dev server briefly and hit the auth endpoint
    npm run dev &
    DEV_PID=$!
    sleep 8
    curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/api/auth/session
    curl -s -X POST http://localhost:5173/api/auth/sign-in/magic-link -H "Content-Type: application/json" -d '{"email":"smoketest@example.com","callbackURL":"/account"}' -w "\nHTTP: %{http_code}\n"
    kill $DEV_PID 2>/dev/null
    wait $DEV_PID 2>/dev/null
    ```
    The Better Auth endpoint responses will vary (200/400/500) depending on whether Resend accepts the test email. A non-500 response to `/api/auth/session` (200 or 401 both count) proves the hook is wired. A non-5xx response to the sign-in endpoint proves the server is constructed correctly.
    PASS condition: All grep counts are >= 1. Dev server boots. `/api/auth/session` returns non-500. Sign-in endpoint returns non-500. Record every curl output.

    WRITE the log file `.planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md` with this EXACT structure:
    ```markdown
    # Phase 1 Foundation — Smoke Test Log

    **Run date:** <ISO 8601 UTC timestamp>
    **Run by:** execute-plan executor for 01-05
    **Environment:** <OS, Node version, npm version>

    ## Criterion 1 — Dual-adapter build
    **Status:** PASS | FAIL
    **Evidence:**
    ```
    <captured output>
    ```
    **Notes:** <anything noteworthy>

    ## Criterion 2 — Mobile-responsive + safe area
    **Status:** PASS | FAIL
    **Evidence:**
    ```
    <captured output>
    ```

    ## Criterion 3 — Supabase + Drizzle schema
    **Status:** PASS | FAIL
    **Evidence:**
    ```
    <captured table list>
    ```

    ## Criterion 4 — Better Auth magic link wired
    **Status:** PASS | FAIL (automated) + PENDING-HUMAN-VERIFY (end-to-end)
    **Automated evidence:**
    ```
    <captured grep counts + curl outputs>
    ```
    **Manual verification:** deferred to human-verify checkpoint in Task 3.

    ## Overall
    Automated checks: <N>/4 PASS
    Ready for human-verify checkpoint: YES | NO
    ```
  </action>
  <verify>
    <automated>test -f .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md && grep -q 'Criterion 1' .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md && grep -q 'Criterion 2' .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md && grep -q 'Criterion 3' .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md && grep -q 'Criterion 4' .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md && grep -q 'Overall' .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md && grep -q 'Automated checks: 4/4 PASS' .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md && ! grep -q 'FAIL' .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md</automated>
  </verify>
  <acceptance_criteria>
    - File `.planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md` exists
    - The file contains exactly four `## Criterion N` sections, numbered 1 through 4
    - Each Criterion section has a `**Status:**` line that includes either `PASS` or `FAIL`
    - Each Criterion section has an `**Evidence:**` block with actual captured command output (not placeholder text)
    - The file contains a final `## Overall` section with the count of passing automated checks
    - Criterion 1 evidence includes both `build:vercel` and `build:mobile` output with non-zero exit status demonstrated
    - Criterion 1 evidence includes a grep count of `Coming Soon` in `build/index.html` that is >= 1
    - Criterion 2 evidence includes counts of `md:` classes in SiteHeader and a grep hit for `viewport-fit=cover`
    - Criterion 3 evidence includes the `SELECT tablename` query output listing at least 9 tables
    - Criterion 4 evidence includes at least one HTTP status code from a curl against `/api/auth/session`
    - If any criterion is FAIL, the Overall section states `Ready for human-verify checkpoint: NO` and execution stops before Task 3
  </acceptance_criteria>
  <done>
    A complete smoke-test log is written with evidence for all four Phase 1 success criteria. If all four automated checks PASS, the checkpoint task proceeds. If any FAIL, this task writes the log and halts — Plan 05 cannot complete until the failure is resolved (which likely means re-running the relevant prior plan).
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Human-verify end-to-end magic link flow</name>
  <files>none (checkpoint task — no files modified)</files>
  <read_first>
    .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md,
    .planning/ROADMAP.md,
    .planning/phases/01-foundation/01-CONTEXT.md,
    .planning/phases/01-foundation/01-UI-SPEC.md
  </read_first>
  <action>
    This is a checkpoint:human-verify task. The executor does NOT modify files — it presents the verification script from <how-to-verify> below to the user, then waits for the user to reply with the resume-signal. The executor must:
    1. Confirm the automated smoke test from Task 2 passed on all 4 criteria (read the SMOKE-TEST-LOG.md).
    2. If any criterion FAILED in Task 2, STOP and report the failure instead of presenting this checkpoint.
    3. Start the dev server in the background (run the command: npm run dev in a background shell) and print the verification script so the user can walk through it.
    4. Wait for the user to type the word approved or describe what broke.
    5. On approved, stop the dev server and mark the task complete.
    6. On failure description, capture the feedback into a scratch note for a follow-up gap-closure plan and STOP.
  </action>
  <verify>
    <automated>test -f .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md && grep -q "Automated checks: 4/4 PASS" .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md</automated>
    <manual>User replies with the word approved after completing the 15-step verification script below.</manual>
  </verify>
  <done>
    User has typed the word approved after successfully exercising: (a) responsive layout at desktop and 375px widths, (b) hamburger menu open/close, (c) AuthModal open via Sign in button, (d) Escape key close, (e) Send magic link submission, (f) magic link email received in Inbucket or real inbox, (g) clicking the email link lands on /account with Welcome + email shown, (h) Sign out button returns to /, (i) direct /account access while signed out redirects to /, (j) session cookie visible in devtools.
  </done>
  <acceptance_criteria>
    - The SMOKE-TEST-LOG.md file contains the literal string "Automated checks: 4/4 PASS" in the Overall section
    - The user has replied with the exact word approved (or a description of what broke, which routes to a gap-closure plan instead)
    - No files are modified by this task (checkpoint tasks are read-only)
  </acceptance_criteria>
  <what-built>
    - SvelteKit project scaffold with dual-adapter config (Plan 01)
    - Supabase local + Drizzle schema (Plan 02)
    - Layout shell + Coming Soon home page (Plan 03)
    - Better Auth + magic link + AuthModal + /account stub (Plan 04)
    - Capacitor 8 with SPM + smoke test log (this plan, Tasks 1–2)
  </what-built>
  <how-to-verify>
    1. Make sure Supabase local is still running: `npx supabase status` should print API URL and DB URL. If not, run `npx supabase start`.

    2. In one terminal, start the dev server:
       ```
       npm run dev
       ```
       The server should print `Local: http://localhost:5173`.

    3. Open http://localhost:5173 in a browser. You should see:
       - A sticky top nav with `Rule 257` wordmark on the left and `The Space`, `Menu`, `Visit`, `Sign in` button on the right (desktop width) OR a hamburger button (mobile width, e.g., Chrome devtools at 375px).
       - A centered Coming Soon page with the serif heading "Coming Soon", the tagline "Where art, fashion, design, and coffee converge. 54 Eldridge St, New York.", and a hero image.
       - An editorial footer with three columns (Navigate / Visit / Follow) and the copyright line.

    4. Resize the browser to narrow (375px). Verify the layout stays readable, the hamburger appears, and tapping it opens a full-viewport overlay with the nav links stacked in serif Heading style.

    5. Click the "Sign in" button (desktop) or the "Sign in" link inside the hamburger menu (mobile). The AuthModal overlay should appear with:
       - Backdrop dimming the background
       - A card containing the heading "Sign in to Rule 257"
       - Body copy "Enter your email and we'll send you a link."
       - Email input field with placeholder "you@example.com"
       - Full-width black "Send magic link" button

    6. Press Escape. The modal should close.

    7. Click "Sign in" again to reopen. Type a real email you can access (or use Supabase's Inbucket mailbox: enter any `@example.com` address and check http://localhost:54324 to see the captured email — this works because Supabase's local stack routes all outbound SMTP through Inbucket regardless of Resend).

    8. Click "Send magic link". The button should change to "Sending...", then the modal should swap to the success state:
       - Heading "Check your email"
       - Body "We sent a sign-in link to <your email>. It expires in 10 minutes."
       - A "Use a different email" text link

    9. Go to http://localhost:54324 (Inbucket) OR your real inbox. Find the email from "Rule 257 <onboarding@resend.dev>". Subject should be "Your Rule 257 sign-in link". The email body should have the "Rule 257" heading, a "Sign in" button, and the address footer.

    10. Click the "Sign in" button in the email. It should open your browser and navigate you to `/account`.

    11. On `/account`, verify you see:
        - The Welcome heading
        - "Signed in as <your email>. Your loyalty dashboard is coming soon."
        - A "Sign out" button

    12. Click "Sign out". You should be redirected back to `/` and the header should show "Sign in" again (not signed in).

    13. Try navigating directly to `/account` while signed out. You should be redirected back to `/`.

    14. Open Chrome devtools > Application > Cookies. Confirm that after signing in you see a `better-auth.session_token` (or similarly named) cookie with HttpOnly and Secure flags.

    15. In a terminal, open the smoke test log:
        ```
        cat .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md
        ```
        Confirm it shows PASS on all four criteria.

    After verification, stop the dev server with Ctrl+C.
  </how-to-verify>
  <resume-signal>
    Type `approved` to mark Phase 1 complete. If anything failed, describe what broke (e.g., "modal didn't open", "email never arrived", "redirect loop on /account", "hamburger menu didn't open on mobile") so the issue can be routed to a gap-closure plan.
  </resume-signal>
</task>

</tasks>

<verification>
- [ ] `test -f capacitor.config.ts && test -f ios/App/Package.swift && test -d android`
- [ ] `test ! -f ios/App/Podfile` (SPM, not CocoaPods)
- [ ] `test -f .planning/phases/01-foundation/01-05-SMOKE-TEST-LOG.md`
- [ ] All 4 criteria in the smoke test log show PASS for their automated portion
- [ ] Human checkpoint signed off
</verification>

<success_criteria>
1. Capacitor 8 initialized with SPM — `ios/App/Package.swift` exists, `ios/App/Podfile` does not
2. `android/` platform scaffolded
3. `npx cap sync` succeeds after `build:mobile`
4. Smoke test log contains PASS for all 4 ROADMAP Phase 1 success criteria (automated evidence)
5. Human verifier successfully exercised the magic link flow end-to-end: enter email → receive link → click → land on /account → sign out → redirect back
6. Phase 1 is demonstrably COMPLETE — every success criterion from ROADMAP.md is met
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-05-SUMMARY.md` documenting:
- Capacitor version actually installed (from `npm ls @capacitor/core`)
- Whether the `--packagemanager SPM` flag worked cleanly on this OS, and whether Package.swift was created
- The full smoke-test log inline (embedded via a code block or link to `01-05-SMOKE-TEST-LOG.md`)
- The human verifier's notes from the resume-signal
- A short "Phase 1 DONE" declaration with a list of all files created across Plans 01-01 through 01-05
- Any leftover items that should be tracked for Phase 2 (e.g., "swap `onboarding@resend.dev` for `noreply@rule257.nyc` when domain is verified", "replace hero image with real Rule 257 photography")
</output>
</content>
</invoke>