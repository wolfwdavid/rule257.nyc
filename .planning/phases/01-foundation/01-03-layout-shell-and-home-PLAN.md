---
phase: 01-foundation
plan: 03
type: execute
wave: 2
depends_on:
  - "01-01"
files_modified:
  - src/lib/components/SafeArea.svelte
  - src/lib/components/SiteHeader.svelte
  - src/lib/components/SiteFooter.svelte
  - src/lib/components/MobileMenu.svelte
  - src/lib/stores/auth-modal.svelte.ts
  - src/routes/+layout.svelte
  - src/routes/+page.svelte
  - static/images/rule257-coming-soon.jpg
autonomous: true
requirements:
  - BRAND-06
must_haves:
  truths:
    - "Visitor on any viewport width from 320px to 1920px sees a readable, non-broken layout"
    - "On iPhone with notch (safe-area-inset-top > 0), the header is NOT hidden under the Dynamic Island"
    - "The Coming Soon home page shows the Rule 257 wordmark, 'Coming Soon' display heading, and the tagline 'Where art, fashion, design, and coffee converge. 54 Eldridge St, New York.'"
    - "Desktop (≥1024px) shows top nav: logo left, text links right ('The Space', 'Menu', 'Visit', 'Sign in' CTA)"
    - "Mobile (<768px) shows hamburger button instead of text links; tapping it opens a full-viewport overlay with nav links stacked as serif Heading style"
    - "Scroll behavior: header opacity drops from 1.0 to 0.8 with 8px backdrop-blur as scrollY crosses 24px"
    - "All interactive elements have a minimum 44x44px hit area"
    - "Focus indicators use 2px solid var(--color-ink) with 2px offset via :focus-visible"
    - "The Coming Soon page uses py-24 minimum vertical rhythm between stacked elements"
  artifacts:
    - path: "src/lib/components/SafeArea.svelte"
      provides: "Env safe-area-inset wrapper for notch/Dynamic Island handling"
      contains: "var(--safe-top)"
    - path: "src/lib/components/SiteHeader.svelte"
      provides: "Sticky top nav with scroll opacity + hamburger on mobile"
      contains: "Rule 257"
    - path: "src/lib/components/SiteFooter.svelte"
      provides: "Editorial footer placeholder with 3-col grid on desktop"
      contains: "© 2026 Rule 257"
    - path: "src/lib/components/MobileMenu.svelte"
      provides: "Full-viewport hamburger overlay"
      contains: "role=\"dialog\""
    - path: "src/routes/+page.svelte"
      provides: "Phase 1 Coming Soon home page"
      contains: "Coming Soon"
    - path: "src/routes/+layout.svelte"
      provides: "Global composition: SafeArea > Header > main > Footer"
      contains: "SiteHeader"
  key_links:
    - from: "src/routes/+layout.svelte"
      to: "SafeArea + SiteHeader + SiteFooter + MobileMenu"
      via: "imports and composition"
      pattern: "import SafeArea"
    - from: "src/lib/components/SiteHeader.svelte"
      to: "src/lib/components/MobileMenu.svelte"
      via: "menu open state"
      pattern: "bind:open|MobileMenu"
    - from: "src/lib/components/SiteHeader.svelte"
      to: "src/lib/stores/auth-modal.svelte.ts"
      via: "Sign in button click opens auth modal"
      pattern: "authModal.openModal\\(\\)"
---

<objective>
Build the complete Phase 1 layout shell: SafeArea wrapper (safe-area-inset-*), SiteHeader (sticky, scroll opacity, hamburger on mobile), SiteFooter (editorial 3-column placeholder), MobileMenu (full-viewport overlay), a shared auth-modal state store (Plan 04 uses this), the global +layout.svelte that composes them, and the Coming Soon +page.svelte home with the locked UI-SPEC copy.

