---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [sveltekit, svelte5, tailwindcss-v4, vite, typescript, adapter-vercel, adapter-static, capacitor-prep, fraunces, inter, cross-env, fontsource]

requires: []
provides:
  - "SvelteKit 2.57 + Svelte 5.55 + TypeScript scaffold at project root (rule257-nyc)"
  - "Dual-adapter svelte.config.js that swaps adapter-vercel <-> adapter-static on BUILD_TARGET=mobile"
  - "cross-env-wrapped build:vercel and build:mobile npm scripts (Windows-portable)"
  - "Node 22 version lock via .nvmrc and package.json engines"
  - "TailwindCSS v4 CSS-first @theme block with all Phase 1 design tokens (color, font, spacing, breakpoints, motion)"
  - "Self-hosted Fraunces and Inter woff2 fonts in static/fonts/ with preload links in app.html"
  - "viewport-fit=cover meta tag + safe-area-inset CSS variables"
  - ":focus-visible global indicator and prefers-reduced-motion guard (WCAG baseline)"
  - "Better Auth Session/User types declared on App.Locals in src/app.d.ts (wiring follows in Plan 04)"
  - ".env.example with placeholders for DATABASE_URL, BETTER_AUTH_*, RESEND_API_KEY, PUBLIC_SUPABASE_*"
affects: [01-02-supabase-drizzle-schema, 01-03-layout-shell-and-home, 01-04-auth-magic-link, 01-05-capacitor-and-smoke-test, 02-brand-portfolio, 05-polish-and-atmosphere]

tech-stack:
  added:
    - "svelte ^5.55.3"
    - "@sveltejs/kit ^2.57.1"
    - "@sveltejs/adapter-vercel ^5.10.3"
    - "@sveltejs/adapter-static ^3.0.10"
    - "@sveltejs/vite-plugin-svelte ^7.0.0"
    - "@tailwindcss/vite ^4.2.2"
    - "tailwindcss ^4.2.2"
    - "typescript ^5.9.3"
    - "vite ^8.0.8"
    - "cross-env ^7.0.3"
    - "svelte-check ^4.4.6"
    - "@fontsource/fraunces ^5.2.9 (distribution channel for woff2 files; not imported from CSS)"
    - "@fontsource/inter ^5.2.8 (distribution channel for woff2 files; not imported from CSS)"
  patterns:
    - "Dual-target build via BUILD_TARGET env var read in svelte.config.js (RESEARCH.md Pattern 1)"
    - "TailwindCSS v4 CSS-first @theme token declarations (RESEARCH.md Pattern 2) - no tailwind.config.js"
    - "Self-hosted fonts referenced directly by @font-face in app.css, distributed via @fontsource devDeps + file copy to static/fonts/ (avoids runtime @fontsource CSS imports)"
    - "Safe-area insets as CSS variables (--safe-top/right/bottom/left) set on :root, consumable by any component"
    - "Global :focus-visible indicator (WCAG 2.4.7) with 2px ink outline on paper background"
    - "Global prefers-reduced-motion guard collapsing all transitions/animations to 0.01ms"

key-files:
  created:
    - "package.json - rule257-nyc manifest, Node 22 engine, dual-adapter scripts"
    - ".nvmrc - single line '22'"
    - ".env.example - placeholder env vars for later plans"
    - ".gitignore - node_modules, build, .svelte-kit, .env*, ios, android, supabase temp dirs"
    - "svelte.config.js - dual-adapter BUILD_TARGET switch with bundleStrategy: 'single' on mobile"
    - "vite.config.ts - @tailwindcss/vite + sveltekit plugins, host 0.0.0.0"
    - "src/app.css - @theme token block, @font-face declarations, global baseline"
    - "src/app.html - viewport-fit=cover + font preload links"
    - "src/app.d.ts - App.Locals with optional session/user from better-auth"
    - "src/routes/+layout.svelte - imports app.css, renders {@render children()}"
    - "src/routes/+page.svelte - scaffold smoke-test placeholder (Plan 03 replaces)"
    - "static/fonts/Fraunces-Regular.woff2 - ~18KB, Latin 400 normal"
    - "static/fonts/Inter-Regular.woff2 - ~24KB, Latin 400 normal"
  modified: []

