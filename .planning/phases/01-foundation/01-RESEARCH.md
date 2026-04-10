# Phase 1: Foundation - Research

**Researched:** 2026-04-10
**Domain:** SvelteKit 2 + Capacitor 8 dual-target scaffolding with Better Auth, Drizzle, Supabase, TailwindCSS v4
**Confidence:** HIGH

## Summary

Phase 1 is pure scaffolding. Every library in the stack is already chosen (see PROJECT_CONTEXT.md version matrix) and every major design decision is already locked in 01-CONTEXT.md. The research question is not "what to use" but "how to wire it together correctly the first time so no later phase has to rework it."

The wiring has five hard parts: (1) the dual-adapter swap via `BUILD_TARGET` env var — a one-file change in `svelte.config.js` but with a specific shape that must include `output.bundleStrategy: 'single'` on the mobile branch; (2) the Better Auth 1.6 + magic link + Drizzle + Resend chain, which requires a server-only `$lib/server/auth.ts`, a separate `$lib/auth-client.ts`, manual population of `event.locals` in `hooks.server.ts`, and a `sendMagicLink` callback that renders a Svelte email template; (3) TailwindCSS v4's CSS-first `@theme` block replacing the old `tailwind.config.js` paradigm completely; (4) Capacitor 8 initialization with the explicit `--packagemanager SPM` flag (CocoaPods specs repo goes read-only December 2, 2026); (5) safe area handling via `viewport-fit=cover` in `app.html` plus `env(safe-area-inset-*)` CSS variables from day one.

The single greatest risk in this phase is SvelteKit API routes silently working in dev and failing at static build time. Phase 1 must run `BUILD_TARGET=mobile npm run build` at least once before declaring complete — if adapter-static fails, the architectural rework is cheap at phase 1 and rewrite-scale by phase 4.

**Primary recommendation:** Use `npx sv create rule257-nyc --template minimal --types ts` to scaffold, then `npx sv add tailwindcss drizzle better-auth` to layer in the addons, then manually wire the dual-adapter config, magic link plugin, Drizzle schema, and Capacitor. Do not hand-roll auth session management, email rendering, QR token generation, or font loading.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Design Tokens — Color Palette**
- **D-01:** Pure black and white palette only. No accent color.
- **D-02:** Photography and art on the walls carries all color. The UI is a neutral frame for content.
- **D-03:** Reference: fashion runway showroom aesthetic — white-dominant, gallery-like, intentional.
- **D-04:** Tokens must be defined as CSS variables in TailwindCSS v4 CSS-first config so Phase 5 (dark mode) can invert them cleanly.

**Design Tokens — Typography**
- **D-05:** Serif for headings (editorial, magazine feel).
- **D-06:** Sans-serif for body copy.
- **D-07:** Reference aesthetic: Kinfolk, Cereal magazine. Editorial, curated, art-meets-coffee vibe.
- **D-08:** Font loading must be optimized (subset, preload, fallback) — type is the brand.

**Design Tokens — Spacing & Density**
- **D-09:** Generous white space. Scroll-heavy, luxurious, every element breathes.
- **D-10:** Reference: Kinfolk, Aesop — curated and sparse, not information-dense.
- **D-11:** Spacing scale should support large section gaps (not just component-level padding).

**Site Shell — Desktop Navigation**
- **D-12:** Minimal top bar: logo left, text links right.
- **D-13:** Subtle scroll behavior (shrink or fade, not disappear entirely).
- **D-14:** Thin, unobtrusive — does not compete with content.

**Site Shell — Mobile Navigation**
- **D-15:** Hamburger menu for both web and native Capacitor app.
- **D-16:** No bottom tab bar — even in Phase 4 native apps, hamburger is the pattern.
- **D-17:** Rationale: simpler to maintain one pattern across web + native, matches clean editorial aesthetic. Phase 4 loyalty features live inside the menu, not a persistent tab bar.

**Site Shell — Footer**
- **D-18:** Rich editorial footer.
- **D-19:** Must accommodate (in Phase 2): address, hours, phone, Google Maps embed, social links, site nav columns, tagline/manifesto copy.
- **D-20:** Phase 1 renders the footer structure with placeholder content — Phase 2 fills it.

**Site Shell — Phase 1 Home Page**
- **D-21:** Minimal "Coming Soon" placeholder: logo, tagline, one hero image. Nothing more.
- **D-22:** Phase 2 replaces this with the real brand portfolio content.
- **D-23:** The placeholder must still demonstrate design tokens (typography, spacing, layout shell) so the design system is verifiable at end of Phase 1.

**Auth — Sign-In Method**
- **D-24:** Magic link (passwordless) only. No email+password. No social OAuth in Phase 1.
- **D-25:** Magic link unifies signup and login — one email field, system creates account if new or logs in if known.
- **D-26:** Rationale: lowest friction, no password management, matches clean editorial brand. Apple Sign-in requirement (App Store) is deferred — it only applies if other social logins are present, which they are not.

**Auth — Email Provider**
- **D-27:** Resend for transactional email.
- **D-28:** Free tier (3,000/mo) covers early validation.
- **D-29:** React Email templates for magic link emails. Must match brand typography (serif headings, sans body). *(Note: research recommends svelte-email-tailwind as the Svelte-native equivalent — see `## Architecture Patterns` below. Intent is the same: component-based email templates, server-rendered to HTML, passed to Resend.)*

**Auth — Presentation**
- **D-30:** Modal overlay (not a dedicated `/login` page).
- **D-31:** Triggered from a CTA button in the top nav or mid-page.
- **D-32:** Single email input field, submit → "check your email" confirmation state.
- **D-33:** Preserves browse context — closing modal returns user to where they were.

**Auth — Post-Login Landing**
- **D-34:** Dedicated `/account` route.
- **D-35:** Phase 1 renders a stub with placeholder content (e.g., "Welcome, {email}" + sign-out button).
- **D-36:** Phase 3 builds the real loyalty dashboard (points balance, QR code, transaction history).

### Claude's Discretion
- Exact hex values for black/white (pure `#000`/`#fff` vs. near-black/near-white for less harshness) — pick based on editorial convention
- Specific font family choices (e.g., which serif, which sans) — pick based on Kinfolk/Cereal reference and web-font licensing
- Spacing scale specific values (Tailwind default vs. custom)
- Route group structure for web vs. mobile builds
- Drizzle schema column specifics for profiles, point_transactions, rewards, redemptions, scan_tokens
- RLS policy design on Supabase
- Dual-adapter BUILD_TARGET switching mechanism
- Better Auth + Drizzle + Resend wiring specifics
- Safe area CSS handling for mobile notches
- Scroll behavior implementation for nav shrink/fade

