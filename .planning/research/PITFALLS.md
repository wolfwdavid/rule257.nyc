# Domain Pitfalls

**Domain:** Creative cafe brand/portfolio website + loyalty mobile app
**Researched:** 2026-04-09
**Confidence:** HIGH

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: SvelteKit API Routes in Capacitor Static Builds

**What goes wrong:** Developer creates `/api/points`, `/api/rewards` server routes in SvelteKit, tests in dev mode (works fine), then builds with adapter-static for Capacitor. All API routes return 404 because static builds have no server.
**Why it happens:** SvelteKit dev server runs all routes regardless of adapter. The mismatch only surfaces at build time.
**Consequences:** Entire loyalty backend unreachable from mobile app. Requires architectural rework.
**Prevention:** Mobile data access goes through `@supabase/supabase-js` directly (client-side). Server routes (`+page.server.ts`, `+server.ts`) are only for the web SSR build. Use route groups to enforce: `(app)/` routes use `+page.ts` load functions (universal), not `+page.server.ts` (server-only).
**Detection:** Build with adapter-static early. Run `npx cap sync && npx cap open ios` in week one.

### Pitfall 2: QR Code Replay Attacks on Loyalty Points

**What goes wrong:** QR codes for earning points are reusable. Customer screenshots a QR code and scans it multiple times, or shares it.
**Why it happens:** Developer generates static QR codes instead of single-use tokens with server-side validation.
**Consequences:** Point inflation. Loyalty program economics collapse.
**Prevention:** Each QR encodes a unique, cryptographically random token stored in the database with a `used` flag and 5-minute expiry. The `earn_points()` PostgreSQL function atomically validates, awards, and invalidates in one transaction.
**Detection:** Monitor points-per-user distribution. Flag accounts earning faster than physically possible.

### Pitfall 3: CocoaPods in a Capacitor 8 Project

**What goes wrong:** Developer initializes iOS without `--packagemanager SPM` flag, gets CocoaPods setup. CocoaPods specs repo goes read-only December 2, 2026.
**Why it happens:** Muscle memory from Capacitor 7. Tutorials haven't updated for Capacitor 8 defaults.
**Consequences:** Stuck on a dying dependency manager. Can't mix SPM and CocoaPods. Migration requires deleting ios/ and recreating.
**Prevention:** Always `npx cap add ios --packagemanager SPM`. Verify all plugins support SPM (all official Ionic plugins do).
**Detection:** Check for `ios/App/Podfile`. If it exists, you're on CocoaPods. SPM has `Package.swift`.

### Pitfall 4: Auth State Mismatch Between Web and Mobile

**What goes wrong:** Auth works in web SSR (cookies via @supabase/ssr) but fails in Capacitor because WebView doesn't share browser cookie storage.
**Why it happens:** `createServerClient` expects HTTP request/response objects that don't exist in a static build.
**Consequences:** Users can't log in on mobile, or auth state lost between app restarts.
**Prevention:** Two Supabase client paths: Web uses `@supabase/ssr` with `createServerClient` in hooks.server.ts. Mobile uses `@supabase/supabase-js` with `createClient` using Capacitor Preferences for session persistence. Gate with `Capacitor.isNativePlatform()`.
**Detection:** Test auth on actual devices/simulators early, not just browser.

### Pitfall 5: Apple App Store Rejection (Guideline 4.2)

**What goes wrong:** Apple rejects the iOS app under "Minimum Functionality" because it looks like a website in a WebView.
**Why it happens:** Capacitor apps ARE web apps in a WebView. A portfolio site with images is exactly what Apple considers "better suited for mobile web."
**Consequences:** Blocked from App Store. Development effort wasted until native features added.
**Prevention:** Mobile app leads with loyalty program (native-feeling functionality). Use native plugins: ML Kit camera for QR scanning, haptic feedback, Keychain biometric auth. Add offline capability. Use native navigation patterns (tab bar). The loyalty features ARE the justification for the native app.
**Detection:** Before submission, compare app screenshots vs. mobile Safari screenshots. If indistinguishable, Apple will reject.

## Moderate Pitfalls

### Pitfall 6: Image Gallery Performance on Mobile

**What goes wrong:** High-resolution gallery images cause jank, memory pressure, and slow scrolling on mobile devices. Capacitor WebView uses HTTP/1 which limits concurrent connections.
**Prevention:** Use `@sveltejs/enhanced-img` for build-time optimization. Lazy loading with intersection observer. Explicit `width`/`height` attributes. `bundleStrategy: 'single'` in svelte.config.js. Keep app binary under 50MB.

### Pitfall 7: Safe Area / Notch / Status Bar Issues

**What goes wrong:** Content renders behind iPhone notch, Dynamic Island, or Android navigation bar.
**Prevention:** Add `<meta name="viewport" content="viewport-fit=cover">` to app.html. Use `env(safe-area-inset-*)` CSS variables. Build a reusable `<SafeArea>` layout component. Test on real devices with notches. Capacitor 8's SystemBars plugin handles edge-to-edge automatically on Android but some Status Bar options no longer work on Android 16+.

### Pitfall 8: Instagram API Deprecation

**What goes wrong:** Instagram Basic Display API is dead. Developer integrates against deprecated endpoints. Feed breaks silently.
**Prevention:** Don't depend on live Instagram API for v1. Options: (1) Manual curation of best posts as static content. (2) Instagram oEmbed API for embedding specific posts. Recommend option 1 for v1.