key-decisions:
  - "Scaffold into temp subdir __scaffold__ then move files up, to preserve pre-existing .planning/ and PROJECT_CONTEXT.md"
  - "Pin typescript ^5.5.0 per plan interfaces rather than the scaffolder's ^6.0.2 (wrote ^5.5.0, npm resolved to 5.9.3 within range)"
  - "Use @fontsource/fraunces + @fontsource/inter as the font distribution channel (file copy to static/fonts/), not as CSS imports. Keeps self-hosted woff2 files checked into static/ while making version upgrades trivial."
  - "Bring svelte.config.js dual-adapter rewrite forward from Task 2 to Task 1 so npx svelte-kit sync could resolve imports after removing @sveltejs/adapter-auto from deps (ordering blocker)."
  - "Keep @sveltejs/vite-plugin-svelte ^7.0.0 and vite ^8.0.8 as scaffolded by sv CLI — plan interfaces left these as 'whatever sv scaffolded'."

patterns-established:
  - "BUILD_TARGET=mobile switch: one env var chooses static adapter with SPA fallback and single-bundle output strategy; anything else (including empty) uses adapter-vercel"
  - "CSS-first Tailwind v4: all design tokens live in src/app.css @theme block, no tailwind.config.js file exists anywhere"
  - "Self-hosted font pipeline: install @fontsource/* as devDep, copy the specific Latin-400-normal.woff2 into static/fonts/ with human-readable names, reference via @font-face in app.css using absolute /fonts/*.woff2 paths"
  - "Phase 1 safe-area scaffolding: CSS variables declared now on :root, consumed by Plan 03's SafeArea wrapper component"

requirements-completed:
  - BRAND-06

duration: 11min
completed: 2026-04-11
---

# Phase 01 Plan 01: Scaffold and Tokens Summary

**SvelteKit 2.57 + Svelte 5.55 + TailwindCSS v4 scaffold with dual-adapter (adapter-vercel for web, adapter-static for Capacitor) swapped via BUILD_TARGET env, self-hosted Fraunces + Inter woff2 fonts, and a complete editorial design token block (pure B&W palette, editorial serif/sans stack, motion tokens, safe-area insets).**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-04-11T01:40:54Z
- **Completed:** 2026-04-11T01:52:00Z
- **Tasks:** 2/2
- **Files created/modified:** 18

## Accomplishments

- `rule257-nyc` SvelteKit project exists at the project root, built cleanly by both `npm run build:vercel` (exits 0, writes to `.svelte-kit/output/`) and `npm run build:mobile` (exits 0, writes `build/index.html` via `adapter-static` SPA fallback)
- All six Phase 1 color tokens (`--color-paper`, `--color-paper-muted`, `--color-hairline`, `--color-ink`, `--color-ink-muted`, `--color-destructive`), both font-family tokens (Fraunces serif, Inter sans), spacing base, four breakpoints, and four motion tokens are in `src/app.css` inside a single `@theme` block — exactly the Phase 5 dark-mode flip point promised by CONTEXT.md D-04
- `viewport-fit=cover` is in `src/app.html` alongside two `<link rel="preload" as="font" type="font/woff2" crossorigin>` tags — one for Fraunces-Regular.woff2 and one for Inter-Regular.woff2
- Self-hosted `static/fonts/Fraunces-Regular.woff2` (~18KB) and `static/fonts/Inter-Regular.woff2` (~24KB) both have valid `wOF2` magic headers and are referenced via `@font-face` in `app.css` — no runtime font loading from Google Fonts or CDNs
- `.nvmrc` pins Node to `22`, `package.json` declares `"engines": { "node": ">=22" }`, and `cross-env` is installed so `build:vercel` / `build:mobile` scripts work identically on Windows, macOS, and Linux
- `.planning/` and `PROJECT_CONTEXT.md` survived the scaffold intact

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold SvelteKit + TypeScript + TailwindCSS v4 tokens and pin Node 22** - `4ac1867` (feat)
2. **Task 2: Install self-hosted Fraunces + Inter fonts and verify dual build** - `b893c34` (feat)