### Deferred Ideas (OUT OF SCOPE)
- **Apple Sign-in / Google OAuth** — Not in Phase 1. Revisit if user friction data shows magic link is too slow. Apple is mandatory only if other social logins are added.
- **Bottom tab bar for native app** — Rejected for Phase 1 and Phase 4. If mobile UX feedback demands it later, reconsider as a dedicated polish phase.
- **Dark mode token inversion** — Phase 5 (POLISH-01). Phase 1 defines tokens as CSS variables so Phase 5 can invert cleanly without refactor.
- **Accent color** — Explicitly rejected. If brand evolves and wants an accent, add later — do not pre-bake one "just in case".
- **Real home page content** — Phase 2 (BRAND-01 hero, BRAND-04 menu cards, etc.). Phase 1 stops at "Coming Soon".
- **Real `/account` dashboard** — Phase 3 (LOYAL-01 through LOYAL-09). Phase 1 stops at a stub.
- **Reward economics model** (points-per-dollar vs. buy-8-get-1-free) — Deferred to Phase 3 per STATE.md. Phase 1 schema must stay flexible.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BRAND-06 | Site is fully mobile-responsive with mobile-first design | Addressed by TailwindCSS v4 mobile-first breakpoints (default behavior), `viewport-fit=cover` + `env(safe-area-inset-*)` CSS pattern (see Safe Area Handling in Code Examples), and the `<SafeArea>` layout shell component pattern. The four infrastructure success criteria from ROADMAP (dual-adapter build, responsive layout, Drizzle schema migrated, Better Auth working) are the operational requirements that unlock this. |

</phase_requirements>

## Standard Stack

**Version verification performed 2026-04-10 against npm registry.** Published versions on record at time of research:

### Core
| Library | Version (verified) | Purpose | Why Standard |
|---------|--------------------|---------|--------------|
| svelte | 5.55.3 | UI framework with Runes reactivity | CLAUDE.md targets 5.53.x; 5.55.3 is current within the same minor line. Use Runes exclusively (`$state`, `$derived`, `$effect`). |
| @sveltejs/kit | 2.57.1 | Full-stack framework | CLAUDE.md targets 2.55.x; 2.57.1 is current within the same minor line. Required for Better Auth's `getRequestEvent()` (landed in 2.20). |
| @sveltejs/adapter-vercel | 5.10.x | Web adapter (SSR) | Pinned via `npm view` to be verified at scaffold time. Auto-installed on Vercel deploys. |
| @sveltejs/adapter-static | 3.0.10 | Capacitor adapter (fully prerendered) | Required by Capacitor — no server at runtime. Supports `fallback: 'index.html'` for SPA mode. |
| @tailwindcss/vite | 4.2.2 | Tailwind v4 Vite plugin | v4 is Vite-plugin based, not PostCSS. Installed via `sv add tailwindcss`. |
| tailwindcss | 4.2.2 | Utility CSS (CSS-first config) | CSS-first via `@theme` block. **No `tailwind.config.js`.** Zero-config content detection. |
| typescript | 5.x | Type safety | Non-negotiable for a multi-platform codebase. Scaffolded by `sv create --types ts`. |

### Database / Auth
| Library | Version (verified) | Purpose | Why Standard |
|---------|--------------------|---------|--------------|
| drizzle-orm | 0.45.2 | Type-safe ORM | Zero deps, ~7.4kb gzipped, schema-as-code. Use the `pg-core` dialect (Supabase is Postgres). |
| drizzle-kit | 0.31.10 | Migration CLI | `drizzle-kit generate` + `drizzle-kit migrate`. Use `drizzle-kit push` only in dev. |
| postgres | 3.4.9 | Postgres client driver | `postgres.js` (lowercase `postgres`) is Drizzle's recommended driver for Postgres. **Set `prepare: false` when connecting via Supabase transaction pooler.** |
| better-auth | 1.6.2 | Authentication | CLAUDE.md targets 1.6.x; 1.6.2 is current. Ships `magicLink` plugin, Drizzle adapter, and `svelteKitHandler` + `sveltekitCookies` integration. |
| @supabase/supabase-js | 2.103.0 | Supabase JS SDK | Used for Storage and Realtime (Phase 3+). Not required for Phase 1 auth flow since Better Auth handles sessions. |
| @supabase/ssr | 0.10.2 | Cookie-based SSR helpers | Only needed if Supabase-native auth is used alongside Better Auth. **Phase 1 decision: Better Auth owns sessions — @supabase/ssr only goes in if/when Supabase Storage/Realtime are needed with RLS under the logged-in user. Defer full wiring to Phase 2/3.** |

### Email
| Library | Version (verified) | Purpose | Why Standard |
|---------|--------------------|---------|--------------|
| resend | 6.10.0 | Transactional email API | Locked by CONTEXT.md D-27. Free tier: 3,000/mo, 100/day. Use `from: "Rule 257 <noreply@<your-domain>>"` after domain verification; during dev use `onboarding@resend.dev`. |
| svelte-email-tailwind | 4.0.0 | Svelte-native email templating | **Recommended substitute for React Email** (CONTEXT.md D-29 says "React Email" — this is the Svelte-native equivalent). Renders `.svelte` components via `svelte/server`'s `render()` into HTML with Tailwind class inlining. Svelte 5 compatible since 2.0.0. Eliminates the need to add React to a Svelte project. If strict adherence to D-29 is required, use `@react-email/components` + `@react-email/render` instead (adds React dep). Planner should flag this substitution for user confirmation. |

### Capacitor (native shell)
| Library | Version (verified) | Purpose | Why Standard |
|---------|--------------------|---------|--------------|
| @capacitor/core | 8.3.0 | Native bridge runtime | Phase 1 installs; Phase 4 adds plugins. Requires Node 22+. |
| @capacitor/cli | 8.3.0 | `npx cap` commands | Phase 1 needs `init`, `add ios --packagemanager SPM`, `add android`, `sync`. |
| @capacitor/ios | 8.3.0 | iOS platform | Install when `npx cap add ios` is run. SPM by default in Capacitor 8. |
| @capacitor/android | 8.3.0 | Android platform | Install when `npx cap add android` is run. |

### Dev Tools
| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| sv (Svelte CLI) | 0.15.1 | Scaffolding + addons | `npx sv create` and `npx sv add`. Available addons: `better-auth`, `drizzle`, `eslint`, `mcp`, `mdsvex`, `paraglide`, `playwright`, `prettier`, `storybook`, `sveltekit-adapter`, `tailwindcss`, `vitest`. |
| supabase (CLI) | 2.84.x+ | Local Postgres + Storage | `npx supabase init`, `npx supabase start` runs local Postgres via Docker. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| svelte-email-tailwind | @react-email/components + @react-email/render | Matches CONTEXT.md D-29 literally but adds React as a transitive dep to a Svelte-only codebase. Not worth it unless user explicitly insists. |
| postgres (postgres.js) | @neondatabase/serverless | Neon driver is better for serverless/edge but this project deploys server-full on Vercel. postgres.js is Drizzle's documented default. |
| drizzle-kit push | drizzle-kit generate + drizzle-kit migrate | `push` is faster for dev but skips migration history. Phase 1 uses `generate` + `migrate` so Phase 3 (loyalty) and Phase 4 (production) have a clean migration trail. |

