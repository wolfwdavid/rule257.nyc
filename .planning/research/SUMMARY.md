# Project Research Summary

**Project:** Rule 257 NYC
**Domain:** Creative cafe brand/portfolio website + loyalty mobile app (art/fashion/coffee convergence)
**Researched:** 2026-04-09
**Confidence:** HIGH

## Executive Summary

Rule 257 is a dual-product build: a brand portfolio website for an NYC art-cafe that blends coffee, fashion, and design culture, and a native loyalty mobile app that rewards repeat visits via QR code point scanning. The right way to build this is a single SvelteKit codebase with two deployment targets -- the web version deployed via Vercel with SSR for SEO, and a mobile version wrapped in a Capacitor native shell using a static adapter. This approach keeps the UI, design system, auth logic, and database schema unified, while allowing native device features (ML Kit barcode scanning, haptic feedback, Capacitor Preferences) to be gated cleanly with Capacitor.isNativePlatform(). Supabase provides the backend (PostgreSQL + Auth + Storage + Realtime) and is the right choice over Firebase because the loyalty data model is deeply relational and point operations must be atomic.

The recommended stack -- Svelte 5 Runes, SvelteKit 2.55, Capacitor 8 with SPM, Supabase, TailwindCSS v4, Better Auth, and Drizzle ORM -- is well-validated with all specific versions confirmed from official sources. The feature research is clear: the brand site is table stakes (hero, gallery, menu teaser, events, location) with editorial lookbook content as the primary differentiator against NYC indie cafe competitors. The loyalty app is the true product bet -- 79% of daily coffee drinkers say loyalty programs influence their choice of venue, and no indie NYC cafe competitor currently has a native loyalty app.

The critical risks fall into three categories: (1) architectural traps that surface only at build time -- SvelteKit API routes disappearing in the static Capacitor build, and auth state mismatch between SSR cookies and WebView; (2) security vulnerabilities in the loyalty system -- QR code replay attacks without single-use tokens; and (3) distribution risk -- Apple App Store Guideline 4.2 rejection for apps indistinguishable from mobile websites. All three are entirely preventable with the patterns documented in the architecture research, but all three require deliberate attention from day one.

## Key Findings

### Recommended Stack

The stack is modern, tightly integrated, and confirmed at specific versions. SvelteKit with dual adapters is the right architecture for a single-codebase web+mobile build. Capacitor 8 requires Swift Package Manager (not CocoaPods) for iOS -- this is a hard constraint, not a preference. Node 22+ is required; CI/CD must enforce this. The auth layer is the most complex integration: Better Auth handles the SvelteKit side via the official Svelte CLI addon, @supabase/ssr handles cookie-based server-side sessions for web, and a separate Supabase client using Capacitor Preferences handles token persistence in the native app.

**Core technologies:**
- **Svelte 5 / SvelteKit 2.55**: UI and full-stack framework -- smallest bundle size, built-in transitions, SSR + static dual output
- **Capacitor 8 (SPM)**: Native iOS/Android shell -- wraps SvelteKit static build, unlocks ML Kit and haptics
- **Supabase**: PostgreSQL + Auth + Storage + Realtime -- relational loyalty data, RLS for security, realtime for point balance sync
- **TailwindCSS v4**: Styling -- CSS-first (no config file), 5x faster builds, maps to Rule 257 minimal aesthetic
- **Better Auth 1.6**: Authentication -- official Svelte addon, extensible for custom loyalty flows
- **Drizzle ORM 0.45**: Database layer -- type-safe, zero-dependency, schema-as-code with migrations
- **@capacitor-mlkit/barcode-scanning**: QR scanning -- native ML Kit camera, offline, higher accuracy than web fallbacks
- **@sveltejs/enhanced-img**: Gallery optimization -- build-time avif/webp generation, prevents layout shift

### Expected Features