_Note: `svelte.config.js` was written in the Task 1 commit rather than Task 2, because `npx svelte-kit sync` (a Task 1 step) could not resolve imports after I removed `@sveltejs/adapter-auto` from `package.json` devDependencies. Task 2 verified the already-correct file._

## Installed Package Versions (`npm ls --depth=0`)

```
rule257-nyc@0.0.1
├── @fontsource/fraunces@5.2.9
├── @fontsource/inter@5.2.8
├── @sveltejs/adapter-static@3.0.10
├── @sveltejs/adapter-vercel@5.10.3
├── @sveltejs/kit@2.57.1
├── @sveltejs/vite-plugin-svelte@7.0.0
├── @tailwindcss/vite@4.2.2
├── cross-env@7.0.3
├── svelte-check@4.4.6
├── svelte@5.55.3
├── tailwindcss@4.2.2
├── typescript@5.9.3
└── vite@8.0.8
```

## Build Verification Output (trimmed)

**`npm run build:vercel`:**
```
vite v8.0.8 building ssr environment for production...
  ✓ 142 modules transformed.
vite v8.0.8 building client environment for production...
  ✓ 154 modules transformed.
  ✓ built in 199ms (client) / 2.24s (server)
> Using @sveltejs/adapter-vercel
  ✔ done
```

**`npm run build:mobile`:**
```
vite v8.0.8 building ssr environment for production...
  ✓ 142 modules transformed.
vite v8.0.8 building client environment for production...
  ✓ 155 modules transformed.
  .svelte-kit/output/client/_app/immutable/bundle.CRdDl3fv.js   72.60 kB │ gzip: 27.53 kB
  ✓ built in 187ms (client) / 3.50s (server)
> Using @sveltejs/adapter-static
  Wrote site to "build"
  ✔ done
```

The mobile build produces a single `bundle.CRdDl3fv.js` (72.60 kB), confirming `bundleStrategy: 'single'` is active on the mobile branch of the adapter switch. The vercel build produces separate chunked assets, confirming the default Vercel adapter is used otherwise.

## Files Created/Modified

- `package.json` - rule257-nyc manifest, Node 22 engine, `dev`/`build`/`build:vercel`/`build:mobile`/`preview`/`check` scripts, all dual-adapter + Tailwind v4 + cross-env + @fontsource dev deps
- `package-lock.json` - pinned dep tree after npm install
- `.nvmrc` - `22`
- `.env.example` - DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, RESEND_API_KEY, PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY placeholders
- `.gitignore` - node_modules, build, .svelte-kit, .vercel, .env*, ios, android, supabase/.branches, supabase/.temp
- `svelte.config.js` - dual-adapter BUILD_TARGET switch with `pages`, `assets`, `fallback: 'index.html'`, `strict: false` on mobile branch and `bundleStrategy: 'single'` conditionally spread into kit config
- `vite.config.ts` - `tailwindcss()` + `sveltekit()` plugins, `server.host: '0.0.0.0'`, port 5173
- `tsconfig.json` - scaffolder default (extends `./.svelte-kit/tsconfig.json`)
- `src/app.css` - `@import "tailwindcss"; @theme { ... }` block with all tokens, `@font-face` for Fraunces + Inter, `:root` safe-area vars, global html baseline, h1-h6 serif override, `prefers-reduced-motion` global guard, `:focus-visible` indicator
- `src/app.html` - viewport-fit=cover meta, description meta, favicon, Fraunces + Inter woff2 preload links
- `src/app.d.ts` - `App.Locals` with optional `session?` and `user?` typed from `better-auth` (wired in Plan 04)
- `src/routes/+layout.svelte` - imports `../app.css`, renders `{@render children()}` via Svelte 5 runes
- `src/routes/+page.svelte` - `<h1>Rule 257 — scaffold OK</h1>` placeholder (Plan 03 replaces with real Coming Soon page per CONTEXT.md D-21)
- `static/fonts/Fraunces-Regular.woff2` - self-hosted Latin 400 normal (copied from @fontsource/fraunces)
- `static/fonts/Inter-Regular.woff2` - self-hosted Latin 400 normal (copied from @fontsource/inter)
- `static/robots.txt` - scaffolder default (kept)
- `src/lib/index.ts`, `src/lib/assets/favicon.svg` - scaffolder defaults (kept; `+layout.svelte` no longer imports favicon because the interface-block layout was minimal)
- `.vscode/extensions.json` - scaffolder default (kept)
- `README.md` - scaffolder default (kept)