Purpose: Phase 1 success criterion #2 — mobile-responsive layout on any device width with safe area handling. This plan makes BRAND-06 visible: the design tokens from Plan 01 are now rendered as a real editorial layout. Plan 04 mounts the AuthModal inside this shell without touching these components.

Output: A working layout that a visitor can load at `/` and see a minimal "Coming Soon" page with fashion-runway-gallery aesthetics. The /account route still 404s (Plan 04 adds it).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation/01-CONTEXT.md
@.planning/phases/01-foundation/01-RESEARCH.md
@.planning/phases/01-foundation/01-UI-SPEC.md
@src/app.css
@src/app.html
@.planning/phases/01-foundation/01-01-SUMMARY.md

<interfaces>
<!-- EXACT copy strings from UI-SPEC.md Copywriting Contract -->

Locked copy (UI-SPEC.md Copywriting Contract table — DO NOT IMPROVISE):
- Site wordmark (header):            `Rule 257`
- Home page display heading:         `Coming Soon`
- Home page tagline:                 `Where art, fashion, design, and coffee converge. 54 Eldridge St, New York.`
- Nav link 1:                        `The Space`  (href="#")
- Nav link 2:                        `Menu`       (href="#")
- Nav link 3:                        `Visit`      (href="#")
- Nav CTA button:                    `Sign in`
- Hamburger menu aria-label:         `Open menu`
- Hamburger close aria-label:        `Close menu`
- Footer tagline placeholder:        `Rule 257 · 54 Eldridge St, New York, NY`
- Footer copyright:                  `© 2026 Rule 257`

<!-- EXACT class values from UI-SPEC.md Layout Shell Component Inventory -->
SafeArea wrapper: applies padding via CSS vars var(--safe-top|right|bottom|left)
SiteHeader: h-16 md:h-20, px-6 md:px-12, border-b border-[color:var(--color-hairline)]
SiteFooter: py-24 md:py-32, px-6 md:px-12, border-t border-[color:var(--color-hairline)]
MobileMenu: full-width/height, bg-[color:var(--color-paper)], px-6 py-24, nav links as serif Heading stacked gap-6
Coming Soon page: min-h-[calc(100vh-5rem)], flex flex-col items-center justify-center, gap-12, text-center

<!-- Motion tokens from UI-SPEC Interaction & Motion -->
Header scroll: scrollY > 24 → bg-paper/80 + backdrop-blur-sm; transition 200ms ease-out
Hamburger open: slide from right 200ms ease-out
Nav link hover: 1px underline draws 150ms ease-out, no color change
CTA hover: bg-opacity 1.0 → 0.85, 150ms ease-out, no scale/shadow