The feature set divides cleanly into two phases: brand site first (low-to-medium complexity, directly visible to visitors), loyalty app second (the core value proposition, dependency-chained). The hidden dependency in the loyalty system is the staff admin interface -- QR codes need to be generated and validated by someone on the cafe side. This is easy to forget in early planning and breaks the loyalty loop if absent.

**Must have (table stakes):**
- Hero section with strong visual identity -- every comparable cafe site leads with this; absence signals amateur
- Location, hours, contact with Schema.org markup -- answers 90%+ of cafe site visit intent
- Menu teaser with signature items and photography -- atmosphere over exhaustive listing
- Photo gallery of the space -- lets visitors feel the vibe before walking in
- Events section (upcoming + archive) -- shows the space is alive
- Mobile-responsive design -- 70%+ of cafe traffic is mobile
- User accounts (email + social login) -- foundation for all loyalty features
- Points-per-purchase tracking with real-time balance -- core loyalty value proposition
- QR code scanning (native ML Kit + web fallback) -- the counter interaction
- Staff admin interface -- the other side of QR scanning; often-overlooked dependency
- Rewards catalog with redemption flow -- the payoff that makes points meaningful
- Haptic feedback on successful scan -- one plugin call, premium feel

**Should have (competitive differentiators):**
- Editorial lookbook content -- Rule 257 killer differentiator; no indie NYC competitor does this well
- Artist collaboration profiles -- gallery-cafe hybrid positioning
- Apple/Google Wallet loyalty pass -- removes app install friction; no NYC indie competitor offers this
- Scroll-driven animations and micro-interactions -- elevates from functional to premium
- Curated atmosphere playlist links -- brand extension beyond physical space (low effort)
- Dark mode toggle -- signals polish; standard expectation for apps in 2026

**Defer (v2+):**
- Push notifications -- defer until loyalty engagement is proven; users increasingly decline
- POS integration -- POS system undecided; QR-based standalone works for v1
- Tiered loyalty status -- only warranted if user base reaches scale
- Online ordering -- explicitly out of scope; commoditizes the walk-in experience
- Full CMS -- static content in SvelteKit routes is simpler and version-controlled

### Architecture Approach

The architecture is a single SvelteKit repo with three route groups: (site)/ for brand portfolio pages, (app)/ for loyalty features, and (admin)/ for staff-facing tools. The two builds diverge at the adapter level -- adapter-vercel for SSR web, adapter-static for Capacitor mobile -- controlled by a BUILD_TARGET environment variable. All loyalty transactions must use Supabase PostgreSQL RPC functions (not client-side multi-step updates) to prevent race conditions and client-side tampering. Supabase Realtime drives live point balance updates. Auth diverges by platform: web uses cookie-based sessions via @supabase/ssr, native uses token-based sessions stored in Capacitor Preferences.

**Major components:**
1. src/routes/(site)/ -- Brand portfolio: gallery, menu, events, artists, location; Supabase Storage + DB
2. src/routes/(app)/ -- Loyalty app: dashboard, scan, rewards, profile; calls Supabase directly (no server in static build)
3. src/routes/(admin)/ -- Staff tools: QR generation, transaction confirmation, reward management; RLS-enforced admin role
4. src/lib/db/ -- Drizzle ORM schema for profiles, point_transactions, rewards, redemptions, scan_tokens
5. ios/ + android/ -- Capacitor native shells wrapping the static build

### Critical Pitfalls

1. **SvelteKit API routes do not exist in Capacitor static builds** -- Use universal +page.ts load functions (not +page.server.ts) in (app)/ routes; route all mobile data through direct Supabase calls; test adapter-static in week one
2. **QR code replay attacks collapse loyalty economics** -- Each QR must encode a single-use cryptographically random token; the earn_points() PostgreSQL RPC function atomically validates, awards, and invalidates in one transaction
3. **Auth state mismatch between web SSR and Capacitor** -- Two distinct Supabase client initialization paths required; gate with Capacitor.isNativePlatform(); test auth on real devices early, not just browser
4. **Apple App Store Guideline 4.2 rejection** -- App must lead with native-feeling loyalty features (ML Kit QR scanning, haptics, tab bar navigation, offline mode); loyalty features are the justification for a native app
5. **CocoaPods on Capacitor 8** -- Always use npx cap add ios --packagemanager SPM; CocoaPods specs repo goes read-only December 2026