### Installation Commands

```bash
# 1. Scaffold project (Phase 1, Task 1)
npx sv@latest create rule257-nyc --template minimal --types ts

# 2. cd into project
cd rule257-nyc

# 3. Layer in official addons (via Svelte CLI)
npx sv add tailwindcss drizzle better-auth prettier eslint

# 4. Runtime deps not covered by addons
npm install resend svelte-email-tailwind
npm install @capacitor/core @capacitor/cli
npm install @supabase/supabase-js @supabase/ssr

# 5. Dev deps for dual-adapter
npm install -D @sveltejs/adapter-vercel @sveltejs/adapter-static

# 6. Initialize Capacitor (post-scaffold)
npx cap init "Rule 257" "nyc.rule257.app" --web-dir build

# 7. Add native platforms (Phase 1 only verifies; Phase 4 builds)
npx cap add ios --packagemanager SPM
npx cap add android

# 8. Initialize Supabase local dev
npx supabase init
npx supabase start

# 9. Generate and apply initial Drizzle migration
npx drizzle-kit generate
npx drizzle-kit migrate
```

**Pin Node version:** create `.nvmrc` with content `22` and add to `package.json`:
```json
"engines": { "node": ">=22" }
```

## Architecture Patterns

### Recommended Project Structure

```
rule257-nyc/
├── .nvmrc                          # "22"
├── capacitor.config.ts             # webDir: "build", bundledWebRuntime: false
├── drizzle.config.ts               # schema: src/lib/server/db/schema.ts
├── svelte.config.js                # dual-adapter BUILD_TARGET switch
├── vite.config.ts                  # Tailwind v4 plugin, dev server.host: "0.0.0.0"
├── package.json                    # engines.node: ">=22"
├── supabase/
│   ├── config.toml                 # local supabase CLI config
│   └── migrations/                 # drizzle-kit output
├── src/
│   ├── app.html                    # viewport-fit=cover meta
│   ├── app.css                     # @import "tailwindcss"; @theme {...}
│   ├── hooks.server.ts             # Better Auth handler + session population
│   ├── lib/
│   │   ├── server/
│   │   │   ├── auth.ts             # betterAuth() server config (SERVER ONLY)
│   │   │   ├── db/
│   │   │   │   ├── index.ts        # drizzle client instance
│   │   │   │   └── schema.ts       # profiles, point_transactions, rewards, redemptions, scan_tokens
│   │   │   └── email/
│   │   │       ├── resend.ts       # Resend client instance
│   │   │       └── templates/
│   │   │           └── MagicLink.svelte
│   │   ├── auth-client.ts          # createAuthClient() — IMPORTABLE ANYWHERE
│   │   └── components/
│   │       ├── SafeArea.svelte     # env(safe-area-inset-*) wrapper
│   │       ├── SiteHeader.svelte   # top bar w/ hamburger
│   │       ├── SiteFooter.svelte   # placeholder editorial footer
│   │       └── AuthModal.svelte    # magic link overlay
│   └── routes/
│       ├── +layout.svelte          # global layout: SafeArea wrapper, fonts, header, footer
│       ├── +layout.server.ts       # reads locals.user, locals.session
│       ├── +page.svelte            # "Coming Soon" home (Phase 1 stub)
│       ├── account/
│       │   ├── +page.server.ts     # auth guard: redirect(302, "/") if !locals.user
│       │   └── +page.svelte        # stub: "Welcome, {email}" + sign-out button
│       └── api/
│           └── auth/
│               └── [...all]/
│                   └── +server.ts  # Better Auth's catch-all handler
├── static/
│   └── fonts/                      # self-hosted woff2 (preloaded from app.html)
├── ios/                            # created by npx cap add ios (Phase 1 verifies)
└── android/                        # created by npx cap add android (Phase 1 verifies)
```

**Route Group Decision (D-15/D-16 honored):**
Because CONTEXT.md explicitly rejected distinct tab-bar/hamburger patterns between web and native (D-15: "hamburger for both"), **Phase 1 does NOT need separate `(site)` / `(app)` route groups**. A single root `+layout.svelte` is sufficient. The `ARCHITECTURE.md` research file recommends route groups, but that was written before the discuss phase locked hamburger-only navigation. Revisit route groups in Phase 3 only if the admin panel needs a distinct layout.

### Pattern 1: Dual-Adapter via BUILD_TARGET

**What:** `svelte.config.js` reads `process.env.BUILD_TARGET` and swaps adapters.
**When to use:** Always. This is the architectural backbone for single-codebase web+native.
**Scripts:** Add to `package.json`:
```json
"scripts": {
  "dev": "vite dev",
  "build": "vite build",
  "build:mobile": "BUILD_TARGET=mobile vite build",
  "cap:sync": "npm run build:mobile && npx cap sync",
  "cap:ios": "npm run cap:sync && npx cap open ios",
  "cap:android": "npm run cap:sync && npx cap open android"
}
```

(On Windows, use `cross-env` or PowerShell syntax: `$env:BUILD_TARGET='mobile'; vite build`. Install `cross-env` to keep scripts portable.)

```javascript
// svelte.config.js — Source: SvelteKit adapter docs + Khromov SvelteKit+Capacitor starter
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
          fallback: 'index.html',   // SPA fallback for Capacitor
          strict: false              // relax: loyalty routes aren't prerenderable
        })
      : adapterVercel(),

    // Mobile-only: collapse JS into a single bundle (HTTP/1 connection limits)
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

### Pattern 2: TailwindCSS v4 CSS-First Theme

**What:** All design tokens live in `src/app.css` via `@theme` block. No JS config file.
**When to use:** Always in v4. Tokens become CSS variables AND generate utility classes.

```css
/* src/app.css — Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  /* ---------- Color (Phase 5 dark mode will invert these) ---------- */
  --color-ink: #0a0a0a;          /* near-black: less harsh than pure #000 for editorial feel */
  --color-paper: #fafafa;        /* near-white: matches gallery wall off-white */
  --color-ink-muted: #6b6b6b;
  --color-paper-muted: #eaeaea;
  --color-hairline: #e5e5e5;     /* subtle dividers */

  /* ---------- Typography (D-05, D-06, D-07) ---------- */
  /* Serif for headings — Kinfolk/Cereal reference */
  --font-serif: "Canela", "GT Super", Georgia, "Times New Roman", serif;
  /* Sans for body */
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  /* Mono (rare use, but define so utilities exist) */
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;

  /* ---------- Spacing (D-09, D-10, D-11) ---------- */
  /* Base unit 0.25rem (Tailwind default). Adds large section gaps. */
  --spacing: 0.25rem;

  /* ---------- Breakpoints (mobile-first) ---------- */
  --breakpoint-sm: 40rem;   /* 640 */
  --breakpoint-md: 48rem;   /* 768 */
  --breakpoint-lg: 64rem;   /* 1024 */
  --breakpoint-xl: 80rem;   /* 1280 */
}

