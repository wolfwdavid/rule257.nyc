---
phase: 01-foundation
plan: 03
subsystem: ui-shell
tags: [svelte5, runes, sveltekit, tailwindcss-v4, adapter-static, prerender, safe-area, accessibility, editorial]

requires:
  - "01-01 (scaffold, design tokens, safe-area CSS vars, Fraunces + Inter @font-face)"
provides:
  - "SafeArea.svelte — env(safe-area-inset-*) wrapper applied at +layout.svelte root"
  - "auth-modal.svelte.ts — shared $state(false) runes store with open()/close()/openModal() methods (Plan 04 consumer)"
  - "SiteHeader.svelte — sticky h-16/md:h-20 top nav, scroll opacity + backdrop-blur past 24px, wordmark left, desktop nav + Sign in CTA right, hamburger on mobile"
  - "MobileMenu.svelte — role=dialog aria-modal overlay, slide from right 200ms cubicOut, serif Heading nav links, Escape key, prefers-reduced-motion honored"
  - "SiteFooter.svelte — py-24/md:py-32 editorial 3-column grid (Navigate/Visit/Follow), hairline rule, copyright row"
  - "+layout.svelte — composes SafeArea > SiteHeader > main > SiteFooter via snippet shadowing"
  - "+page.svelte — Phase 1 Coming Soon home page with UI-SPEC locked copy, 16:9 hero image, editorial vertical rhythm"
  - "+layout.ts — prerender=true so adapter-static writes real HTML into build/index.html"
  - "static/images/rule257-coming-soon.jpg — 587KB unsplash placeholder (option b), Phase 2 will replace with real brand photography"
affects: [01-04-auth-magic-link, 01-05-capacitor-and-smoke-test, 02-brand-portfolio]

tech-stack:
  added: []
  patterns:
    - "Svelte 5 runes-based shared state via .svelte.ts module ($state, get/set accessors in exported object)"
    - "Snippet-based layout composition: outer layout rename the children prop to avoid double-name shadowing with SafeArea's own children snippet"
    - "adapter-static with prerender=true + fallback='200.html' — prerendered index.html survives, 200.html handles SPA fallback"
    - "Bindable Svelte 5 component props: let { open = $bindable(false) } = $props() in MobileMenu, bound from SiteHeader with bind:open"
    - "Reduced-motion branch in MobileMenu: duplicate non-transition render path gated by matchMedia check"

key-files:
  created:
    - "src/lib/components/SafeArea.svelte"
    - "src/lib/components/SiteHeader.svelte"
    - "src/lib/components/SiteFooter.svelte"
    - "src/lib/components/MobileMenu.svelte"
    - "src/lib/stores/auth-modal.svelte.ts"
    - "src/routes/+layout.ts"
    - "static/images/rule257-coming-soon.jpg"
    - "static/favicon.svg"
  modified:
    - "src/routes/+layout.svelte (replaced Plan 01's minimal pass-through with full SafeArea > Header > main > Footer composition)"
    - "src/routes/+page.svelte (replaced Plan 01's scaffold placeholder with Coming Soon page)"
    - "src/app.html (dangling /favicon.png → /favicon.svg, required by prerender)"
    - "svelte.config.js (adapter-static fallback: 'index.html' → '200.html' so prerendered index survives)"

key-decisions:
  - "adapter-static fallback renamed to 200.html so prerendered index.html isn't overwritten by the SPA shell. The Vercel adapter branch is unaffected."
  - "Added src/routes/+layout.ts with prerender = true so adapter-static emits real HTML into build/index.html (required by the plan's verify step)."
  - "Hero image sourced from unsplash (option b in the plan's fallback ladder) — 587KB, valid JPEG magic bytes ff d8 ff. Options a/c/d not needed."
  - "MobileMenu has two duplicate render blocks (one with transition:fly, one without) gated by a reduced-motion $state. This is the simplest way to honor prefers-reduced-motion with Svelte's built-in transitions without disabling them globally."
  - "SafeArea snippet shadowing resolved by renaming the outer +layout.svelte prop to pageContent — inner SafeArea snippet keeps the children name."
  - "href='#' on Phase 1 nav placeholders generates svelte-check a11y_invalid_attribute warnings. These are plan-mandated placeholders per UI-SPEC Copywriting Contract (The Space/Menu/Visit → Phase 2 wires real hrefs). Left as warnings since they're not errors and the warnings are the literal link the plan asked for."

