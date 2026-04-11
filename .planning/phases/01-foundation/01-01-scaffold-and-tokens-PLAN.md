---
phase: 01-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - .nvmrc
  - .env.example
  - .gitignore
  - svelte.config.js
  - vite.config.ts
  - src/app.html
  - src/app.css
  - src/app.d.ts
  - static/fonts/Fraunces-Regular.woff2
  - static/fonts/Inter-Regular.woff2
autonomous: true
requirements:
  - BRAND-06
user_setup:
  - service: none
    why: "Scaffold task only — external services configured in later plans"
must_haves:
  truths:
    - "npm install completes with zero errors on Node 22"
    - "BUILD_TARGET=vercel npm run build exits 0"
    - "BUILD_TARGET=mobile npm run build exits 0 and produces build/index.html"
    - "Tailwind @theme tokens (--color-ink, --color-paper, --font-serif, --font-sans) are defined in app.css"
    - "viewport-fit=cover meta tag present in app.html"
    - "Fraunces and Inter woff2 files exist under static/fonts/ and are <link rel=preload> in app.html"
  artifacts:
    - path: "package.json"
      provides: "Project manifest pinned to Node 22 with dual-adapter deps"
      contains: "\"engines\""
    - path: ".nvmrc"
      provides: "Node version lock"
      contains: "22"
    - path: "svelte.config.js"
      provides: "Dual-adapter BUILD_TARGET switch"
      contains: "BUILD_TARGET"
    - path: "src/app.css"
      provides: "Tailwind v4 @theme block with design tokens"
      contains: "@theme"
    - path: "src/app.html"
      provides: "HTML shell with viewport-fit=cover and font preload"
      contains: "viewport-fit=cover"
  key_links:
    - from: "svelte.config.js"
      to: "@sveltejs/adapter-vercel + @sveltejs/adapter-static"
      via: "conditional import based on process.env.BUILD_TARGET"
      pattern: "BUILD_TARGET === 'mobile'"
    - from: "src/app.html"
      to: "static/fonts/*.woff2"
      via: "<link rel=preload> tags"
      pattern: "rel=\"preload\".*woff2"
    - from: "src/app.css"
      to: "tailwindcss"
      via: "@import and @theme"
      pattern: "@import \"tailwindcss\""
---

<objective>
Scaffold the SvelteKit 2 + TypeScript project, install the dual-adapter stack (adapter-vercel + adapter-static), wire BUILD_TARGET env switching in svelte.config.js, lay down TailwindCSS v4 CSS-first design tokens (Fraunces serif + Inter sans + pure B&W palette + generous spacing), install self-hosted fonts, and add viewport-fit=cover with font preload in app.html.

Purpose: This is the infrastructure slab. Every later plan (database, components, auth, Capacitor) depends on the project existing and the design tokens being defined in one place. Getting BUILD_TARGET right here prevents a Phase 4 rewrite.

Output: A `rule257-nyc` SvelteKit project that builds cleanly for both Vercel (SSR) and static (mobile), with editorial design tokens ready for components to consume.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-foundation/01-CONTEXT.md
@.planning/phases/01-foundation/01-RESEARCH.md
@.planning/phases/01-foundation/01-UI-SPEC.md

<interfaces>
<!-- These are the exact concrete values the executor must write. -->
<!-- No "align with X" — copy these verbatim into the correct files. -->

RESEARCH.md version matrix (pin EXACT versions in package.json):
```
svelte              ^5.55.3
@sveltejs/kit       ^2.57.1
@sveltejs/adapter-vercel  ^5.10.0
@sveltejs/adapter-static  ^3.0.10
@tailwindcss/vite   ^4.2.2
tailwindcss         ^4.2.2
typescript          ^5.5.0
cross-env           ^7.0.3
```

RESEARCH.md svelte.config.js (Pattern 1) — EXACT shape:
```javascript
import adapterVercel from '@sveltejs/adapter-vercel';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const isMobileBuild = process.env.BUILD_TARGET === 'mobile';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: isMobileBuild
      ? adapterStatic({
          pages: 'build',
          assets: 'build',
          fallback: 'index.html',
          strict: false
        })
      : adapterVercel(),
    ...(isMobileBuild && {
      output: { bundleStrategy: 'single' }
    }),
    alias: {
      '$lib': 'src/lib'
    }
  }
};

export default config;
```