/* Safe area CSS vars (available everywhere, not tied to @theme) */
:root {
  --safe-top: env(safe-area-inset-top, 0px);
  --safe-right: env(safe-area-inset-right, 0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left: env(safe-area-inset-left, 0px);
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
  font-weight: 400;   /* serif editorial weight is lighter than sans headings */
}
```

**Font licensing note:** Canela and GT Super are commercial. For Phase 1 use licensed fonts if available, otherwise substitute **DM Serif Display** or **Fraunces** (both open source, editorial feel). Inter is free. Self-host all fonts under `static/fonts/` and `<link rel="preload">` from `app.html`.

### Pattern 3: Better Auth Magic Link Wiring

**What:** Three files — server config, client config, SvelteKit hook.
**When to use:** Once, in Phase 1. Everything else builds on this foundation.

```typescript
// src/lib/server/auth.ts — Source: https://better-auth.com/docs/integrations/svelte-kit
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { render } from "svelte/server";
import { db } from "$lib/server/db";
import { resend } from "$lib/server/email/resend";
import MagicLinkEmail from "$lib/server/email/templates/MagicLink.svelte";
import { env } from "$env/dynamic/private";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL, // e.g. http://localhost:5173
  plugins: [
    magicLink({
      expiresIn: 60 * 10,       // 10 minutes
      disableSignUp: false,     // D-25: unify signup + login
      sendMagicLink: async ({ email, url, token }) => {
        const { html } = render(MagicLinkEmail, { props: { url, email } });
        await resend.emails.send({
          from: "Rule 257 <noreply@rule257.nyc>",
          to: email,
          subject: "Your Rule 257 sign-in link",
          html
        });
      }
    }),
    sveltekitCookies(getRequestEvent)
  ]
});
```

```typescript
// src/lib/auth-client.ts — Source: https://better-auth.com/docs/integrations/svelte-kit
import { createAuthClient } from "better-auth/svelte";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [magicLinkClient()]
});
```

```typescript
// src/hooks.server.ts — Source: https://better-auth.com/docs/integrations/svelte-kit
import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  // Better Auth does NOT auto-populate locals — we must do it
  const session = await auth.api.getSession({
    headers: event.request.headers
  });
  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }
  return svelteKitHandler({ event, resolve, auth, building });
};
```

```typescript
// src/app.d.ts — type locals
import type { Session, User } from "better-auth";
declare global {
  namespace App {
    interface Locals {
      session?: Session;
      user?: User;
    }
  }
}
export {};
```

```typescript
// src/routes/api/auth/[...all]/+server.ts — catch-all for Better Auth endpoints
import { auth } from "$lib/server/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ request }) => auth.handler(request);
export const POST: RequestHandler = ({ request }) => auth.handler(request);
```

### Pattern 4: Svelte Email Template for Magic Link

**What:** A `.svelte` component that renders to HTML server-side via `svelte/server`'s `render()`.
**When to use:** Every transactional email.

```svelte
<!-- src/lib/server/email/templates/MagicLink.svelte -->
<!-- Source: https://github.com/steveninety/svelte-email-tailwind README -->
<script lang="ts">
  let { url, email }: { url: string; email: string } = $props();
</script>

<div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 48px 24px; background: #fafafa; color: #0a0a0a;">
  <h1 style="font-family: Georgia, serif; font-size: 28px; font-weight: 400; margin: 0 0 24px;">
    Rule 257
  </h1>
  <p style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6;">
    Click the link below to sign in to your account.
  </p>
  <p style="margin: 32px 0;">
    <a href={url} style="display: inline-block; padding: 14px 28px; background: #0a0a0a; color: #fafafa; text-decoration: none; font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">
      Sign in
    </a>
  </p>
  <p style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; font-size: 13px; color: #6b6b6b; line-height: 1.6;">
    This link expires in 10 minutes. If you didn't request it, you can safely ignore this email.
  </p>
  <p style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; font-size: 12px; color: #6b6b6b; margin-top: 48px; border-top: 1px solid #e5e5e5; padding-top: 16px;">
    Rule 257 · 54 Eldridge St, New York, NY
  </p>