<!-- Shared auth-modal state (Plan 04 reads this) -->
src/lib/stores/auth-modal.svelte.ts exports:
  - `authModalOpen` — $state<boolean>
  - `authModal` — object with `open()` and `close()` methods
  This file uses Svelte 5 runes, NOT the legacy stores API. It is a `.svelte.ts` file (NOT a regular `.ts`) so runes work.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Build SafeArea + shared auth-modal state + stub hero image</name>
  <files>
    src/lib/components/SafeArea.svelte,
    src/lib/stores/auth-modal.svelte.ts,
    static/images/rule257-coming-soon.jpg
  </files>
  <read_first>
    src/app.css,
    .planning/phases/01-foundation/01-UI-SPEC.md,
    .planning/phases/01-foundation/01-RESEARCH.md
  </read_first>
  <action>
    1. Create `src/lib/components/SafeArea.svelte` with this EXACT content (Svelte 5 runes, `$props()`, renders children):
       ```svelte
       <script lang="ts">
         import type { Snippet } from 'svelte';

         let {
           children,
           top = true,
           bottom = true,
           sides = true
         }: {
           children: Snippet;
           top?: boolean;
           bottom?: boolean;
           sides?: boolean;
         } = $props();
       </script>

       <div
         class="min-h-dvh"
         style:padding-top={top ? 'var(--safe-top)' : undefined}
         style:padding-bottom={bottom ? 'var(--safe-bottom)' : undefined}
         style:padding-left={sides ? 'var(--safe-left)' : undefined}
         style:padding-right={sides ? 'var(--safe-right)' : undefined}
       >
         {@render children()}
       </div>
       ```

    2. Create `src/lib/stores/auth-modal.svelte.ts` (the `.svelte.ts` extension is REQUIRED to use runes in a module) with EXACTLY:
       ```typescript
       // Shared modal state for the Sign in button in SiteHeader and the AuthModal component.
       // Plan 04 mounts <AuthModal /> inside +layout.svelte and binds to this state.

       let open = $state(false);

       export const authModal = {
         get open() { return open; },
         set open(v: boolean) { open = v; },
         openModal() { open = true; },
         close() { open = false; }
       };
       ```

    3. Create `static/images/` directory. Place a hero image at `static/images/rule257-coming-soon.jpg`. Options in preference order:
       a. If the project has any Rule 257 brand photography already, use it.
       b. Otherwise, download a neutral placeholder from unsplash.com API: `curl -L -o static/images/rule257-coming-soon.jpg "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&q=80"` (a minimal coffee/cafe photo). Verify it's a real JPEG by checking the first 3 bytes: `head -c 3 static/images/rule257-coming-soon.jpg | od -An -c | grep -q $'\\377\\330\\377'` (JPEG magic bytes ff d8 ff).
       c. If network is unavailable, generate a 1600x900 solid near-white JPEG via ImageMagick: `convert -size 1600x900 xc:'#fafafa' static/images/rule257-coming-soon.jpg` — plain but meets the "one hero image" contract.
       d. LAST-RESORT FALLBACK (Windows Git Bash with no network and no ImageMagick): write a minimal valid JPEG via a Node one-liner using a base64-decoded neutral 1x1 pixel, then pad it to clear the 5KB floor. Run EXACTLY:
          ```
          node -e "const fs=require('fs');const hdr=Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AH//Z','base64');const pad=Buffer.alloc(6144,0xfa);fs.mkdirSync('static/images',{recursive:true});fs.writeFileSync('static/images/rule257-coming-soon.jpg',Buffer.concat([hdr.slice(0,hdr.length-2),pad,hdr.slice(hdr.length-2)]));console.log('placeholder written, bytes:',fs.statSync('static/images/rule257-coming-soon.jpg').size);"
          ```
          This produces a valid (but visually blank) JPEG >5KB that satisfies the verify step. It is INTENTIONALLY ugly so the user notices. Write a visible `TODO (01-03):` line into the Plan 03 SUMMARY stating: **"`static/images/rule257-coming-soon.jpg` is a last-resort placeholder. Real Rule 257 brand photography MUST replace this before any public ship."**
       The file MUST exist and be >5KB. Do NOT commit a 404 HTML page as "jpg". Try options a → b → c → d in order; stop at the first that works.

    4. Do NOT create the actual <AuthModal /> component in this plan — Plan 04 does that. This plan only creates the state store that both SiteHeader (here) and AuthModal (Plan 04) will consume.
  </action>
  <verify>
    <automated>test -f src/lib/components/SafeArea.svelte && grep -q 'var(--safe-top)' src/lib/components/SafeArea.svelte && grep -q 'min-h-dvh' src/lib/components/SafeArea.svelte && grep -q '@render children' src/lib/components/SafeArea.svelte && test -f src/lib/stores/auth-modal.svelte.ts && grep -q '\$state(false)' src/lib/stores/auth-modal.svelte.ts && grep -q 'export const authModal' src/lib/stores/auth-modal.svelte.ts && grep -q 'openModal' src/lib/stores/auth-modal.svelte.ts && test -f static/images/rule257-coming-soon.jpg && test $(stat -c%s static/images/rule257-coming-soon.jpg 2>/dev/null || stat -f%z static/images/rule257-coming-soon.jpg) -gt 5000</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/SafeArea.svelte` contains `var(--safe-top)`, `var(--safe-bottom)`, `var(--safe-left)`, `var(--safe-right)` on style: bindings
    - File `src/lib/components/SafeArea.svelte` uses `$props()` (Svelte 5 runes, NOT `export let`)
    - File `src/lib/components/SafeArea.svelte` contains `{@render children()}`
    - File `src/lib/components/SafeArea.svelte` has `min-h-dvh` on the wrapper div
    - File `src/lib/stores/auth-modal.svelte.ts` exists with `.svelte.ts` extension (not `.ts`)
    - File `src/lib/stores/auth-modal.svelte.ts` contains `$state(false)`
    - File `src/lib/stores/auth-modal.svelte.ts` exports `authModal` with `openModal` and `close` methods
    - File `static/images/rule257-coming-soon.jpg` exists and is larger than 5000 bytes
  </acceptance_criteria>
  <done>
    SafeArea component ready. Shared auth-modal runes state ready for SiteHeader and Plan 04 AuthModal to import. Hero image is in static/.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Build SiteHeader + MobileMenu + SiteFooter with locked copy and UI-SPEC styles</name>
  <files>
    src/lib/components/SiteHeader.svelte,
    src/lib/components/MobileMenu.svelte,
    src/lib/components/SiteFooter.svelte
  </files>
  <read_first>
    src/app.css,
    src/lib/stores/auth-modal.svelte.ts,
    .planning/phases/01-foundation/01-UI-SPEC.md
  </read_first>
  <action>
    1. Create `src/lib/components/SiteHeader.svelte`. It must:
       - Be a semantic `<header>` with `sticky top-0 z-40`
       - Heights: `h-16 md:h-20`
       - Horizontal padding: `px-6 md:px-12`
       - Border: `border-b border-[color:var(--color-hairline)]`
       - Scroll behavior via `$effect` listening to window scrollY: when `scrollY > 24`, apply `bg-[color:var(--color-paper)]/80 backdrop-blur-sm`; otherwise `bg-[color:var(--color-paper)]`. Use `transition-[background-color,backdrop-filter] duration-200 ease-out`.
       - Left: logo wordmark "Rule 257" in serif Display style: `font-serif text-[28px] font-normal leading-none`. It is an `<a href="/">`.
       - Right (desktop, `hidden md:flex`): three text link `<a>` elements with EXACT copy "The Space", "Menu", "Visit" (all href="#"), followed by a "Sign in" `<button>` CTA.
         - Link style: `font-sans text-[13px] font-normal tracking-wide uppercase text-[color:var(--color-ink)] relative min-h-11 min-w-11 inline-flex items-center` with a pseudo-element for the underline hover. Add a `group` class and on the inner span include `after:absolute after:left-0 after:bottom-0 after:h-px after:w-0 after:bg-[color:var(--color-ink)] after:transition-[width] after:duration-150 after:ease-out group-hover:after:w-full` or equivalent. The underline MUST draw from left over 150ms.
         - CTA button style: `bg-[color:var(--color-ink)] text-[color:var(--color-paper)] px-6 py-3 text-[13px] font-sans uppercase tracking-wide min-h-11 min-w-11 transition-opacity duration-150 ease-out hover:opacity-85` and on click: `import { authModal } from '$lib/stores/auth-modal.svelte'; authModal.openModal();`.
       - Right (mobile, `md:hidden`): a hamburger `<button>` with aria-label `Open menu`, showing three horizontal lines (use CSS or inline SVG — 3 lines, each `bg-[color:var(--color-ink)]`, width 24px, height 2px, gap 6px). Button has `min-h-11 min-w-11`. On click, set local state `mobileMenuOpen = true`.
       - Render `<MobileMenu bind:open={mobileMenuOpen} />` somewhere in the template.
       - Import `MobileMenu` from `$lib/components/MobileMenu.svelte` and `authModal` from `$lib/stores/auth-modal.svelte`.
       - Use `$state` for `scrollY` and `mobileMenuOpen`.

    2. Create `src/lib/components/MobileMenu.svelte`. It must:
       - Accept `open` as a bindable prop via `let { open = $bindable(false) } = $props();`
       - Render a `<div role="dialog" aria-modal="true" aria-label="Main menu">` when `open === true`.
       - Position: `fixed inset-0 z-50 bg-[color:var(--color-paper)] px-6 py-24`.
       - Enter: slide from right. Use Svelte's built-in transition: `import { fly } from 'svelte/transition';` then `transition:fly={{ x: 300, duration: 200, easing: cubicOut }}` — import `cubicOut` from `svelte/easing`.
       - Contain a close button at `absolute top-6 right-6` with `aria-label="Close menu"` and an X icon (CSS or inline SVG). Button has `min-h-11 min-w-11`. Click sets `open = false`.
       - Contain nav links stacked vertically as serif Heading style (`font-serif text-[28px] font-normal leading-tight`): "The Space", "Menu", "Visit", and a separate "Sign in" link that does `authModal.openModal(); open = false;`. Stack with `gap-6`.
       - Handle Escape key to close: `$effect` that adds a keydown listener when open.
       - Respect reduced motion: if `matchMedia('(prefers-reduced-motion: reduce)').matches`, set transition duration to 0 (or simply don't use the transition — a `#if` guard is fine).

    3. Create `src/lib/components/SiteFooter.svelte`. It must:
       - Be a semantic `<footer>`.
       - Styles: `py-24 md:py-32 px-6 md:px-12 border-t border-[color:var(--color-hairline)]`.
       - Grid: `grid grid-cols-1 md:grid-cols-3 gap-12`.
       - Three placeholder columns each with a Label heading (UI-SPEC Label style: `font-sans text-[13px] font-normal tracking-wide uppercase text-[color:var(--color-ink-muted)]`) and body placeholder rows (UI-SPEC Body style: `font-sans text-base leading-relaxed`).
         - Column 1 heading: `Navigate`, body: three lines "The Space", "Menu", "Visit" (plain text placeholders, Phase 2 wires these up)
         - Column 2 heading: `Visit`, body: three lines `54 Eldridge St`, `New York, NY 10002`, `+1 917-774-7263`
         - Column 3 heading: `Follow`, body: one line `Instagram @rule257.nyc`
       - Bottom row (below the grid, separated by `mt-16 pt-8 border-t border-[color:var(--color-hairline)]` and `flex flex-col md:flex-row justify-between`):
         - Left: `Rule 257 · 54 Eldridge St, New York, NY` in body sans text
         - Right: `© 2026 Rule 257` in body sans text
  </action>
  <verify>
    <automated>test -f src/lib/components/SiteHeader.svelte && grep -q 'Rule 257' src/lib/components/SiteHeader.svelte && grep -q 'The Space' src/lib/components/SiteHeader.svelte && grep -q '>Menu<' src/lib/components/SiteHeader.svelte && grep -q '>Visit<' src/lib/components/SiteHeader.svelte && grep -q 'Sign in' src/lib/components/SiteHeader.svelte && grep -q 'authModal.openModal' src/lib/components/SiteHeader.svelte && grep -q 'Open menu' src/lib/components/SiteHeader.svelte && grep -q 'sticky top-0' src/lib/components/SiteHeader.svelte && grep -q 'h-16 md:h-20' src/lib/components/SiteHeader.svelte && grep -q 'border-b' src/lib/components/SiteHeader.svelte && grep -q 'scrollY' src/lib/components/SiteHeader.svelte && grep -q 'backdrop-blur' src/lib/components/SiteHeader.svelte && grep -q 'min-h-11' src/lib/components/SiteHeader.svelte && test -f src/lib/components/MobileMenu.svelte && grep -q 'role="dialog"' src/lib/components/MobileMenu.svelte && grep -q 'aria-modal="true"' src/lib/components/MobileMenu.svelte && grep -q 'Close menu' src/lib/components/MobileMenu.svelte && grep -q '\$bindable' src/lib/components/MobileMenu.svelte && grep -q 'svelte/transition' src/lib/components/MobileMenu.svelte && test -f src/lib/components/SiteFooter.svelte && grep -q '© 2026 Rule 257' src/lib/components/SiteFooter.svelte && grep -q '54 Eldridge St' src/lib/components/SiteFooter.svelte && grep -q 'py-24 md:py-32' src/lib/components/SiteFooter.svelte && grep -q 'grid-cols-1 md:grid-cols-3' src/lib/components/SiteFooter.svelte</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/SiteHeader.svelte` contains the literal strings `Rule 257`, `The Space`, `Menu`, `Visit`, `Sign in`, `Open menu`
    - File `src/lib/components/SiteHeader.svelte` contains class `sticky top-0 z-40` AND `h-16 md:h-20` AND `px-6 md:px-12` AND `border-b` AND `backdrop-blur`
    - File `src/lib/components/SiteHeader.svelte` contains a $state for scrollY and a $effect adding a `scroll` listener
    - File `src/lib/components/SiteHeader.svelte` imports `{ authModal }` from `$lib/stores/auth-modal.svelte` AND calls `authModal.openModal()` on the Sign in button
    - File `src/lib/components/SiteHeader.svelte` imports `MobileMenu` from `$lib/components/MobileMenu.svelte`
    - File `src/lib/components/SiteHeader.svelte` has `min-h-11 min-w-11` on interactive buttons/links (44px touch target)
    - File `src/lib/components/MobileMenu.svelte` contains `role="dialog"` AND `aria-modal="true"`
    - File `src/lib/components/MobileMenu.svelte` uses `$bindable(false)` for the `open` prop
    - File `src/lib/components/MobileMenu.svelte` imports from `svelte/transition` (fly) and `svelte/easing` (cubicOut)
    - File `src/lib/components/MobileMenu.svelte` contains the literal strings `Close menu`, `The Space`, `Menu`, `Visit`, `Sign in`
    - File `src/lib/components/MobileMenu.svelte` contains `font-serif` AND `text-[28px]` for the nav link styling (serif Heading)
    - File `src/lib/components/MobileMenu.svelte` handles Escape key (`key === 'Escape'` or `code === 'Escape'`)
    - File `src/lib/components/SiteFooter.svelte` contains literal strings `© 2026 Rule 257`, `54 Eldridge St`, `New York, NY 10002`, `+1 917-774-7263`, `Instagram @rule257.nyc`
    - File `src/lib/components/SiteFooter.svelte` has classes `py-24 md:py-32 px-6 md:px-12 border-t` AND `grid-cols-1 md:grid-cols-3`
    - File `src/lib/components/SiteFooter.svelte` contains three column headings: `Navigate`, `Visit`, `Follow`
  </acceptance_criteria>
  <done>
    SiteHeader renders a sticky nav with the correct copy and scroll behavior. MobileMenu opens as a full-viewport dialog with serif nav links and slides from right. SiteFooter renders the 3-column editorial placeholder. All 44x44 touch targets honored.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Wire root +layout.svelte and build Coming Soon +page.svelte home with locked copy</name>
  <files>
    src/routes/+layout.svelte,
    src/routes/+page.svelte
  </files>
  <read_first>
    src/routes/+layout.svelte,
    src/routes/+page.svelte,
    src/lib/components/SafeArea.svelte,
    src/lib/components/SiteHeader.svelte,
    src/lib/components/SiteFooter.svelte,
    .planning/phases/01-foundation/01-UI-SPEC.md,
    static/images/rule257-coming-soon.jpg
  </read_first>
  <action>
    1. Overwrite `src/routes/+layout.svelte` with EXACTLY (this replaces Plan 01's minimal placeholder):
       ```svelte
       <script lang="ts">
         import '../app.css';
         import SafeArea from '$lib/components/SafeArea.svelte';
         import SiteHeader from '$lib/components/SiteHeader.svelte';
         import SiteFooter from '$lib/components/SiteFooter.svelte';

         let { children } = $props();
       </script>

       <SafeArea>
         {#snippet children()}
           <div class="flex min-h-dvh flex-col">
             <SiteHeader />
             <main class="flex-1">
               {@render children()}
             </main>
             <SiteFooter />
           </div>
         {/snippet}
       </SafeArea>
       ```
       NOTE: the `children` snippet shadowing inside SafeArea is intentional — SafeArea's `children` prop is our inner layout, and the outer `children` (from `$props()`) is rendered inside `<main>`. If this double-name confuses the Svelte compiler, rename the outer prop: `let { children: pageContent } = $props();` and use `{@render pageContent()}` inside `<main>`. Do whichever compiles cleanly.

    2. Overwrite `src/routes/+page.svelte` with the Coming Soon content. It must contain:
       - The hero image at `/images/rule257-coming-soon.jpg` (NOT `@sveltejs/enhanced-img` yet — that's a Phase 2 concern). Use a plain `<img>` with `alt="Rule 257 — 54 Eldridge St, NYC"`, `loading="eager"`, `fetchpriority="high"`, width and height attributes to prevent layout shift. Style: `w-full max-w-2xl aspect-[16/9] object-cover`.
       - The Display heading "Coming Soon" in serif: `font-serif text-[56px] font-normal leading-none`
       - The body tagline "Where art, fashion, design, and coffee converge. 54 Eldridge St, New York." in sans: `font-sans text-base leading-relaxed text-[color:var(--color-ink-muted)] max-w-lg text-center`
       - Container: `flex flex-col items-center justify-center gap-12 px-6 py-32 md:py-40 min-h-[calc(100vh-10rem)]` (accounts for header + footer)
       - Element order top to bottom: hero image, then "Coming Soon" heading, then tagline
       - Wrap in `<section aria-label="Coming soon">` for semantics

       EXACT copy strings (from UI-SPEC.md Copywriting Contract):
       - `Coming Soon`
       - `Where art, fashion, design, and coffee converge. 54 Eldridge St, New York.`

    3. Run `npm run dev` in the background (if test environment allows) OR run `npm run check` (svelte-check) to validate. `svelte-check` must return 0 errors (warnings are tolerable for now).

    4. Run `npm run build:vercel` — must succeed, proving the layout compiles with the adapter-vercel.

    5. Run `npm run build:mobile` — must succeed, proving the layout works under adapter-static. Verify `build/index.html` contains the literal strings `Coming Soon` and `Rule 257`.
  </action>
  <verify>
    <automated>test -f src/routes/+layout.svelte && grep -q "import SafeArea" src/routes/+layout.svelte && grep -q "import SiteHeader" src/routes/+layout.svelte && grep -q "import SiteFooter" src/routes/+layout.svelte && grep -q "<main" src/routes/+layout.svelte && test -f src/routes/+page.svelte && grep -q "Coming Soon" src/routes/+page.svelte && grep -q "Where art, fashion, design, and coffee converge" src/routes/+page.svelte && grep -q "font-serif" src/routes/+page.svelte && grep -q "text-\[56px\]" src/routes/+page.svelte && grep -q "rule257-coming-soon" src/routes/+page.svelte && grep -q 'alt="Rule 257' src/routes/+page.svelte && npm run build:vercel && npm run build:mobile && test -f build/index.html && grep -q "Coming Soon" build/index.html</automated>
  </verify>
  <acceptance_criteria>
    - File `src/routes/+layout.svelte` imports `SafeArea`, `SiteHeader`, `SiteFooter`
    - File `src/routes/+layout.svelte` contains `<main` element with `flex-1` class
    - File `src/routes/+layout.svelte` contains `@render` call for the page content
    - File `src/routes/+page.svelte` contains the literal string `Coming Soon`
    - File `src/routes/+page.svelte` contains the literal string `Where art, fashion, design, and coffee converge. 54 Eldridge St, New York.`
    - File `src/routes/+page.svelte` contains `font-serif` AND `text-[56px]` classes for the Display heading
    - File `src/routes/+page.svelte` references the image path `/images/rule257-coming-soon.jpg` OR `rule257-coming-soon` (the exact path form may vary)
    - File `src/routes/+page.svelte` has an `alt` attribute on the `<img>` that contains "Rule 257"
    - File `src/routes/+page.svelte` contains `gap-12` and `py-24` or larger for vertical rhythm (Aesop/Kinfolk pacing per D-09)
    - Command `npm run build:vercel` exits 0
    - Command `npm run build:mobile` exits 0
    - File `build/index.html` exists and contains the literal string `Coming Soon`
    - File `build/index.html` contains the literal string `Rule 257`
    - File `build/index.html` contains the literal string `© 2026 Rule 257` (proving SiteFooter rendered)
  </acceptance_criteria>
  <done>
    Root layout composes SafeArea > SiteHeader > main > SiteFooter. Home page is the minimal "Coming Soon" page with the editorial display heading, tagline, and hero image. Both builds succeed and produce HTML containing the locked copy. Phase 1 success criterion #2 is visually verifiable by loading the site.
  </done>
</task>

</tasks>

<verification>
- [ ] `test -f src/lib/components/SafeArea.svelte && test -f src/lib/components/SiteHeader.svelte && test -f src/lib/components/SiteFooter.svelte && test -f src/lib/components/MobileMenu.svelte`
- [ ] `test -f src/lib/stores/auth-modal.svelte.ts`
- [ ] `grep -q 'Coming Soon' src/routes/+page.svelte`
- [ ] `grep -q 'Where art, fashion, design, and coffee converge' src/routes/+page.svelte`
- [ ] `npm run build:vercel && npm run build:mobile` both succeed
- [ ] `grep -q 'Coming Soon' build/index.html && grep -q 'Rule 257' build/index.html`
- [ ] `grep -q 'var(--safe-top)' src/lib/components/SafeArea.svelte`
</verification>

<success_criteria>
1. Layout shell components exist and are wired into +layout.svelte
2. Coming Soon home page renders the locked UI-SPEC copy with the correct typography (serif Display + sans Body)
3. Mobile viewport (<768px) shows hamburger; desktop viewport (≥768px) shows inline nav links
4. Safe area CSS vars are applied to the outermost wrapper via SafeArea component
5. Header has scroll opacity behavior (scrollY > 24 → bg/80 + backdrop-blur)
6. Both `npm run build:vercel` and `npm run build:mobile` succeed
7. BRAND-06 (mobile-responsive with mobile-first design) is visually verifiable
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-03-SUMMARY.md` documenting:
- All 6 files created/modified
- Snippet of the rendered HTML from `build/index.html` confirming the locked copy is present
- Any Svelte 5 compiler quirks hit with `$bindable`, `{@render children()}` shadowing, or `.svelte.ts` module files
- Which hero image fallback (a/b/c/d) ended up being used. If fallback **d** (last-resort Node base64 JPEG placeholder) was used, include a prominent `TODO (01-03):` line: **"`static/images/rule257-coming-soon.jpg` is a last-resort blank placeholder. Real Rule 257 brand photography MUST replace this before any public ship."**
- A note that Plan 04 will mount `<AuthModal />` by importing the state store from `src/lib/stores/auth-modal.svelte.ts`
</output>
</content>
</invoke>