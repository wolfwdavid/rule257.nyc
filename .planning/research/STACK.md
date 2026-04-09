# Stack Research

**Domain:** Creative cafe brand/portfolio website + loyalty mobile app
**Researched:** 2026-04-09
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Svelte 5 | 5.53.x | UI framework | Runes reactivity model is the current stable API. Smallest bundle size of any major framework (~2kb hello world). Built-in transitions/animations eliminate extra deps for the portfolio gallery and menu interactions. |
| SvelteKit | 2.55.x | Full-stack framework | Official meta-framework for Svelte. Server-side rendering for the portfolio site (SEO), adapter system for dual deployment (Vercel web + static Capacitor builds). Form actions handle loyalty signup/login without client-side JS. |
| Capacitor | 8.3.x | Native iOS/Android shell | Wraps SvelteKit static build into native apps. SPM is now the default iOS dependency manager (CocoaPods entering read-only Dec 2026). Capacitor 8 requires Node 22+, iOS 15+, Android API 23+. |
| Supabase | 2.102.x (JS client) | Backend-as-a-Service | PostgreSQL with Row Level Security is ideal for relational loyalty data (users, transactions, points, rewards). Built-in auth, real-time subscriptions, storage for gallery images. 2M+ weekly npm downloads, growing BaaS market share. Predictable pricing vs Firebase's per-operation billing matters for frequent point updates. |
| TailwindCSS | 4.2.x | Utility-first CSS | v4 is CSS-first (no tailwind.config.js needed). Zero-config content detection. 5x faster full builds. Clean minimal aesthetic maps directly to utility classes -- white space, sharp typography, restrained palette. |

### Authentication & Database

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Better Auth | 1.6.x | Authentication | Official Svelte CLI addon (sv@0.12.0). Works with Drizzle. Supports email/password + social OAuth. OpenTelemetry tracing built-in as of 1.6. Replaces Auth.js which has harder extensibility for custom loyalty flows. |
| Drizzle ORM | 0.45.x | Database ORM | Type-safe SQL queries, ~7.4kb gzipped, zero dependencies. Schema-as-code with migration generation via drizzle-kit. Validators (drizzle-zod) now consolidated into main package. Perfect fit for Supabase PostgreSQL. |
| @supabase/ssr | 0.10.x | SSR auth helpers | Creates browser/server Supabase clients with cookie-based sessions. Required for SvelteKit server-side auth flows in hooks.server.ts. Replaces deprecated @supabase/auth-helpers-sveltekit. |

### Mobile / Native Plugins

| Plugin | Purpose | Why This One |
|--------|---------|--------------|
| @capacitor-mlkit/barcode-scanning | QR code scanning at cafe | Uses Google ML Kit for native camera QR scanning on iOS/Android. Works offline (no network needed). Higher accuracy than web-based alternatives. Has optional ready-to-use UI. |
| @capacitor/haptics | Tactile feedback on point earn/redeem | Official Capacitor plugin. Quick vibration on successful scan, point award, reward redemption. Small touch that makes the loyalty experience feel native. |
| @capacitor/preferences | Local key-value storage | Official plugin. Cache user preferences, last-visited state, offline loyalty data. Lightweight alternative to SQLite for simple data. |
| @capacitor/status-bar | Status bar styling | Official plugin. Match status bar color to brand palette. Note: some options deprecated on Android 16+ with Capacitor 8's edge-to-edge support. |
| @capacitor/splash-screen | App launch screen | Official plugin. Show Rule 257 branding during app initialization. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @sveltejs/enhanced-img | 0.10.x | Image optimization | Build-time optimization for gallery/portfolio images. Auto-generates avif/webp, sets intrinsic dimensions to prevent layout shift. Use for all local/static images. |
| svelte-qrcode | 2.x | QR code generation | Generate loyalty QR codes displayed in user's app profile for scanning at the counter. Zero dependencies. Svelte-native component. |
| @sveltejs/adapter-static | latest | Static build for Capacitor | Prerenders app as static files for Capacitor's local web server. Use bundleStrategy: 'single' to limit HTTP/1 connection issues on mobile. |
| @sveltejs/adapter-vercel | latest | Web deployment | Vercel deployment with ISR support. Auto-installs on Vercel. Use for the brand portfolio site. |
| drizzle-kit | latest | DB migrations | CLI companion for Drizzle. Generates SQL migration files from schema changes. Run during development, not in production. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vite | Dev server & bundler | Ships with SvelteKit. Configure server.host: '0.0.0.0' and port: 5173 for Capacitor live reload during mobile dev. |
| TypeScript | Type safety | SvelteKit scaffolds with TS by default. Drizzle and Better Auth provide full type inference. Non-negotiable for a multi-platform codebase. |
| supabase CLI | 2.84.x | Local dev | Run Supabase locally (Postgres, Auth, Storage) during development. Eliminates remote dependency and enables offline dev. |
| ESLint + Prettier | Code quality | SvelteKit scaffolds with both. svelte-eslint-parser for .svelte files. |
| Xcode 26+ | iOS builds | Required by Capacitor 8. SPM is the default package manager for new iOS projects. |
| Android Studio 2025.2.1+ | Android builds | Required by Capacitor 8. Target API 23+ minimum. |