requirements-completed:
  - BRAND-06

metrics:
  duration: ~15min
  started: 2026-04-11T02:00:01Z
  completed: 2026-04-11T02:15:17Z
  tasks: 3
  files: 12
---

# Phase 01 Plan 03: Layout Shell and Home Page Summary

**Phase 1 layout shell is live: SafeArea wraps env(safe-area-inset-*), sticky editorial SiteHeader with scroll-fade + hamburger, slide-in MobileMenu with Escape/reduced-motion handling, 3-column SiteFooter placeholder, and a prerendered Coming Soon home page with the locked UI-SPEC copy (Fraunces 56px display, Inter 16px body tagline, 16:9 hero image) — both `npm run build:vercel` and `npm run build:mobile` succeed and `build/index.html` contains `Coming Soon`, `Rule 257`, and `© 2026 Rule 257`.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-11T02:00:01Z
- **Completed:** 2026-04-11T02:15:17Z
- **Tasks:** 3/3
- **Files created/modified:** 12 (8 created, 4 modified)

## Accomplishments

- All four layout shell components exist in `src/lib/components/` (SafeArea, SiteHeader, SiteFooter, MobileMenu) and are wired into the root layout via snippet composition
- `src/lib/stores/auth-modal.svelte.ts` exports a runes-based `authModal` singleton with `open`/`close`/`openModal` methods — SiteHeader's Sign in button calls `authModal.openModal()` and Plan 04's forthcoming `<AuthModal />` will mount inside `+layout.svelte` and read the same state
- SiteHeader implements all six locked UI-SPEC behaviors: sticky `top-0 z-40`, `h-16 md:h-20 px-6 md:px-12`, `border-b border-[color:var(--color-hairline)]`, `$effect` listening to `window.scrollY` that swaps the bg-paper/80 + backdrop-blur-sm class when scrolled > 24px, desktop nav with `group-hover:after:w-full` underline animation, mobile hamburger at `min-h-11 min-w-11` 44px touch target, and the correct `authModal.openModal()` wiring
- MobileMenu uses `$bindable(false)` for the open prop, renders `role="dialog" aria-modal="true"` with `svelte/transition` fly + `svelte/easing` cubicOut 200ms, traps Escape key via scoped `$effect`, and branches to a non-transition render path when `prefers-reduced-motion: reduce` is active
- SiteFooter renders the three-column `Navigate / Visit / Follow` grid with the exact address (54 Eldridge St), phone (+1 917-774-7263), and Instagram handle (@rule257.nyc) placeholders from UI-SPEC
- Coming Soon `+page.svelte` contains the EXACT locked copy from UI-SPEC Copywriting Contract: display heading `Coming Soon`, tagline `Where art, fashion, design, and coffee converge. 54 Eldridge St, New York.`, hero image with `alt="Rule 257 — 54 Eldridge St, NYC"`, `loading="eager"`, `fetchpriority="high"`, `width="1600" height="900"`, `aspect-[16/9] object-cover`, wrapped in `<section aria-label="Coming soon">`
- Vertical rhythm honors D-09/D-10/D-11 editorial pacing: `gap-12 py-32 md:py-40 min-h-[calc(100vh-10rem)]`
- Both builds succeed: `npm run build:vercel` (4.93s) and `npm run build:mobile` (7.75s)
- `build/index.html` is prerendered HTML containing `Coming Soon`, `Rule 257`, and `© 2026 Rule 257` — verifiable with plain grep

## Task Commits

Each task was committed atomically with `--no-verify` (parallel-wave flag):