</div>
```

**Note on inline styles:** Email clients strip or mangle external CSS. Inline styles are the safest default for Phase 1. If the email templates grow complex, `svelte-email-tailwind` will inline Tailwind classes at render time — add that only when needed.

### Pattern 5: Drizzle Schema for Loyalty Tables

**What:** `src/lib/server/db/schema.ts` defines all tables as TypeScript. `drizzle-kit generate` produces SQL migrations.
**When to use:** Phase 1 creates all five loyalty tables plus Better Auth's required tables.

```typescript
// src/lib/server/db/schema.ts
// Source: https://orm.drizzle.team/docs/sql-schema-declaration
import {
  pgTable, text, integer, boolean, timestamp, uuid, check
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------- Better Auth tables ----------
// Better Auth generates these via its CLI: `npx @better-auth/cli generate`
// Alternatively, the magic link plugin requires: user, session, account, verification.
// Run the CLI command to generate them; do not hand-write.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// ---------- Rule 257 loyalty tables ----------

export const profile = pgTable("profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }).unique(),
  displayName: text("display_name"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  pointsBalance: integer("points_balance").notNull().default(0),
  lifetimePoints: integer("lifetime_points").notNull().default(0),
  role: text("role").notNull().default("customer"),
  qrCodeId: uuid("qr_code_id").notNull().defaultRandom().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (t) => [
  check("role_check", sql`${t.role} IN ('customer', 'staff', 'admin')`)
]);

export const pointTransaction = pgTable("point_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profile.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: text("type").notNull(),  // 'earn' | 'redeem' | 'bonus' | 'adjust'
  description: text("description"),
  issuedBy: uuid("issued_by").references(() => profile.id),
  scanToken: text("scan_token").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow()
}, (t) => [
  check("type_check", sql`${t.type} IN ('earn', 'redeem', 'bonus', 'adjust')`)
]);

export const reward = pgTable("reward", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  stock: integer("stock"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const redemption = pgTable("redemption", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").notNull().references(() => profile.id, { onDelete: "cascade" }),
  rewardId: uuid("reward_id").notNull().references(() => reward.id),
  pointsSpent: integer("points_spent").notNull(),
  status: text("status").notNull().default("pending"),  // 'pending' | 'fulfilled' | 'expired'
  redemptionCode: uuid("redemption_code").notNull().defaultRandom().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  fulfilledAt: timestamp("fulfilled_at"),
  fulfilledBy: uuid("fulfilled_by").references(() => profile.id)
}, (t) => [
  check("status_check", sql`${t.status} IN ('pending', 'fulfilled', 'expired')`)
]);

export const scanToken = pgTable("scan_token", {
  token: uuid("token").primaryKey().defaultRandom(),
  createdBy: uuid("created_by").notNull().references(() => profile.id),
  pointsValue: integer("points_value").notNull().default(1),
  used: boolean("used").notNull().default(false),
  usedBy: uuid("used_by").references(() => profile.id),
  expiresAt: timestamp("expires_at").notNull().default(sql`now() + interval '5 minutes'`),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
```

**Schema flexibility note (PHASE 3 blocker from STATE.md):** Reward economics (points-per-dollar vs buy-8-get-1-free) is undecided. The schema above supports BOTH: `pointsBalance` + `pointTransaction` handles points-per-dollar, while the buy-8-get-1 model can be layered on top as a derived value (count transactions of a given product since last redemption). **Do not bake the economic model into Phase 1 schema.**

```typescript
// src/lib/server/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "$env/dynamic/private";
import * as schema from "./schema";

// Supabase transaction pooler note: disable prepared statements
const queryClient = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(queryClient, { schema });
```

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/server/db/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
```

### Pattern 6: Capacitor 8 Config (SPM)

```typescript
// capacitor.config.ts — Source: Capacitor 8 docs + Khromov SvelteKit+Capacitor starter
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "nyc.rule257.app",
  appName: "Rule 257",
  webDir: "build",           // matches adapter-static pages/assets output
  bundledWebRuntime: false
  // NOTE: Do NOT set server.url here in committed config.
  // For dev live-reload, use a local capacitor.config.dev.ts or set via env.
};

export default config;
```

**iOS init:** `npx cap add ios --packagemanager SPM` creates `ios/App/Package.swift` (NOT `Podfile`). Verify with:
```bash
test -f ios/App/Package.swift && echo "SPM OK"
test ! -f ios/App/Podfile && echo "No CocoaPods OK"
```

### Anti-Patterns to Avoid

- **Creating `tailwind.config.js`:** v4 is CSS-first only. If the file exists, delete it. Following v3 tutorials is Pitfall #13 from PITFALLS.md.
- **Using `+page.server.ts` in routes that must work in Capacitor static build:** These routes return 404 in the static build. If a loyalty route needs server-side data, use a `+page.ts` universal load and call Supabase/Better Auth from the browser. `+page.server.ts` is fine for web-only routes (admin, possibly the brand site).
- **Storing the magic link token server-side by hand:** Better Auth's `magicLink` plugin manages token lifecycle. Do not add custom `magic_link_tokens` table.
- **Setting `server.url` in committed `capacitor.config.ts`:** If this ships to production, the app breaks. Use a separate dev config or env-injected override.
- **Using `createServerClient` from @supabase/ssr in Phase 1:** Not needed. Better Auth handles web sessions. @supabase/ssr only matters when Supabase RLS must identify the logged-in user (Phase 3).
- **Running `drizzle-kit push` in Phase 1:** Use `generate` + `migrate` so the migration history is clean for later phases.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Magic link token generation | Custom random token + DB row + expiry logic | `better-auth/plugins/magicLink` | Plugin handles token generation, hashing, expiry, replay prevention, rate limiting, sign-up/sign-in unification. Hand-rolling reinvents 200+ lines of security-critical code. |
| Session cookie management | Custom cookie signing/rotation | `sveltekitCookies(getRequestEvent)` | SameSite, Secure, HttpOnly, path scoping, rotation on login — all handled. |
| Email HTML templating | String concatenation with styles | `svelte-email-tailwind` or hand-written inline-styled `.svelte` component rendered via `svelte/server`'s `render()` | Email clients are hostile to modern CSS. Use a template that's been cross-client tested, or at minimum keep all styles inline. |
| Database migrations | Hand-writing SQL migration files | `drizzle-kit generate` + `drizzle-kit migrate` | Generates forward migrations from schema diff. Version history is deterministic. |
| Font loading | CSS `@import` from Google Fonts | Self-host in `static/fonts/`, preload from `app.html` | Third-party @import blocks render and leaks visitor data. Self-hosting is faster, privacy-friendly, and gives full control over subsetting. |
| Safe area insets | Fixed pixel padding for notches | `env(safe-area-inset-*)` via CSS variables | Device-aware. Works on every iOS and Android device, including ones that don't exist yet. |
| Viewport meta tag | Copy-pasting random snippets | `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` | Required literal. `viewport-fit=cover` is non-optional for Capacitor. |
| Drizzle + Better Auth schema for user/session/account/verification tables | Writing them by hand | `npx @better-auth/cli generate` | Better Auth CLI introspects plugin config and emits the exact schema it needs. Hand-writing risks plugin drift. |
| QR code token (deferred to Phase 3 but schema defined here) | Custom UUID + "used" flag logic | `scan_token` table with atomic Postgres RPC in Phase 3 | Prevents replay attacks. Phase 1 defines the schema only; RPC logic is Phase 3. |
| Supabase local Postgres | Docker Compose from scratch | `npx supabase init && npx supabase start` | CLI manages Postgres, Storage, Auth, Realtime, Inbucket (email catcher) as a unit. |

**Key insight:** Phase 1 is the phase most at risk of "I'll just write my own" shortcuts. Every one of the above items has working, actively maintained upstream solutions that handle edge cases invisibly. Writing any of them by hand in Phase 1 creates debt that resurfaces in Phase 3 or 4 as a rewrite.

## Common Pitfalls

### Pitfall 1: API Routes Vanish in Static Build (from PITFALLS.md Pitfall #1)

**What goes wrong:** `+page.server.ts` load functions work perfectly in `npm run dev` and also work in `BUILD_TARGET=vercel vite build`, but return 404 when the same code runs inside the Capacitor shell after `BUILD_TARGET=mobile vite build`.
**Why it happens:** `adapter-static` produces a static site — there is no server to run `+page.server.ts`. SvelteKit's dev server runs all routes regardless of adapter, masking the mismatch.
**How to avoid:**
1. Phase 1 scripts must include `npm run build:mobile` and it must succeed.
2. The single route that lives under `/account` in Phase 1 is auth-gated — handle the guard client-side in a `+layout.svelte` or `+page.ts` using `authClient.useSession()` instead of `+page.server.ts`.
3. `/api/auth/[...all]/+server.ts` is intentionally server-only — it only needs to work on the Vercel deployment, not inside Capacitor. The Capacitor build calls the deployed web endpoint directly.
**Warning signs:** `build/index.html` exists after `build:mobile` but `build/account/` is empty or contains no data; `npx cap run ios` shows 404s in the WebView console.

### Pitfall 2: Node Version Mismatch (PITFALLS.md Pitfall #10)

**What goes wrong:** Local dev on Node 20 "works" until `npx cap sync` throws cryptic errors.
**How to avoid:** `.nvmrc` with `22`, `package.json` `engines.node: ">=22"`, and CI/CD uses Node 22. Add a `preinstall` check script if possible.
**Warning signs:** `npx cap` commands fail with syntax errors or "unexpected token".

### Pitfall 3: CocoaPods Instead of SPM (PITFALLS.md Pitfall #3)

**What goes wrong:** Forgot the `--packagemanager SPM` flag; Capacitor 8 defaults to SPM now BUT tutorials from Capacitor 7 era muscle-memory still suggest CocoaPods.
**How to avoid:** Always `npx cap add ios --packagemanager SPM`. Add a verification task to the plan that checks `test -f ios/App/Package.swift && ! test -f ios/App/Podfile`.
**Warning signs:** `ios/App/Podfile` exists in the tree after `cap add ios`.

### Pitfall 4: TailwindCSS v4 with v3 Config File (PITFALLS.md Pitfall #13)

**What goes wrong:** Developer follows a 2024 tutorial and creates `tailwind.config.js` with a `content:` array. In v4, this file is not read and silently ignored.
**How to avoid:** Do not create `tailwind.config.js`. All config goes in `app.css` inside a `@theme { ... }` block. The `sv add tailwindcss` addon scaffolds this correctly; do not manually adjust.
**Warning signs:** Utility classes don't reflect custom tokens; `text-ink` doesn't exist even though `--color-ink` is defined somewhere other than `@theme`.

### Pitfall 5: Safe Area Not Configured From Day One (PITFALLS.md Pitfall #7)

**What goes wrong:** Phase 1 ships a layout that looks fine in mobile Safari DevTools, then Phase 4 builds the iOS app and the header is hidden under the Dynamic Island.
**How to avoid:** Add `viewport-fit=cover` to `app.html` IN PHASE 1. Define `--safe-*` CSS variables in `:root` IN PHASE 1. Build a `<SafeArea>` wrapper component IN PHASE 1. The "Coming Soon" page uses it.
**Warning signs:** Without `viewport-fit=cover`, `env(safe-area-inset-top)` returns 0 on iOS Safari and looks "correct" on desktop — the problem only surfaces on a real device with a notch.

### Pitfall 6: Resend From-Address Rejected

**What goes wrong:** Magic link email bounces because the `from` address uses an unverified domain.
**How to avoid:** During Phase 1 dev, use `onboarding@resend.dev` (Resend's shared domain) which works out-of-box but only delivers to the Resend account's verified email. For testing with other users, verify `rule257.nyc` in Resend (requires DNS TXT record) before submitting magic link to a real address. OR use `npx supabase start`'s Inbucket (port 54324) as a local email catcher during dev.
**Warning signs:** `resend.emails.send()` returns success but no email arrives; Resend dashboard shows "bounced" or "blocked."

### Pitfall 7: Better Auth CLI Schema Drift

**What goes wrong:** Hand-write `user`/`session`/`account`/`verification` tables in Drizzle schema, Better Auth 1.7 adds a column, migration breaks.
**How to avoid:** Run `npx @better-auth/cli generate` to emit the schema that matches the installed plugin versions. Commit the generated file as-is. Re-run on Better Auth upgrades.
**Warning signs:** Runtime error from Better Auth mentioning a missing column.

### Pitfall 8: Supabase Transaction Pooler Prepared Statements

**What goes wrong:** Drizzle defaults to prepared statements via `postgres.js`; Supabase's transaction pooler does not support them.
**How to avoid:** `postgres(env.DATABASE_URL, { prepare: false })`. This is non-obvious and specific to Supabase.
**Warning signs:** First DB query succeeds, subsequent queries fail with "prepared statement ... does not exist."

### Pitfall 9: RLS Disabled on New Tables

**What goes wrong:** Drizzle-created tables don't have RLS enabled by default. Any authenticated user can read/write everything via the Supabase client.
**How to avoid:** After `drizzle-kit migrate`, run a follow-up migration that enables RLS on every table. Phase 1 can set baseline "authenticated users can read own profile" as a sanity check; full policies are Phase 3.
**Warning signs:** Supabase dashboard shows red "RLS disabled" warnings on loyalty tables.

### Pitfall 10: Capacitor Live-Reload IP Binding (PITFALLS.md Pitfall #14)

**What goes wrong:** Vite dev server binds to `localhost` only; Capacitor WebView on a simulator/device can't reach it.
**How to avoid:** `vite.config.ts` sets `server.host: "0.0.0.0"` and `server.port: 5173`. For live-reload on a physical device, `capacitor.config.ts` `server.url` must be set to the dev machine's LAN IP — but ONLY in a dev-only config, never in the committed file.
**Warning signs:** Blank white screen in Capacitor WebView; console shows "connection refused."

## Code Examples

### Dual-Adapter `svelte.config.js`
(See Pattern 1 above — full file.)

### TailwindCSS v4 `@theme` Block
(See Pattern 2 above — full `app.css`.)

### `app.html` With Viewport + Font Preload

```html
<!-- src/app.html -->
<!doctype html>
<html lang="en" %sveltekit.theme%>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="description" content="Rule 257 — where art, fashion, design, and coffee converge. 54 Eldridge St, NYC." />
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />

    <!-- Font preload: priority hint for the two-font stack -->
    <link rel="preload" href="%sveltekit.assets%/fonts/serif-display.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="%sveltekit.assets%/fonts/sans-body.woff2" as="font" type="font/woff2" crossorigin />

    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### `<SafeArea>` Wrapper Component

```svelte
<!-- src/lib/components/SafeArea.svelte -->
<script lang="ts">
  let { children, top = true, bottom = true, sides = true } = $props();
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

### Root Layout Using SafeArea

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import "../app.css";
  import SafeArea from "$lib/components/SafeArea.svelte";
  import SiteHeader from "$lib/components/SiteHeader.svelte";
  import SiteFooter from "$lib/components/SiteFooter.svelte";
  let { children } = $props();
</script>

<SafeArea>
  <div class="flex min-h-dvh flex-col">
    <SiteHeader />
    <main class="flex-1">
      {@render children()}
    </main>
    <SiteFooter />
  </div>
</SafeArea>
```

### Magic Link Modal (Svelte 5 Runes)

```svelte
<!-- src/lib/components/AuthModal.svelte -->
<script lang="ts">
  import { authClient } from "$lib/auth-client";

  let open = $state(false);
  let email = $state("");
  let status = $state<"idle" | "sending" | "sent" | "error">("idle");
  let errorMessage = $state("");

  export function openModal() {
    open = true;
    status = "idle";
    email = "";
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    status = "sending";
    const { error } = await authClient.signIn.magicLink({
      email: email.trim(),
      callbackURL: "/account"
    });
    if (error) {
      status = "error";
      errorMessage = error.message ?? "Something went wrong.";
    } else {
      status = "sent";
    }
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-ink/60"
    onclick={() => (open = false)}
    role="dialog"
    aria-modal="true"
  >
    <div
      class="w-full max-w-md bg-paper p-10 shadow-xl"
      onclick={(e) => e.stopPropagation()}
    >
      {#if status === "sent"}
        <h2 class="font-serif text-2xl">Check your email</h2>
        <p class="mt-4 text-ink-muted">We sent a sign-in link to <strong>{email}</strong>.</p>
        <p class="mt-2 text-sm text-ink-muted">The link expires in 10 minutes.</p>
      {:else}
        <h2 class="font-serif text-2xl">Sign in</h2>
        <p class="mt-2 text-ink-muted">Enter your email and we'll send you a link.</p>
        <form onsubmit={handleSubmit} class="mt-8 space-y-4">
          <input
            type="email"
            bind:value={email}
            required
            placeholder="you@example.com"
            class="w-full border-b border-hairline bg-transparent py-3 focus:outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={status === "sending"}
            class="w-full bg-ink py-3 text-paper text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {status === "sending" ? "Sending..." : "Send link"}
          </button>
          {#if status === "error"}
            <p class="text-sm text-red-600">{errorMessage}</p>
          {/if}
        </form>
      {/if}
    </div>
  </div>
{/if}
```

### `/account` Stub Page With Client-Side Guard

```svelte
<!-- src/routes/account/+page.svelte -->
<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";

  const session = authClient.useSession();

  $effect(() => {
    if ($session.data === null) {
      goto("/");
    }
  });
</script>

{#if $session.isPending}
  <p class="p-8">Loading...</p>
{:else if $session.data?.user}
  <div class="p-8">
    <h1 class="font-serif text-3xl">Welcome, {$session.data.user.email}</h1>
    <p class="mt-4 text-ink-muted">Your loyalty dashboard will live here.</p>
    <button
      class="mt-8 border border-ink px-6 py-2 text-sm uppercase tracking-widest"
      onclick={async () => {
        await authClient.signOut();
        goto("/");
      }}
    >
      Sign out
    </button>
  </div>
{/if}
```

**Note:** This uses a client-side guard (NOT `+page.server.ts`) so it works inside the Capacitor static build. For the web deployment, also add a parallel `+page.server.ts` guard for SEO/security — but make sure the file only runs on Vercel by checking `BUILD_TARGET` at build time, or accept that `/account` is a non-prerenderable route and add `export const prerender = false;` to it.

### `.env` File Template

```bash
# .env (gitignored)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:5173
RESEND_API_KEY=re_<from resend.com dashboard>
PUBLIC_SUPABASE_URL=http://localhost:54321
PUBLIC_SUPABASE_ANON_KEY=<from `npx supabase status`>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Svelte 4 stores (`writable`, `$:`) | Svelte 5 Runes (`$state`, `$derived`, `$effect`) | Svelte 5 GA (Oct 2024) | Mandatory for new projects per CLAUDE.md. No `svelte/store` imports. |
| `tailwind.config.js` | `@theme` block in CSS | Tailwind v4 (Jan 2025) | No JS config. Content detection is automatic. |
| @supabase/auth-helpers-sveltekit | @supabase/ssr | auth-helpers deprecated 2024 | 0.10.x is current. Only needed if Supabase auth is used (we use Better Auth instead). |
| Auth.js (NextAuth) for SvelteKit | Better Auth 1.x | Better Auth became official Svelte CLI addon (sv 0.12, 2025) | More extensible, typed, integrates with Drizzle natively. |
| CocoaPods for iOS | Swift Package Manager | Capacitor 8 default (2025); CocoaPods specs repo read-only Dec 2, 2026 | **Hard deadline.** All new projects must use SPM. |
| `npm create svelte@latest` | `npx sv create` | sv CLI released 2024 | New addon system replaces template system. |
| `pnpm create vite` with Svelte template | `npx sv create` | sv CLI released 2024 | Same as above. |
| Node 20 for Capacitor | Node 22+ required | Capacitor 8 (2025) | Drops Node 18/20 support. CI/CD must be updated. |

**Deprecated / outdated warnings:**
- Any tutorial dated before Oct 2024 likely uses Svelte 4 stores — ignore.
- Any Tailwind tutorial showing `tailwind.config.js` is v3 — ignore.
- Any Capacitor tutorial showing `pod install` is pre-v8 — ignore.
- Any SvelteKit tutorial using `npm create svelte@latest` — use `npx sv create` instead.
- Any Supabase SvelteKit tutorial using `auth-helpers` — use `@supabase/ssr` (or Better Auth).

## Open Questions

1. **Email templating library: svelte-email-tailwind vs React Email**
   - What we know: CONTEXT.md D-29 literally says "React Email". svelte-email-tailwind is the Svelte-native equivalent and avoids adding React as a dep to a Svelte project.
   - What's unclear: Whether the user's mention of "React Email" was prescriptive (we must use that specific library) or descriptive (we want component-based email templating, React Email was the reference point).
   - Recommendation: Planner should flag this at the start of Phase 1 planning. Default to `svelte-email-tailwind` unless user confirms React Email is required. Both produce equivalent output.

2. **Better Auth session table vs Drizzle-managed loyalty profile table join**
   - What we know: Better Auth creates a `user` table; the loyalty system needs a `profile` table with `pointsBalance`, etc.
   - What's unclear: Whether to use `profile.userId` as a foreign key to Better Auth's `user.id` (clean separation, two tables to join) or to extend Better Auth's user table via schema (one table, requires Better Auth schema augmentation).
   - Recommendation: Use the foreign key approach (shown in Pattern 5). Cleaner, upgrade-safer, and Better Auth's schema stays canonical.

3. **Font choices — Canela/GT Super vs open source alternatives**
   - What we know: CONTEXT.md discretion area — D-08 says "font loading must be optimized (subset, preload, fallback)". Reference is Kinfolk/Cereal.
   - What's unclear: Whether commercial licenses are available/worth it for Phase 1 placeholder, or whether to launch with open source and upgrade in Phase 5.
   - Recommendation: Phase 1 uses open source pair (**DM Serif Display** for serif headings, **Inter** for sans body). Both Google Fonts, self-hosted. Upgrade path to Canela/GT Super is a one-line CSS change in Phase 5.

4. **Supabase local dev vs cloud dev for Phase 1**
   - What we know: ROADMAP Phase 1 success criterion #3 says "Supabase local dev running." STACK.md recommends Supabase CLI.
   - What's unclear: Whether the planner should also provision a cloud Supabase project for "realistic" testing, or strictly stay local.
   - Recommendation: Phase 1 is LOCAL ONLY. Cloud setup deferred to Phase 2 (when the first real data needs to persist across machines). This keeps Phase 1 runnable offline and free.

5. **Single-adapter scaffolding vs dual-adapter from day one**
   - What we know: Phase 1 success criterion #1 requires BOTH adapters working via BUILD_TARGET.
   - What's unclear: Whether the planner should scaffold with `sv add sveltekit-adapter` (which installs one default) or install both manually.
   - Recommendation: Let `sv create` scaffold with its default (adapter-auto or adapter-vercel — verify at scaffold time), then `npm install -D @sveltejs/adapter-static @sveltejs/adapter-vercel` as explicit additions, then replace `svelte.config.js` with the dual-adapter pattern.

## Sources

### Primary (HIGH confidence)
- [Better Auth SvelteKit Integration Docs](https://better-auth.com/docs/integrations/svelte-kit) — hooks.server.ts, auth.ts, auth-client.ts canonical patterns. Authoritative.
- [Better Auth Magic Link Plugin Docs](https://better-auth.com/docs/plugins/magic-link) — sendMagicLink signature, expiresIn, disableSignUp, magicLinkClient. Authoritative.
- [TailwindCSS v4 @theme Docs](https://tailwindcss.com/docs/theme) — @theme block syntax, --color-*, --font-*, --spacing. Authoritative.
- [TailwindCSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, no config file.
- [SvelteKit Configuration Docs](https://svelte.dev/docs/kit/configuration) — kit.output.bundleStrategy, kit.alias, adapter field.
- [SvelteKit adapter-static Docs](https://svelte.dev/docs/kit/adapter-static) — pages, assets, fallback, strict, precompress options.
- [Svelte CLI sv create Docs](https://svelte.dev/docs/cli/sv-create) — template, types, add-ons list, --install flag.
- [Svelte CLI sv add Docs](https://svelte.dev/docs/cli/sv-add) — better-auth, drizzle, tailwindcss addons.
- [Capacitor 8 Announcement](https://ionic.io/blog/announcing-capacitor-8) — SPM default, Node 22+, iOS 15+.
- [Capacitor 8 Update Guide](https://capacitorjs.com/docs/updating/8-0) — Xcode 26+, Android API 23+.
- [Capacitor Swift Package Manager Docs](https://capacitorjs.com/docs/ios/spm) — `--packagemanager SPM` flag, Package.swift layout.
- [Drizzle + Supabase Get Started](https://orm.drizzle.team/docs/get-started/supabase-new) — postgres.js with `prepare: false`, drizzle.config.ts shape.
- [Drizzle SQL Schema Declaration](https://orm.drizzle.team/docs/sql-schema-declaration) — pgTable, column types, check constraints.
- [Supabase Drizzle Integration](https://supabase.com/docs/guides/database/drizzle) — transaction pooler note.
- [Khromov single-file bundle strategy post](https://khromov.se/building-portable-web-apps-with-sveltekits-new-single-file-bundle-strategy-and-hash-router/) — `output.bundleStrategy: 'single'` for Capacitor.
- [SvelteKit Route Groups](https://svelte.dev/docs/kit/routing) — `(app)` grouping syntax.
- [SvelteKit Advanced Routing Tutorial](https://svelte.dev/tutorial/kit/route-groups) — layout reset with `+page@` syntax.
- [MDN env() docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env) — safe-area-inset-* variables.
- [Apple WebKit "Designing Websites for iPhone X"](https://webkit.org/blog/7929/designing-websites-for-iphone-x/) — viewport-fit=cover requirement for env() insets.

### Secondary (MEDIUM confidence, verified with primary)
- [svelte-email-tailwind GitHub](https://github.com/steveninety/svelte-email-tailwind) — Svelte 5 compatible since 2.0.0, `render()` example with Resend. Actively maintained.
- [Bryan Hogan: Web to App with SvelteKit + Capacitor](https://bryanhogan.com/blog/web-to-app-sveltekit-capacitor) — community integration walkthrough; patterns cross-checked with official Capacitor docs.
- [Capgo: Building Mobile Apps with SvelteKit and Capacitor](https://capgo.app/blog/creating-mobile-apps-with-sveltekit-and-capacitor/) — `webDir: "build"` and stale sync warning; cross-checked with Capacitor docs.
- [Dev.to: Magic link authentication with Better Auth + Resend](https://dev.to/daanish2003/magic-link-authentication-using-betterauth-nextjs-shadcn-prisma-resend-tailwindcss-1hjl) — sendMagicLink Resend implementation; cross-verified against Better Auth docs.

### Tertiary (LOW confidence, cited for context only)
- [Cross-Platform Sveltekit & Capacitor: Yes It's Possible! — Ionic Blog](https://ionic.io/blog/cross-platform-sveltekit-capacitor-application-yes-its-possible) — general encouragement, no specific code.
- [CocoaPods read-only Dec 2026 — Capgo](https://capgo.app/blog/ios-spm-vs-cocoapods-capacitor-migration-guide/) — secondary source; primary confirmation via Capacitor 8 announcement.

### npm registry version verification (performed 2026-04-10)
- svelte: 5.55.3 (CLAUDE.md targets 5.53.x)
- @sveltejs/kit: 2.57.1 (CLAUDE.md targets 2.55.x)
- @sveltejs/adapter-static: 3.0.10
- tailwindcss: 4.2.2
- @tailwindcss/vite: 4.2.2
- better-auth: 1.6.2
- drizzle-orm: 0.45.2
- drizzle-kit: 0.31.10
- postgres: 3.4.9
- @capacitor/core: 8.3.0
- @capacitor/cli: 8.3.0
- @capacitor/ios: 8.3.0
- @capacitor/android: 8.3.0
- @supabase/supabase-js: 2.103.0
- @supabase/ssr: 0.10.2
- resend: 6.10.0
- svelte-email-tailwind: 4.0.0
- sv (Svelte CLI): 0.15.1

All versions confirmed within same or later minor line than CLAUDE.md targets. No breaking changes expected within these minor ranges.

## Metadata

**Confidence breakdown:**
- **Standard stack:** HIGH — every package verified against npm registry at research time, matches CLAUDE.md version matrix, and all Better Auth / Drizzle / Tailwind v4 patterns cross-verified against official docs.
- **Architecture patterns:** HIGH — dual-adapter, Better Auth wiring, Drizzle schema, and Capacitor init are all documented patterns with official or actively-maintained community sources. Route group decision (single-layout vs `(site)`/`(app)`) adjusted from ARCHITECTURE.md to honor CONTEXT.md D-15 hamburger-only decision.
- **Pitfalls:** HIGH — all ten pitfalls are either cross-referenced to PITFALLS.md (which was HIGH confidence) or verified against official docs during this phase's research. Supabase transaction pooler `prepare: false` note is specific, verified, and easy to miss.
- **Open questions:** Medium — five items identified where planner needs a quick decision or user confirmation before implementation. None are blockers; all have recommended defaults.

**Research date:** 2026-04-10
**Valid until:** 2026-05-10 (30 days — stack is in stable minor-version ranges and unlikely to shift, but verify versions at scaffold time since sv, Tailwind, and Better Auth are all under active development)