package.json scripts section (EXACT — uses cross-env for Windows portability):
```json
"scripts": {
  "dev": "vite dev --host 0.0.0.0",
  "build": "vite build",
  "build:vercel": "cross-env BUILD_TARGET=vercel vite build",
  "build:mobile": "cross-env BUILD_TARGET=mobile vite build",
  "preview": "vite preview",
  "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
},
"engines": { "node": ">=22" }
```

app.css (Pattern 2) — EXACT token values from UI-SPEC.md:
```css
@import "tailwindcss";

@theme {
  /* Color — UI-SPEC.md Color table, Phase 5 will invert these */
  --color-paper: #fafafa;
  --color-paper-muted: #eaeaea;
  --color-hairline: #e5e5e5;
  --color-ink: #0a0a0a;
  --color-ink-muted: #6b6b6b;
  --color-destructive: #8b0000;

  /* Typography — UI-SPEC.md Typography table */
  --font-serif: "Fraunces", Georgia, "Times New Roman", serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;

  /* Spacing base — UI-SPEC.md Spacing Scale */
  --spacing: 0.25rem;

  /* Breakpoints (mobile-first) */
  --breakpoint-sm: 40rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem;

  /* Motion tokens — UI-SPEC.md Interaction & Motion */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Safe area insets (UI-SPEC.md Spacing Scale exceptions) */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
}

/* Self-hosted font declarations */
@font-face {
  font-family: "Fraunces";
  src: url("/fonts/Fraunces-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Inter";
  src: url("/fonts/Inter-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* Global baseline */
html {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-sans);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-serif);
  font-weight: 400;
}

/* WCAG: honor reduced motion globally */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}

/* Focus indicator (UI-SPEC Accessibility Contract) */
:focus-visible {
  outline: 2px solid var(--color-ink);
  outline-offset: 2px;
}
```

app.html — EXACT (Pattern: Code Examples section of RESEARCH.md):
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="description" content="Rule 257 — where art, fashion, design, and coffee converge. 54 Eldridge St, NYC." />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />

    <link rel="preload" href="%sveltekit.assets%/fonts/Fraunces-Regular.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="%sveltekit.assets%/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin />

    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