## Decisions Made

- **Scaffold routing:** Used the `__scaffold__` temp-directory workaround. `sv create .` refuses to write into a directory that already contains `.planning/`, so I scaffolded into `__scaffold__/`, then moved all files (including dotfiles via `shopt -s dotglob`) up one level and removed the temp directory. `.planning/`, `.git/`, `PROJECT_CONTEXT.md`, and `CLAUDE.md` were all preserved.
- **CLAUDE.md:** Was missing from disk at the start of this plan (pre-existing uncommitted deletion from an earlier GSD session). Restored via `git checkout HEAD -- CLAUDE.md` so the canonical reference file survives into Plan 02.
- **TypeScript version:** Plan interfaces pinned `typescript ^5.5.0`. Scaffolder had set `^6.0.2`. I followed the plan and wrote `^5.5.0`; npm resolved to `5.9.3`, which is semver-compatible and kept the project within the pinned-versions matrix from RESEARCH.md.
- **Font delivery:** Installed `@fontsource/fraunces` and `@fontsource/inter` as devDependencies and copied `fraunces-latin-400-normal.woff2` and `inter-latin-400-normal.woff2` into `static/fonts/` with human-readable names (`Fraunces-Regular.woff2`, `Inter-Regular.woff2`). This preserves self-hosting (files shipped with the site, no CDN at runtime) while making future weight/variant additions a one-line `cp` command. Direct Google Fonts URLs were rejected because they drift and return HTML error pages when moved.
- **Adapter order ambiguity:** `@sveltejs/vite-plugin-svelte` is at `^7.0.0` in the scaffolded tree. This is newer than what RESEARCH.md references but matches what `sv@0.15.1` installs, and both builds succeed. Kept scaffolder-provided version per plan interfaces ("whatever sv scaffolded").
- **Svelte config brought forward:** The plan assigns `svelte.config.js` to Task 2. Task 1's step 14 is `npx svelte-kit sync`, which requires resolving all adapter imports. Since I removed `@sveltejs/adapter-auto` from devDependencies in Task 1, the scaffolder's `svelte.config.js` (which imported `adapter-auto`) failed to sync. I brought Task 2's svelte.config.js rewrite forward so Task 1 could complete. Task 2 then verified the file against its acceptance criteria without modification.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] svelte.config.js rewrite had to move from Task 2 to Task 1**
- **Found during:** Task 1 (step 14: `npx svelte-kit sync`)
- **Issue:** The scaffolded `svelte.config.js` imports `@sveltejs/adapter-auto`, which is not in the pinned-versions matrix and which I removed from devDependencies in Task 1 per the plan's interfaces block. `npx svelte-kit sync` then errored with `Cannot find package '@sveltejs/adapter-auto' imported from svelte.config.js`.
- **Fix:** Wrote the full dual-adapter `svelte.config.js` (Task 2's primary deliverable — copied verbatim from the interfaces block) during Task 1 so `sync` could resolve imports. Task 2 then verified the file matched its acceptance criteria (no further edit needed).
- **Files modified:** `svelte.config.js`
- **Verification:** `grep -q "BUILD_TARGET === 'mobile'"` + `grep -q "adapterStatic"` + `grep -q "adapterVercel"` + `grep -q "bundleStrategy: 'single'"` + `grep -q "fallback: 'index.html'"` all pass
- **Committed in:** `4ac1867` (Task 1), verified-only in `b893c34` (Task 2)

**2. [Rule 3 - Blocking] Restored CLAUDE.md that was pre-existing deleted on disk**
- **Found during:** Task 1 (pre-commit git status check)
- **Issue:** `git status --short` showed `D CLAUDE.md`. CLAUDE.md was tracked in HEAD but absent from the working tree at the start of this plan (pre-existing uncommitted deletion). The plan does not tell me to delete CLAUDE.md, and CONTEXT.md lists `CLAUDE.md` as a canonical reference for downstream agents.
- **Fix:** `git checkout HEAD -- CLAUDE.md` to restore.
- **Files modified:** `CLAUDE.md` (restored, no content change)
- **Verification:** File re-exists on disk and matches HEAD.
- **Committed in:** Not committed (restored to HEAD state, no staged change)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - Blocking)
**Impact on plan:** Neither deviation changed scope or output. Both were ordering / pre-existing-state issues that would have blocked the plan's documented verification commands.