## Implications for Roadmap

Based on combined research, a 5-phase structure is recommended. The dependency chain is clear: foundation before brand site before loyalty core before native Capacitor build. Brand site and loyalty backend can have parallel workstreams once foundation is complete, but loyalty core must be fully web-functional before Capacitor wrapping.

### Phase 1: Foundation and Scaffolding

**Rationale:** Dual-adapter config, route group architecture, and database schema are decisions expensive to reverse. All downstream phases depend on these being correct.
**Delivers:** SvelteKit project with both adapters configured, TailwindCSS v4 design tokens, Drizzle schema for all tables, Better Auth integrated, Supabase local dev running, Capacitor initialized with SPM.
**Addresses:** Mobile-responsive design foundation, TypeScript throughout
**Avoids:** CocoaPods pitfall (SPM flag from day one), TailwindCSS v4 confusion (no config file), Node version mismatch (.nvmrc + engines field), safe area issues (viewport-fit=cover + env() CSS from day one)
**Research flag:** Standard patterns -- skip phase research

### Phase 2: Brand Portfolio Website

**Rationale:** Brand site has zero dependencies on loyalty system, is all P1 priority, establishes visual components (gallery, image optimization) reused by editorial/artist features, and proves the SSR/Vercel deployment pipeline before complexity multiplies.
**Delivers:** Fully deployed brand site on Vercel: hero, gallery, menu teaser, events section, location/hours/contact with Schema.org markup, social links, animated page transitions.
**Uses:** adapter-vercel, @sveltejs/enhanced-img, Supabase Storage for images, Svelte built-in transitions
**Implements:** (site)/ route group with brand layout; SSR data fetching pattern established
**Avoids:** Image gallery performance issues (enhanced-img, lazy loading, limit to 12-16 images initially), Instagram API deprecation (static curation, not live API)
**Research flag:** Standard patterns -- skip phase research

### Phase 3: Loyalty Core (Web-First)

**Rationale:** Loyalty is the primary product bet and most complex phase. Build and validate on web before Capacitor wrapping. Staff admin interface must be built in parallel -- it is a hard dependency for the scan flow that is easy to overlook.
**Delivers:** Full loyalty system on web: user registration/login, QR code display in user profile, staff admin QR generation, earn_points() RPC with single-use token validation, real-time point balance via Supabase Realtime, rewards catalog, redemption flow.
**Uses:** Better Auth, @supabase/ssr (web), Drizzle schema, Supabase RPC, Supabase Realtime, svelte-qrcode
**Implements:** (app)/ and (admin)/ route groups; auth divergence pattern; atomic RPC pattern; Realtime subscription
**Avoids:** QR replay attacks (single-use tokens from start), auth mismatch (platform-aware client), API routes in static build (universal load functions only), RLS gaps (policies before application code), reward economics bleed (model economics before building)
**Research flag:** Needs phase research -- Supabase RPC atomic transaction patterns, RLS policy design, single-use token anti-replay security

### Phase 4: Native Capacitor Mobile App

**Rationale:** With loyalty proven on web, wrap in Capacitor to unlock native features that justify App Store presence and prevent Guideline 4.2 rejection. Native QR scanning and haptics make the app distinctly better than mobile web.
**Delivers:** iOS and Android apps with native ML Kit QR scanning, haptic feedback on point earn, Capacitor Preferences session persistence, tab bar navigation, splash screen and app icon with Rule 257 branding, mobile auth via token-based Supabase client.
**Uses:** @capacitor-mlkit/barcode-scanning, @capacitor/haptics, @capacitor/preferences, @capacitor/status-bar, @capacitor/splash-screen, adapter-static with bundleStrategy: single
**Implements:** Platform-aware feature gating; native auth path; adapter switching via BUILD_TARGET env var
**Avoids:** App Store 4.2 rejection (native features justify app), CocoaPods (SPM enforced in Phase 1), live reload IP binding (server.host: 0.0.0.0 in dev), prod Capacitor config with server.url left in
**Research flag:** Needs phase research -- @capacitor-mlkit/barcode-scanning SPM compatibility with Capacitor 8 is MEDIUM confidence; verify before committing