### Pitfall 9: Supabase Row Level Security Gaps

**What goes wrong:** Forgot to enable RLS on transactions or user_profiles table. Any authenticated user can read/modify other users' point balances.
**Prevention:** Enable RLS on every table immediately after creation. Write policies before application code. Test with multiple user accounts. Supabase dashboard shows warning on tables without RLS.

### Pitfall 10: Node 22 Requirement for Capacitor 8

**What goes wrong:** Local dev on Node 20 works, but Capacitor 8 CLI commands fail with cryptic errors.
**Prevention:** Set `engines.node` in package.json to `">=22"`. Use `.nvmrc` with `22`. Ensure CI/CD uses Node 22.

### Pitfall 11: Reward Economics That Bleed Money

**What goes wrong:** Loyalty program rewards existing behavior rather than driving incremental visits. 37% of food/drink apps uninstalled within 30 days.
**Prevention:** Model economics before building. Keep it simple: "Buy 8, get 1 free" beats complex point math. Make first reward achievable in 3-5 visits. Build analytics tracking engagement from day one. Make reward thresholds server-configurable.

## Minor Pitfalls

### Pitfall 12: Svelte 5 Runes vs Legacy Stores

**What goes wrong:** Mixing Svelte 4 stores (`writable`, `$store`) with Svelte 5 Runes (`$state`, `$derived`).
**Prevention:** Runes exclusively. No `svelte/store` imports. Use `.svelte.ts` extension for rune-aware modules.

### Pitfall 13: TailwindCSS v4 Config Migration

**What goes wrong:** Following v3 tutorials, creating `tailwind.config.js` with content paths. In v4, this is wrong.
**Prevention:** No tailwind.config.js. CSS-first configuration via `@theme` blocks and custom properties. Content detection is automatic.

### Pitfall 14: Capacitor Live Reload IP Binding

**What goes wrong:** Live reload doesn't work because Vite binds to localhost.
**Prevention:** Set `server.host: '0.0.0.0'` in vite.config.ts. Set capacitor.config.ts `server.url` to machine's local IP. Remove server config before production builds.

### Pitfall 15: Missing App Store Assets

**What goes wrong:** Default Capacitor icon and splash screen ship with the app.
**Prevention:** Generate platform-specific assets early. Create `icon.png` (1024x1024) and `splash.png` (2732x2732). Configure in capacitor.config.ts. Include privacy manifest (PrivacyInfo.xcprivacy) for iOS.

### Pitfall 16: CORS on Mobile

**What goes wrong:** API calls fail from Capacitor because server doesn't allow `capacitor://localhost` (iOS) or `http://localhost` (Android) origins.
**Prevention:** Add both Capacitor origins to CORS allowed list. For Supabase, this is handled automatically, but custom server routes need explicit CORS headers.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Foundation (Phase 1) | TailwindCSS v4 config confusion | Follow v4 docs exclusively, no v3 tutorials |
| Foundation (Phase 1) | Node version mismatch | .nvmrc file, engines field in package.json |
| Foundation (Phase 1) | Safe area not configured | viewport-fit=cover + env() CSS from day one |
| Brand site (Phase 2) | Image performance | enhanced-img, lazy load, limit gallery to 12-16 images initially |
| Brand site (Phase 2) | Instagram API deprecation | Static curation, not live API |
| Loyalty core (Phase 3) | QR replay attacks | Single-use tokens from day one |
| Loyalty core (Phase 3) | Auth state mismatch | Platform-aware Supabase client initialization |
| Loyalty core (Phase 3) | API routes in static build | Universal load functions for (app)/ routes |
| Loyalty core (Phase 3) | RLS gaps | Policies before application code |
| Loyalty core (Phase 3) | Reward economics | Economic model before implementation |
| Capacitor (Phase 4) | CocoaPods instead of SPM | --packagemanager SPM flag |
| Capacitor (Phase 4) | App Store rejection 4.2 | Native plugins, offline mode, tab bar navigation |
| Capacitor (Phase 4) | Live reload IP binding | server.host: '0.0.0.0', correct IP in cap config |

## Sources

- [SvelteKit adapter-static docs](https://svelte.dev/docs/kit/adapter-static) -- No server routes in static (HIGH confidence)
- [Capacitor 8 Update Guide](https://capacitorjs.com/docs/updating/8-0) -- Node 22+, SPM, iOS 15+ (HIGH confidence)
- [Supabase RLS docs](https://supabase.com/docs/guides/auth/row-level-security) -- RLS configuration (HIGH confidence)
- [TailwindCSS v4 Migration](https://tailwindcss.com/docs/upgrade-guide) -- CSS-first config (HIGH confidence)
- [CocoaPods read-only Dec 2026](https://capgo.app/blog/ios-spm-vs-cocoapods-capacitor-migration-guide/) -- SPM migration (MEDIUM confidence)
- [Apple App Store 4.2 guidelines](https://developer.apple.com/app-store/review/guidelines/) -- WebView rejection risk (HIGH confidence)
- [Capacitor live reload](https://capacitorjs.com/docs/guides/live-reload) -- IP binding (MEDIUM confidence)

---
*Domain pitfalls for: Rule 257 NYC*
*Researched: 2026-04-09*