## Issues Encountered

- **sv CLI refuses non-empty directory:** Known workaround listed in the plan was used (scaffold to `__scaffold__`, then move files up with dotglob). Worked on first attempt.
- **`@sveltejs/vite-plugin-svelte@7.0.0`** emitted a `[PLUGIN_TIMINGS]` warning during the mobile build (`vite-plugin-sveltekit-guard` at 67% of build time). This is informational only and does not affect build success. Tracked but not fixed — this is scaffolder-default tooling.
- **npm audit reports 4 vulnerabilities** (3 low, 1 moderate) in the dev dep tree. Not in scope for this plan — pre-existing warnings in scaffolded / transitive deps. Logged here and not fixed.

## Known Stubs

- `src/routes/+page.svelte` contains `<h1>Rule 257 — scaffold OK</h1>`. This is an intentional, plan-scoped stub documented in Task 1 step 9 of the PLAN and in CONTEXT.md D-21/D-22. **Plan 03 (`01-03-layout-shell-and-home-PLAN.md`)** replaces this with the real Coming Soon page built against the design tokens established here.
- `src/app.d.ts` declares `session?` and `user?` on `App.Locals` from `better-auth`, but neither `better-auth` nor `hooks.server.ts` is wired yet. This is intentional — the type declaration is Phase 1 foundation work, the actual wiring ships in **Plan 04 (`01-04-auth-magic-link-PLAN.md`)**. Until then, `svelte-check` may complain about the unresolved `better-auth` import; this is expected and will be fixed by Plan 04 installing the package.

## User Setup Required

None - no external service configuration required in this plan. External services (Supabase, Resend, Better Auth secrets) are configured in Plans 02 and 04.

## Next Phase Readiness

**Ready for Plan 01-02 (Supabase + Drizzle schema):**
- `package.json` and Node 22 lock in place, so `npm install drizzle-orm drizzle-kit postgres` can proceed
- `.env.example` already has the `DATABASE_URL` placeholder for Supabase local
- `.gitignore` already excludes `supabase/.branches` and `supabase/.temp`

**Ready for Plan 01-03 (Layout shell + home):**
- Design tokens are in `src/app.css` — components can consume them via Tailwind v4 utilities (`text-[--color-ink]`, `bg-[--color-paper]`, `font-serif`, `font-sans`) or via raw CSS var references
- Safe-area CSS variables exist on `:root` — `SafeArea.svelte` wrapper can consume them immediately
- `+layout.svelte` is a minimal scaffold ready to host `SafeArea > SiteHeader > main > SiteFooter`

**Ready for Plan 01-04 (Auth magic link):**
- `.env.example` has `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`
- `src/app.d.ts` already declares the `App.Locals` shape Better Auth will populate

**Ready for Plan 01-05 (Capacitor + smoke test):**
- `build:mobile` produces `build/index.html` — Capacitor's `webDir: "build"` will point at this
- `.gitignore` already excludes `ios/` and `android/` so `npx cap add` output won't pollute git

**No blockers or open architectural concerns.**

## Self-Check: PASSED

All claimed files exist on disk and all claimed commits exist in git history:

- Files: package.json, .nvmrc, .gitignore, .env.example, svelte.config.js, vite.config.ts, src/app.html, src/app.css, src/app.d.ts, src/routes/+layout.svelte, src/routes/+page.svelte, static/fonts/Fraunces-Regular.woff2, static/fonts/Inter-Regular.woff2, .planning/phases/01-foundation/01-01-SUMMARY.md — all FOUND
- Commits: `4ac1867` (Task 1), `b893c34` (Task 2) — both FOUND

---
*Phase: 01-foundation*
*Completed: 2026-04-11*