1. **Task 1: SafeArea + auth-modal store + hero image** — `ba1080b` (feat)
2. **Task 2: SiteHeader + MobileMenu + SiteFooter** — `485450e` (feat)
3. **Task 3: +layout.svelte + Coming Soon +page.svelte** — `36b78f5` (feat)

## Build Verification

### `npm run build:vercel`

```
vite v8.0.8 building client environment for production...
 ✓ built in 745ms
vite v8.0.8 building ssr environment for production...
 ✓ built in 4.93s
> Using @sveltejs/adapter-vercel
 ✔ done
```

### `npm run build:mobile`

```
vite v8.0.8 building client environment for production...
vite v8.0.8 building ssr environment for production...
 ✓ built in 7.75s
> Using @sveltejs/adapter-static
 Wrote site to "build"
 ✔ done
```

### Prerendered HTML snippet from `build/index.html` (trimmed)

```html
<div class="min-h-dvh" style="padding-top: var(--safe-top); padding-bottom: var(--safe-bottom); padding-left: var(--safe-left); padding-right: var(--safe-right);">
  <div class="flex min-h-dvh flex-col">
    <header class="sticky top-0 z-40 h-16 md:h-20 px-6 md:px-12 flex items-center justify-between border-b border-[color:var(--color-hairline)] transition-[background-color,backdrop-filter] duration-200 ease-out bg-[color:var(--color-paper)]">
      <a href="/" class="inline-flex min-h-11 items-center font-serif text-[28px] font-normal leading-none text-[color:var(--color-ink)]">Rule 257</a>
      <nav class="hidden items-center gap-8 md:flex">
        ...
        <button type="button" class="min-h-11 min-w-11 bg-[color:var(--color-ink)] px-6 py-3 font-sans text-[13px] font-normal uppercase tracking-wide text-[color:var(--color-paper)] transition-opacity duration-150 ease-out hover:opacity-85">Sign in</button>
      </nav>
      <button type="button" aria-label="Open menu" class="inline-flex min-h-11 min-w-11 flex-col items-center justify-center gap-[6px] md:hidden">
        <span class="block h-[2px] w-6 bg-[color:var(--color-ink)]"></span>
        <span class="block h-[2px] w-6 bg-[color:var(--color-ink)]"></span>
        <span class="block h-[2px] w-6 bg-[color:var(--color-ink)]"></span>
      </button>
    </header>
    <main class="flex-1">
      <section aria-label="Coming soon" class="flex flex-col items-center justify-center gap-12 px-6 py-32 md:py-40 min-h-[calc(100vh-10rem)]">
        <img src="/images/rule257-coming-soon.jpg" alt="Rule 257 — 54 Eldridge St, NYC" width="1600" height="900" loading="eager" fetchpriority="high" class="w-full max-w-2xl aspect-[16/9] object-cover"/>
        <h1 class="font-serif text-[56px] font-normal leading-none text-[color:var(--color-ink)]">Coming Soon</h1>
        <p class="font-sans text-base leading-relaxed text-[color:var(--color-ink-muted)] max-w-lg text-center">Where art, fashion, design, and coffee converge. 54 Eldridge St, New York.</p>
      </section>
    </main>
    <footer class="py-24 md:py-32 px-6 md:px-12 border-t border-[color:var(--color-hairline)]">
      ...
      <div class="mt-16 flex flex-col justify-between gap-4 border-t border-[color:var(--color-hairline)] pt-8 font-sans text-base leading-relaxed text-[color:var(--color-ink-muted)] md:flex-row">
        <p>Rule 257 · 54 Eldridge St, New York, NY</p>
        <p>© 2026 Rule 257</p>
      </div>
    </footer>
  </div>
</div>
```

All locked UI-SPEC copy is present verbatim.

## Hero Image Source

**Option (b) — unsplash download** was used and succeeded on first attempt. The file at `static/images/rule257-coming-soon.jpg` is a 587 KB JPEG downloaded from `https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&q=80` with valid JPEG magic bytes `ff d8 ff`. Options (a) Rule 257 brand photography, (c) ImageMagick solid fill, and (d) last-resort Node base64 placeholder were NOT needed.