vite.config.ts — EXACT:
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
```

.env.example — EXACT (from RESEARCH.md `.env` file template):
```
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
BETTER_AUTH_SECRET=replace-with-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:5173
RESEND_API_KEY=re_your_key_here
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=replace-from-supabase-status
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Scaffold SvelteKit project with TypeScript + TailwindCSS v4 and pin Node 22</name>
  <files>
    package.json,
    .nvmrc,
    .gitignore,
    tsconfig.json,
    vite.config.ts,
    src/app.html,
    src/app.css,
    src/app.d.ts,
    src/routes/+layout.svelte,
    src/routes/+page.svelte
  </files>
  <read_first>
    .planning/phases/01-foundation/01-RESEARCH.md,
    .planning/phases/01-foundation/01-CONTEXT.md,
    .planning/phases/01-foundation/01-UI-SPEC.md,
    .planning/PROJECT.md
  </read_first>
  <action>
    The working directory IS the SvelteKit project root (rule257.nyc/). Scaffold in place.

    1. Run the Svelte CLI scaffolder non-interactively. Because `.planning/` already exists in this directory, use `npx sv create . --template minimal --types ts --no-install --no-add-ons` (the `.` means current directory). If `sv` refuses to scaffold into a non-empty directory, scaffold into a temp subdir first with `npx sv@latest create __scaffold__ --template minimal --types ts --no-install --no-add-ons`, then `mv __scaffold__/* . && mv __scaffold__/.* . 2>/dev/null && rm -rf __scaffold__`. Do NOT let the scaffolder touch `.planning/`, `PROJECT_CONTEXT.md`, or `.git/`.

    2. Write `.nvmrc` with exact content: `22` (no newline at end is fine; just "22").

    3. Edit `package.json` to:
       - Add `"engines": { "node": ">=22" }` at the top level.
       - Ensure `"type": "module"` is present.
       - Replace the `scripts` section with the EXACT block from <interfaces> above (dev, build, build:vercel, build:mobile, preview, check — using `cross-env` prefix on build:vercel and build:mobile).
       - Add dev deps with EXACT versions listed in <interfaces>: svelte ^5.55.3, @sveltejs/kit ^2.57.1, @sveltejs/adapter-vercel ^5.10.0, @sveltejs/adapter-static ^3.0.10, @tailwindcss/vite ^4.2.2, tailwindcss ^4.2.2, cross-env ^7.0.3, typescript ^5.5.0, @sveltejs/vite-plugin-svelte (whatever sv scaffolded), svelte-check (whatever sv scaffolded), vite (whatever sv scaffolded).
       - Name field: `"name": "rule257-nyc"`.

    4. Write `vite.config.ts` with the EXACT content from <interfaces> (tailwindcss + sveltekit plugins, server.host: 0.0.0.0, port 5173).

    5. Write `src/app.css` with the EXACT content from <interfaces> (all @theme tokens, @font-face declarations, global baseline, reduced-motion, :focus-visible). Overwrite whatever the scaffolder put there.

    6. Write `src/app.html` with the EXACT content from <interfaces> (viewport-fit=cover, two font preload links, favicon, description meta).

    7. Write `src/app.d.ts` with:
       ```typescript
       // See https://kit.svelte.dev/docs/types#app
       declare global {
         namespace App {
           interface Locals {
             session?: import('better-auth').Session;
             user?: import('better-auth').User;
           }
         }
       }
       export {};
       ```

    8. Write `src/routes/+layout.svelte` (minimal placeholder — Plan 03 will flesh this out):
       ```svelte
       <script lang="ts">
         import '../app.css';
         let { children } = $props();
       </script>

       {@render children()}
       ```

    9. Write `src/routes/+page.svelte` as a trivial placeholder (Plan 03 replaces this with the real Coming Soon page):
       ```svelte
       <h1>Rule 257 — scaffold OK</h1>
       ```

    10. Write/update `.gitignore` to include (append if the file already has a node_modules entry):
        ```
        node_modules
        .env
        .env.*
        !.env.example
        build
        .svelte-kit
        .vercel
        ios
        android
        .DS_Store
        /supabase/.branches
        /supabase/.temp
        ```

    11. Write `.env.example` with the EXACT content from <interfaces>.

    12. Write `tsconfig.json` with the standard SvelteKit config (the sv scaffolder produces this — leave it as-is unless missing, in which case write the SvelteKit default that extends `./.svelte-kit/tsconfig.json`).

    13. Run `npm install`. It must complete with zero errors. If it fails due to sv leaving out a dep, add the missing dep explicitly.

    14. Run `npx svelte-kit sync` to materialize `.svelte-kit/tsconfig.json`.
  </action>
  <verify>
    <automated>test -f package.json && test -f .nvmrc && test -f svelte.config.js && test -f src/app.css && test -f src/app.html && grep -q '"engines"' package.json && grep -q '"node": ">=22"' package.json && grep -q 'cross-env BUILD_TARGET=mobile' package.json && grep -q 'cross-env BUILD_TARGET=vercel' package.json && grep -q 'viewport-fit=cover' src/app.html && grep -q '@theme' src/app.css && grep -q -- '--color-ink: #0a0a0a' src/app.css && grep -q -- '--color-paper: #fafafa' src/app.css && grep -q 'Fraunces' src/app.css && grep -q 'Inter' src/app.css && grep -q '@font-face' src/app.css && test -d node_modules && cat .nvmrc | tr -d '[:space:]' | grep -q '^22$'</automated>
  </verify>
  <acceptance_criteria>
    - File `package.json` exists and `grep -q '"name": "rule257-nyc"' package.json` returns 0
    - File `package.json` contains `"engines": { "node": ">=22" }` — verified by `grep -q '">=22"' package.json`
    - File `package.json` contains the exact script `"build:mobile": "cross-env BUILD_TARGET=mobile vite build"` — verified by `grep -q 'cross-env BUILD_TARGET=mobile vite build' package.json`
    - File `package.json` contains the exact script `"build:vercel": "cross-env BUILD_TARGET=vercel vite build"`
    - File `package.json` contains `"@sveltejs/adapter-vercel"` AND `"@sveltejs/adapter-static"` AND `"@tailwindcss/vite"` AND `"cross-env"` in devDependencies
    - File `.nvmrc` contains the single line `22`
    - File `src/app.html` contains the literal string `viewport-fit=cover`
    - File `src/app.html` contains two `<link rel="preload"` lines — one for `Fraunces-Regular.woff2` and one for `Inter-Regular.woff2`
    - File `src/app.css` contains `@import "tailwindcss";` as the first non-comment line
    - File `src/app.css` contains `@theme {` block with ALL six color tokens: `--color-paper: #fafafa`, `--color-paper-muted: #eaeaea`, `--color-hairline: #e5e5e5`, `--color-ink: #0a0a0a`, `--color-ink-muted: #6b6b6b`, `--color-destructive: #8b0000`
    - File `src/app.css` contains `--font-serif: "Fraunces"` and `--font-sans: "Inter"`
    - File `src/app.css` contains `@font-face` declarations referencing `/fonts/Fraunces-Regular.woff2` and `/fonts/Inter-Regular.woff2`
    - File `src/app.css` contains `@media (prefers-reduced-motion: reduce)` rule
    - File `src/app.css` contains `:focus-visible` rule with `outline: 2px solid var(--color-ink)`
    - File `src/app.d.ts` contains `interface Locals` with `session?` and `user?` fields
    - File `vite.config.ts` contains `tailwindcss()` plugin call and `host: '0.0.0.0'`
    - File `.env.example` contains `DATABASE_URL=`, `BETTER_AUTH_SECRET=`, `BETTER_AUTH_URL=`, `RESEND_API_KEY=`
    - Directory `node_modules/@sveltejs/adapter-vercel/` exists after `npm install`
    - Directory `node_modules/@sveltejs/adapter-static/` exists after `npm install`
    - Directory `node_modules/@tailwindcss/vite/` exists after `npm install`
    - Directory `node_modules/cross-env/` exists after `npm install`
    - Directory `.planning/` is still present (scaffolder did not delete it)
    - File `PROJECT_CONTEXT.md` is still present
  </acceptance_criteria>
  <done>
    Project scaffolded in place. `npm install` succeeds. All design tokens from UI-SPEC.md are in `src/app.css`. `viewport-fit=cover` and font preloads are in `src/app.html`. The scaffolder did not destroy `.planning/` or `PROJECT_CONTEXT.md`.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Wire dual-adapter svelte.config.js and install self-hosted Fraunces + Inter fonts</name>
  <files>
    svelte.config.js,
    static/fonts/Fraunces-Regular.woff2,
    static/fonts/Inter-Regular.woff2
  </files>
  <read_first>
    svelte.config.js,
    .planning/phases/01-foundation/01-RESEARCH.md,
    .planning/phases/01-foundation/01-UI-SPEC.md,
    src/app.html
  </read_first>
  <action>
    1. Overwrite `svelte.config.js` with the EXACT content from the <interfaces> block above. Do not paraphrase. The file must:
       - Import `adapterVercel` from `@sveltejs/adapter-vercel`
       - Import `adapterStatic` from `@sveltejs/adapter-static`
       - Import `vitePreprocess` from `@sveltejs/vite-plugin-svelte`
       - Read `process.env.BUILD_TARGET === 'mobile'` into `isMobileBuild`
       - Conditionally select adapterStatic with `pages: 'build'`, `assets: 'build'`, `fallback: 'index.html'`, `strict: false` when mobile
       - Spread `output: { bundleStrategy: 'single' }` into kit config ONLY when mobile
       - Otherwise use `adapterVercel()`
       - Set `alias: { '$lib': 'src/lib' }`

    2. Download Fraunces-Regular.woff2 from Google Fonts / gwfh.mranftl.com (Latin subset, weight 400). If Bash has curl available, run:
       ```
       mkdir -p static/fonts
       curl -L -o static/fonts/Fraunces-Regular.woff2 "https://fonts.gstatic.com/s/fraunces/v35/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk.woff2"
       ```
       The exact URL may drift; the fallback is to install the `@fontsource/fraunces` package (`npm i @fontsource/fraunces @fontsource/inter`) and copy `node_modules/@fontsource/fraunces/files/fraunces-latin-400-normal.woff2` to `static/fonts/Fraunces-Regular.woff2`. Use whichever works. The file MUST be a real woff2 (first bytes = `wOF2`), not an HTML error page.

    3. Download Inter-Regular.woff2 the same way. If using @fontsource: copy `node_modules/@fontsource/inter/files/inter-latin-400-normal.woff2` to `static/fonts/Inter-Regular.woff2`.

    4. Verify both files are real woff2 by checking the magic bytes: `head -c 4 static/fonts/Fraunces-Regular.woff2 | xxd | grep -q '774f 4632'` (that's the hex for `wOF2`). Same for Inter.

    5. If @fontsource was installed, that's fine — it can stay as a dev dep for easy updates later. Do NOT import from @fontsource in CSS; we reference the static files directly.

    6. Run `npm run build:vercel` and confirm exit code 0. The build output should go to `.svelte-kit/output/` (Vercel adapter).

    7. Run `npm run build:mobile` and confirm exit code 0. The build output should go to `build/` with `build/index.html` present (adapter-static with fallback).
  </action>
  <verify>
    <automated>test -f svelte.config.js && grep -q "BUILD_TARGET === 'mobile'" svelte.config.js && grep -q "adapterStatic" svelte.config.js && grep -q "adapterVercel" svelte.config.js && grep -q "bundleStrategy: 'single'" svelte.config.js && grep -q "fallback: 'index.html'" svelte.config.js && test -f static/fonts/Fraunces-Regular.woff2 && test -f static/fonts/Inter-Regular.woff2 && head -c 4 static/fonts/Fraunces-Regular.woff2 | od -An -c | grep -q 'w   O   F   2' && head -c 4 static/fonts/Inter-Regular.woff2 | od -An -c | grep -q 'w   O   F   2' && npm run build:vercel && npm run build:mobile && test -f build/index.html</automated>
  </verify>
  <acceptance_criteria>
    - File `svelte.config.js` contains the literal string `BUILD_TARGET === 'mobile'`
    - File `svelte.config.js` contains `adapterStatic({` with `pages: 'build'` AND `assets: 'build'` AND `fallback: 'index.html'` AND `strict: false`
    - File `svelte.config.js` contains `output: { bundleStrategy: 'single' }`
    - File `svelte.config.js` contains `alias: {` with `'$lib': 'src/lib'`
    - File `static/fonts/Fraunces-Regular.woff2` exists and its first 4 bytes are `wOF2` (magic header) — verified by `head -c 4 static/fonts/Fraunces-Regular.woff2` returning `wOF2`
    - File `static/fonts/Inter-Regular.woff2` exists and its first 4 bytes are `wOF2`
    - File size of `static/fonts/Fraunces-Regular.woff2` is > 10000 bytes (sanity check: real fonts are ~30-100kb, HTML error pages are smaller)
    - File size of `static/fonts/Inter-Regular.woff2` is > 10000 bytes
    - Command `npm run build:vercel` exits 0
    - Command `npm run build:mobile` exits 0
    - File `build/index.html` exists after `build:mobile` run
  </acceptance_criteria>
  <done>
    `svelte.config.js` swaps between adapter-vercel and adapter-static on `BUILD_TARGET=mobile`. Both builds complete successfully. Fraunces and Inter woff2 files are in `static/fonts/` and load via the preload links in `src/app.html`. Phase 1 success criterion #1 (dual-adapter build) is demonstrably met.
  </done>
</task>

</tasks>

<verification>
- [ ] `test -f package.json && test -f svelte.config.js && test -f src/app.css && test -f src/app.html`
- [ ] `npm run build:vercel` exits 0
- [ ] `npm run build:mobile` exits 0
- [ ] `test -f build/index.html` (produced by build:mobile)
- [ ] `grep -q viewport-fit=cover src/app.html`
- [ ] `grep -q -- '--color-ink: #0a0a0a' src/app.css`
- [ ] `grep -q -- 'BUILD_TARGET' svelte.config.js`
- [ ] `test -f static/fonts/Fraunces-Regular.woff2 && test -f static/fonts/Inter-Regular.woff2`
- [ ] `.planning/` directory still present (not clobbered by scaffolder)
</verification>

<success_criteria>
1. `npm install` exits 0 on Node 22
2. `npm run build:vercel` produces a Vercel-shaped output with exit 0
3. `npm run build:mobile` produces `build/index.html` with exit 0
4. All six color tokens and the two font-family tokens from UI-SPEC.md are in `src/app.css` inside a `@theme` block
5. `viewport-fit=cover` and two font preload links are in `src/app.html`
6. Self-hosted Fraunces and Inter woff2 files are present under `static/fonts/` with valid `wOF2` magic headers
7. Addresses BRAND-06 partially: the infrastructure for mobile-responsive safe-area handling is laid down; Plan 03 renders the visual proof
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-01-SUMMARY.md` documenting:
- Exact package versions installed (run `npm ls --depth=0 | head -40`)
- Whether @fontsource was used or direct download for fonts
- Any scaffolder quirks encountered (e.g. non-empty directory workaround)
- Proof both builds succeeded (trimmed output)
- Any deviations from the <interfaces> block and why
</output>
</content>
</invoke>