### Phase 5: Polish and v1.x Enhancements

**Rationale:** After core loyalty loop is live and engagement data is accumulating, layer on differentiating features that elevate Rule 257 from functional to brand-defining. Only build after loyalty shows traction.
**Delivers:** Editorial lookbook pages, artist collaboration profiles, Apple/Google Wallet loyalty pass, scroll-driven animations, dark mode toggle, curated playlist links, neighborhood storytelling content.
**Uses:** @jackobo/capacitor-pass-to-wallet, Intersection Observer API, CSS custom properties for theming
**Implements:** Enhanced editorial routes within (site)/; wallet pass generation backend
**Avoids:** Over-engineering before core is validated; premature push notification infrastructure
**Research flag:** Needs phase research -- Apple PassKit backend requirements and @jackobo/capacitor-pass-to-wallet Capacitor 8 compatibility need validation

### Phase Ordering Rationale

- Foundation first: dual-adapter config and route group architecture are expensive to reverse; wrong adapter setup causes rewrite-level rework
- Brand site before loyalty: brand site is independent, P1 priority, establishes shared image infrastructure, and proves deployment pipeline before complexity multiplies
- Loyalty on web before Capacitor: validates full earn/redeem loop without native build complexity; if loyalty economics are wrong, better to discover before App Store submission
- Capacitor in Phase 4: depends on loyalty being proven; Apple Review requires native features to justify App Store presence
- Polish in Phase 5: editorial lookbook and wallet pass require brand + loyalty infrastructure to exist, and should only be built once loyalty shows traction

### Research Flags

Phases needing deeper research during planning:
- **Phase 3 (Loyalty Core):** Supabase RPC atomic transaction patterns, single-use QR token anti-replay security, RLS policy design for loyalty tables
- **Phase 4 (Capacitor):** @capacitor-mlkit/barcode-scanning SPM compatibility with Capacitor 8 (currently MEDIUM confidence)
- **Phase 5 (Polish):** @jackobo/capacitor-pass-to-wallet Capacitor 8 compatibility; Apple PassKit backend requirements

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** SvelteKit scaffolding, TailwindCSS v4, Drizzle -- all well-documented with official guides
- **Phase 2 (Brand Site):** SvelteKit SSR, Vercel deployment, enhanced-img -- textbook patterns with extensive official docs

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions confirmed from official sources. One MEDIUM gap: @capacitor-mlkit/barcode-scanning SPM compatibility with Capacitor 8 needs direct verification. |
| Features | HIGH | Grounded in competitor analysis (Cafe Kitsune, Chinatown Soup, Happy Medium) and multiple 2026 loyalty program industry reports. Anti-features well-reasoned from PROJECT.md constraints. |
| Architecture | HIGH | All patterns sourced from official SvelteKit, Supabase, and Capacitor documentation. SQL schema well-designed. Auth divergence pattern documented in official Supabase SSR guides. |
| Pitfalls | HIGH | Critical pitfalls grounded in official documentation or confirmed behaviors. One MEDIUM: CocoaPods read-only date from secondary source, not official announcement. |

**Overall confidence:** HIGH

### Gaps to Address

- **@capacitor-mlkit/barcode-scanning SPM compat**: Verify with Capacitor 8 on a real device before Phase 4 planning; fallback is html5-qrcode which weakens the native app story
- **Instagram embed approach**: Static manual curation recommended for v1; evaluate Instagram oEmbed API for individual post embeds during Phase 2 planning if live feed is desired
- **Reward economics model**: Must be decided in requirements before Phase 3 implementation -- buy-8-get-1-free vs points-per-dollar affects schema design and is a business decision
- **Staff admin QR workflow**: Does staff generate QR per transaction, or does customer show their static QR? This decision affects scan flow architecture and must be defined in requirements
- **@jackobo/capacitor-pass-to-wallet Capacitor 8 status**: Not validated; Phase 5 planning must verify before committing to wallet pass feature