**Phase 2 replacement note:** Unsplash is still a placeholder. Phase 2 BRAND-01 should replace this with real Rule 257 brand photography shot at 54 Eldridge St.

## Svelte 5 Compiler Quirks Hit

1. **`class:` directive cannot use different modifier suffixes as keys.** My first pass on SiteHeader had `class:bg-[color:var(--color-paper)]={!scrolled}` and `class:bg-[color:var(--color-paper)]/80={scrolled}` — the compiler errored with `Attributes need to be unique`. Resolved by deriving a single `scrollClasses` string via `$derived` and interpolating it into the `class` attribute.
2. **`{@render children()}` shadowing with SafeArea's snippet prop.** SafeArea declares `children: Snippet` as its `$props()`. If +layout.svelte ALSO names its page content prop `children`, the inner snippet body shadows the outer prop. Resolved per the plan's fallback guidance: `let { children: pageContent } = $props()` in +layout.svelte and `{@render pageContent()}` inside `<main>`.
3. **`.svelte.ts` module files for runes work as documented.** `src/lib/stores/auth-modal.svelte.ts` uses `$state(false)` at module scope and exports an accessor object. No build or type issues.
4. **`$bindable(false)` props work as documented.** MobileMenu declares `let { open = $bindable(false) } = $props()` and SiteHeader binds via `<MobileMenu bind:open={mobileMenuOpen} />`. No compiler complaints.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] `adapter-static` with `fallback: 'index.html'` overwrote the prerendered home page**