## Installation

```bash
# Scaffold project
npx sv create rule257-nyc
# Select: SvelteKit, TypeScript, TailwindCSS v4, Better Auth, Drizzle

# Core runtime
npm install @supabase/supabase-js @supabase/ssr
npm install @capacitor/core @capacitor/cli

# Capacitor native platforms
npx cap init
npx cap add ios --packagemanager SPM
npx cap add android

# Capacitor plugins
npm install @capacitor/haptics @capacitor/preferences @capacitor/status-bar @capacitor/splash-screen
npm install @capacitor-mlkit/barcode-scanning

# Supporting libraries
npm install svelte-qrcode

# Dev dependencies
npm install -D @sveltejs/adapter-static @sveltejs/adapter-vercel
npm install -D @sveltejs/enhanced-img
npm install -D drizzle-kit supabase
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Supabase | Firebase | If you need Firestore's offline-first NoSQL model, Firebase Analytics integration, or are deeply invested in Google Cloud. Not recommended here -- relational data for loyalty is a better fit for PostgreSQL, and Firebase's per-operation billing is unpredictable with frequent point updates. |
| Better Auth | Auth.js (NextAuth) | If you need broad OAuth provider coverage with minimal config. Not recommended here -- harder to extend for custom loyalty flows, and Better Auth is now the official Svelte CLI addon. |
| Drizzle ORM | Prisma | If you prefer a more opinionated ORM with a GUI (Prisma Studio). Not recommended here -- Prisma's generated client is heavier, and Drizzle's SQL-like API with zero deps is better for a lightweight project. |
| TailwindCSS v4 | UnoCSS | If you need extreme customization of the utility engine. Not recommended here -- Tailwind v4's CSS-first config and ecosystem (Tailwind Plus components) are more mature. |
| @capacitor-mlkit/barcode-scanning | html5-qrcode | If you need web-only QR scanning without native plugins. Use html5-qrcode as a fallback for the web version of the site, but prefer ML Kit for native apps -- higher accuracy, offline, native camera integration. |
| Capacitor | React Native | If the app had complex native UI requirements beyond a loyalty wrapper. Not recommended here -- Capacitor lets you share the exact SvelteKit codebase, while React Native would require a separate React app. |
| svelte-qrcode | qrcode (npm) | If you need programmatic QR generation in server-side contexts. svelte-qrcode is better for component-based rendering in the Svelte UI. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| CocoaPods for new iOS setup | Entering maintenance mode; specs repo goes read-only Dec 2, 2026. Capacitor 8 defaults to SPM. | Swift Package Manager (SPM) via --packagemanager SPM flag |
| @supabase/auth-helpers-sveltekit | Deprecated. Replaced by @supabase/ssr which works across all frameworks. | @supabase/ssr |
| Svelte 4 syntax (stores, $:) | Svelte 5 Runes ($state, $derived, $effect) are the current API. Stores still work but are legacy. Mixing paradigms creates confusion in a new project. | Svelte 5 Runes exclusively |
| Ionic Framework UI components | Adds unnecessary weight and an opinionated design system that conflicts with Rule 257's custom minimal aesthetic. Capacitor works without Ionic. | Custom Svelte components with TailwindCSS |
| Firebase Auth | Vendor lock-in to Google, harder to self-host if needed, less control over user data for a loyalty system. | Better Auth (self-hosted, database-backed) |
| GSAP or heavy animation libraries | Overkill for portfolio transitions. Svelte has built-in transitions (fade, slide, fly, scale) and motion stores (tweened, spring). | Svelte built-in transitions and motion |
| SPA mode for the website | Kills SEO for the portfolio/brand site. Google needs to crawl event pages, menu, location info. | SSR via adapter-vercel for web; adapter-static only for Capacitor builds |

## Stack Patterns by Variant

**Web (brand portfolio site):**
- Use `@sveltejs/adapter-vercel` for deployment
- SSR enabled for SEO (events, menu, location pages)
- Supabase client via `@supabase/ssr` in hooks.server.ts
- Enhanced-img for gallery image optimization at build time

**Mobile (loyalty app):**
- Use `@sveltejs/adapter-static` for Capacitor build
- Set `bundleStrategy: 'single'` in svelte.config.js for mobile
- Capacitor ML Kit for native QR scanning
- Haptics plugin for tactile feedback on point earn/redeem
- Preferences plugin for offline caching of loyalty state

**Shared:**
- Same Svelte components, same Tailwind styles
- Feature-flag native-only features with `Capacitor.isNativePlatform()`
- Shared Supabase client logic, Drizzle schema, Better Auth config

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Svelte 5.53.x | SvelteKit 2.55.x | Always use matching major versions. SvelteKit 2.x requires Svelte 5.x. |
| Capacitor 8.3.x | Node 22+ | Capacitor 8 dropped Node 18/20 support. Verify your CI/CD uses Node 22+. |
| Capacitor 8.3.x | iOS 15+, Android API 23+ | Minimum deployment targets. Xcode 26+ required for builds. |
| Better Auth 1.6.x | SvelteKit 2.20+ | Requires getRequestEvent() which landed in SvelteKit 2.20.0. |
| Drizzle 0.45.x | @supabase/supabase-js 2.x | Drizzle connects directly to Supabase's PostgreSQL. Use Drizzle for schema/migrations, Supabase client for auth and realtime. |
| TailwindCSS 4.2.x | Vite 6+ | v4 requires Vite's CSS pipeline. SvelteKit ships with Vite, so this is automatic. |
| @sveltejs/enhanced-img 0.10.x | Vite 6+, SvelteKit 2.x | Peer dependency on SvelteKit. Works at build time only -- not for dynamic/external images. |

## Sources

- [SvelteKit Releases](https://github.com/sveltejs/kit/releases) -- SvelteKit 2.55.0 confirmed (HIGH confidence)
- [Svelte Releases](https://github.com/sveltejs/svelte/releases) -- Svelte 5.53.x confirmed (HIGH confidence)
- [Capacitor 8 Announcement](https://ionic.io/blog/announcing-capacitor-8) -- Capacitor 8.3.0, SPM default, Node 22+ (HIGH confidence)
- [Capacitor 8 Update Guide](https://capacitorjs.com/docs/updating/8-0) -- iOS 15+, Xcode 26+, Android API 23+ (HIGH confidence)
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) -- v2.102.1 confirmed (HIGH confidence)
- [@supabase/ssr npm](https://www.npmjs.com/package/@supabase/ssr) -- v0.10.0 confirmed (HIGH confidence)
- [Better Auth npm](https://www.npmjs.com/package/better-auth) -- v1.6.0 confirmed (HIGH confidence)
- [Better Auth SvelteKit Docs](https://better-auth.com/docs/integrations/svelte-kit) -- Official Svelte CLI addon (HIGH confidence)
- [Svelte CLI Better Auth](https://svelte.dev/docs/cli/better-auth) -- sv@0.12.0 integration (HIGH confidence)
- [Drizzle ORM npm](https://www.npmjs.com/package/drizzle-orm) -- v0.45.2 confirmed (HIGH confidence)
- [TailwindCSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) -- v4.2.2 confirmed (HIGH confidence)
- [@sveltejs/enhanced-img npm](https://www.npmjs.com/package/@sveltejs/enhanced-img) -- v0.10.4 confirmed (HIGH confidence)
- [Capacitor ML Kit Barcode](https://capawesome.io/plugins/mlkit/barcode-scanning/) -- Native QR scanning plugin (MEDIUM confidence -- verify SPM compat with Capacitor 8)
- [Supabase SvelteKit SSR Docs](https://supabase.com/docs/guides/auth/server-side/sveltekit) -- Official SSR setup guide (HIGH confidence)
- [CocoaPods Maintenance Mode](https://capgo.app/blog/ios-spm-vs-cocoapods-capacitor-migration-guide/) -- Specs repo read-only Dec 2, 2026 (MEDIUM confidence)

---
*Stack research for: Rule 257 NYC -- Creative cafe brand/portfolio site + loyalty mobile app*
*Researched: 2026-04-09*