## Sources

### Primary (HIGH confidence)
- [SvelteKit Releases](https://github.com/sveltejs/kit/releases) -- SvelteKit 2.55.0 version confirmation
- [Svelte Releases](https://github.com/sveltejs/svelte/releases) -- Svelte 5.53.x version confirmation
- [Capacitor 8 Announcement](https://ionic.io/blog/announcing-capacitor-8) -- SPM default, Node 22+, iOS 15+
- [Capacitor 8 Update Guide](https://capacitorjs.com/docs/updating/8-0) -- Xcode 26+, Android API 23+
- [@supabase/supabase-js npm](https://www.npmjs.com/package/@supabase/supabase-js) -- v2.102.1
- [@supabase/ssr npm](https://www.npmjs.com/package/@supabase/ssr) -- v0.10.0
- [Better Auth npm](https://www.npmjs.com/package/better-auth) -- v1.6.0, official Svelte CLI addon
- [Drizzle ORM npm](https://www.npmjs.com/package/drizzle-orm) -- v0.45.2
- [TailwindCSS v4 Release](https://tailwindcss.com/blog/tailwindcss-v4) -- v4.2.2, CSS-first config
- [Supabase RLS docs](https://supabase.com/docs/guides/auth/row-level-security) -- RLS configuration
- [Supabase RPC docs](https://supabase.com/docs/reference/javascript/rpc) -- atomic function pattern
- [Supabase SSR Auth for SvelteKit](https://supabase.com/docs/guides/auth/server-side/sveltekit) -- SSR auth setup
- [Apple App Store Guidelines 4.2](https://developer.apple.com/app-store/review/guidelines/) -- WebView minimum functionality
- [SvelteKit Route Groups](https://svelte.dev/docs/kit/routing) -- (site)/(app)/(admin) pattern
- [SvelteKit adapter-static docs](https://svelte.dev/docs/kit/adapter-static) -- no server routes in static build
- [Starbucks Loyalty 2026](https://about.starbucks.com/press/2026/starbucks-unveils-reimagined-loyalty-program) -- loyalty feature benchmarks
- [Chinatown Soup](https://www.chinatownsoup.nyc/) -- NYC competitor analysis
- [Cafe Kitsune](https://maisonkitsune.com/mk/cafe-kitsune-3-2/) -- brand and editorial differentiator analysis

### Secondary (MEDIUM confidence)
- [CocoaPods read-only Dec 2026](https://capgo.app/blog/ios-spm-vs-cocoapods-capacitor-migration-guide/) -- SPM migration urgency
- [@capacitor-mlkit/barcode-scanning](https://capawesome.io/plugins/mlkit/barcode-scanning/) -- SPM compat with Capacitor 8 needs direct verification
- [Web Design Trends 2026 Figma](https://www.figma.com/resource-library/web-design-trends/) -- scroll animations, parallax
- [@jackobo/capacitor-pass-to-wallet npm](https://www.npmjs.com/package/@jackobo/capacitor-pass-to-wallet) -- Capacitor 8 compatibility unverified

### Tertiary (Informational)
- [CoffeeCloud Loyalty Programs 2026](https://coffeecloud.com/blog/best-loyalty-programs-for-coffee-shops) -- loyalty feature benchmarks
- [OpenLoyalty Coffee Examples](https://www.openloyalty.io/insider/coffee-loyalty-programs-successful-examples) -- QR scanning patterns
- [SimpleLoyalty Must-Have Features](https://blog.simpleloyalty.com/best-restaurant-loyalty-app-features/) -- loyalty UX standards

---
*Research completed: 2026-04-09*
*Ready for roadmap: yes*