- **Found during:** Task 3 — `npm run build:mobile` output `Overwriting build\index.html with fallback page. Consider using a different name for the fallback.`
- **Issue:** Plan 01 configured `svelte.config.js` with `fallback: 'index.html'`. When the root `+layout.ts` sets `prerender = true`, adapter-static FIRST prerenders the home page into `build/index.html`, THEN writes the SPA shell to the same file, obliterating the content. The plan's verify step `grep -q "Coming Soon" build/index.html` would never pass.
- **Fix:** Changed the fallback name to `200.html` (a common Netlify/Capacitor convention). Prerendered `build/index.html` now survives; the SPA fallback lives at `build/200.html`. Capacitor serves prerendered pages directly and only needs the fallback for client-side routes (Plan 04's `/account` will opt into the fallback via `prerender = false`).
- **Files modified:** `svelte.config.js`
- **Verification:** `build/index.html` is now 11KB+ of prerendered HTML containing `Coming Soon`, `Rule 257`, and `© 2026 Rule 257`. `build/200.html` exists as the SPA shell.
- **Committed in:** `36b78f5`

**2. [Rule 3 — Blocking] Dangling `/favicon.png` reference broke adapter-static prerender**

- **Found during:** Task 3 — `npm run build:mobile` failed with `Error: 404 /favicon.png (linked from /)`.
- **Issue:** Plan 01 wrote `src/app.html` with `<link rel="icon" href="%sveltekit.assets%/favicon.png" />` but only `src/lib/assets/favicon.svg` exists (scaffolder default). SvelteKit's prerender crawler follows the link and errors on the 404.
- **Fix:** Copied `src/lib/assets/favicon.svg` → `static/favicon.svg` and updated `src/app.html` to `<link rel="icon" type="image/svg+xml" href="%sveltekit.assets%/favicon.svg" />`.
- **Files modified:** `src/app.html`, `static/favicon.svg` (new)
- **Verification:** `npm run build:mobile` completes without the 404 error.
- **Committed in:** `36b78f5`

**3. [Rule 3 — Blocking] Added `src/routes/+layout.ts` with `prerender = true`**

- **Found during:** Task 3 — initial `npm run build:mobile` produced a `build/index.html` of ~1KB that was just the SPA shell, not the rendered home page. The plan's verify step expects prerendered HTML.
- **Issue:** Plan 01 didn't set `prerender = true` anywhere, so adapter-static fell back to SPA-only mode.
- **Fix:** Created `src/routes/+layout.ts` exporting `prerender = true`. This is a plan addition, not a replacement — Plan 04's `/account` route can override it with its own `prerender = false` +page.ts.
- **Files modified:** `src/routes/+layout.ts` (new)
- **Verification:** `build/index.html` is now the fully prerendered home page.
- **Committed in:** `36b78f5`

**No other deviations.** No Rule 4 architectural decisions needed. No authentication gates encountered.

## Svelte-check Warnings (Not Errors)

`npx svelte-check --tsconfig ./tsconfig.json` reports:

```
COMPLETED 468 FILES 0 ERRORS 9 WARNINGS 2 FILES_WITH_PROBLEMS
```

All 9 warnings are `a11y_invalid_attribute` on `href="#"` placeholders in `SiteHeader.svelte` (3x) and `MobileMenu.svelte` (6x). These are **plan-mandated** per the UI-SPEC Copywriting Contract — "The Space / Menu / Visit" nav links use `href="#"` in Phase 1, and Phase 2 wires real routes. Left as warnings since they are not errors (plan verification says "warnings are tolerable for now") and the `href="#"` value is the literal the plan required.

## Known Stubs

- `static/images/rule257-coming-soon.jpg` is an unsplash placeholder. Phase 2 BRAND-01 must replace this with real Rule 257 brand photography.
- Nav links `The Space`, `Menu`, `Visit` have `href="#"`. Phase 2 wires real routes when the brand portfolio content ships.
- Footer columns `Navigate / Visit / Follow` contain placeholder body text only. Phase 2 will expand with Google Maps embed, hours, real nav links, social icons per D-20.
- `MobileMenu.svelte` nav links are plain `<a href="#">` — a future refinement (Phase 2) could use `<a href="{route}">` with `goto()` for SPA transitions, but this is post-Phase-1 polish.

## Next Plan Readiness

**Plan 04 (Auth Magic Link) can now:**

- Import `authModal` from `$lib/stores/auth-modal.svelte` in its new `<AuthModal />` component — the `open`/`close`/`openModal` surface is stable
- Mount `<AuthModal />` inside `src/routes/+layout.svelte` above `<SiteFooter />` — the file exists and uses the snippet composition pattern
- Create `src/routes/account/+page.svelte` and `src/routes/account/+page.ts` with `export const prerender = false` to opt out of the root prerender setting
- Rely on `SiteHeader`'s `Sign in` button already calling `authModal.openModal()` — no header changes needed

**Plan 05 (Capacitor smoke test) can now:**

- Point Capacitor's `webDir` at `build/` — the directory exists, has prerendered `index.html`, and contains the `200.html` SPA fallback
- Sync the `static/images/rule257-coming-soon.jpg` asset automatically (adapter-static copies it into `build/images/`)
- Rely on the safe-area CSS vars being applied by SafeArea.svelte on every page

## Self-Check: PASSED

All claimed files exist on disk and all claimed commits exist in git history:

- `src/lib/components/SafeArea.svelte` — FOUND
- `src/lib/components/SiteHeader.svelte` — FOUND
- `src/lib/components/SiteFooter.svelte` — FOUND
- `src/lib/components/MobileMenu.svelte` — FOUND
- `src/lib/stores/auth-modal.svelte.ts` — FOUND
- `src/routes/+layout.svelte` — FOUND (modified)
- `src/routes/+page.svelte` — FOUND (modified)
- `src/routes/+layout.ts` — FOUND
- `src/app.html` — FOUND (modified)
- `svelte.config.js` — FOUND (modified)
- `static/images/rule257-coming-soon.jpg` — FOUND (587 KB)
- `static/favicon.svg` — FOUND
- Commit `ba1080b` (Task 1) — FOUND
- Commit `485450e` (Task 2) — FOUND
- Commit `36b78f5` (Task 3) — FOUND

---

*Phase: 01-foundation*
*Completed: 2026-04-11*
