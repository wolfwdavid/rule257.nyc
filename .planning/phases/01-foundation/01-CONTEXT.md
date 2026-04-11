# Phase 1: Foundation - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

SvelteKit + Capacitor project infrastructure: dual-adapter build config, database schema migrated via Drizzle, Better Auth working end-to-end, design system tokens established, mobile-responsive layout shell. Delivers requirement BRAND-06. Phase 1 ends with a bare "Coming Soon" home page — Phase 2 builds out the real brand content.

</domain>

<decisions>
## Implementation Decisions

### Design Tokens — Color Palette
- **D-01:** Pure black and white palette only. No accent color.
- **D-02:** Photography and art on the walls carries all color. The UI is a neutral frame for content.
- **D-03:** Reference: fashion runway showroom aesthetic — white-dominant, gallery-like, intentional.
- **D-04:** Tokens must be defined as CSS variables in TailwindCSS v4 CSS-first config so Phase 5 (dark mode) can invert them cleanly.

### Design Tokens — Typography
- **D-05:** Serif for headings (editorial, magazine feel).
- **D-06:** Sans-serif for body copy.
- **D-07:** Reference aesthetic: Kinfolk, Cereal magazine. Editorial, curated, art-meets-coffee vibe.
- **D-08:** Font loading must be optimized (subset, preload, fallback) — type is the brand.

### Design Tokens — Spacing & Density
- **D-09:** Generous white space. Scroll-heavy, luxurious, every element breathes.
- **D-10:** Reference: Kinfolk, Aesop — curated and sparse, not information-dense.
- **D-11:** Spacing scale should support large section gaps (not just component-level padding).

### Site Shell — Desktop Navigation
- **D-12:** Minimal top bar: logo left, text links right.
- **D-13:** Subtle scroll behavior (shrink or fade, not disappear entirely).
- **D-14:** Thin, unobtrusive — does not compete with content.

### Site Shell — Mobile Navigation
- **D-15:** Hamburger menu for both web and native Capacitor app.
- **D-16:** No bottom tab bar — even in Phase 4 native apps, hamburger is the pattern.
- **D-17:** Rationale: simpler to maintain one pattern across web + native, matches clean editorial aesthetic. Phase 4 loyalty features live inside the menu, not a persistent tab bar.

### Site Shell — Footer
- **D-18:** Rich editorial footer.
- **D-19:** Must accommodate (in Phase 2): address, hours, phone, Google Maps embed, social links, site nav columns, tagline/manifesto copy.
- **D-20:** Phase 1 renders the footer structure with placeholder content — Phase 2 fills it.

### Site Shell — Phase 1 Home Page
- **D-21:** Minimal "Coming Soon" placeholder: logo, tagline, one hero image. Nothing more.
- **D-22:** Phase 2 replaces this with the real brand portfolio content.
- **D-23:** The placeholder must still demonstrate design tokens (typography, spacing, layout shell) so the design system is verifiable at end of Phase 1.

### Auth — Sign-In Method
- **D-24:** Magic link (passwordless) only. No email+password. No social OAuth in Phase 1.
- **D-25:** Magic link unifies signup and login — one email field, system creates account if new or logs in if known.
- **D-26:** Rationale: lowest friction, no password management, matches clean editorial brand. Apple Sign-in requirement (App Store) is deferred — it only applies if other social logins are present, which they are not.

### Auth — Email Provider
- **D-27:** Resend for transactional email.
- **D-28:** Free tier (3,000/mo) covers early validation.
- **D-29:** React Email templates for magic link emails. Must match brand typography (serif headings, sans body).

### Auth — Presentation
- **D-30:** Modal overlay (not a dedicated `/login` page).
- **D-31:** Triggered from a CTA button in the top nav or mid-page.
- **D-32:** Single email input field, submit → "check your email" confirmation state.
- **D-33:** Preserves browse context — closing modal returns user to where they were.

### Auth — Post-Login Landing
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

</decisions>

<specifics>
## Specific Ideas

- "White walls looks like a fashion runway showroom" — dominant visual reference
- Kinfolk, Cereal magazine — editorial typography and density reference
- Aesop — generous white space and luxurious pacing reference
- No accent color is intentional — photography/art on the walls does the work
- Magic link keeps the experience as clean as the visual design

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tech stack and versions
- `Websites/rule257.nyc/CLAUDE.md` — Full recommended stack: Svelte 5.53, SvelteKit 2.55, Capacitor 8.3, Supabase 2.102, TailwindCSS 4.2, Better Auth 1.6, Drizzle 0.45. Version compatibility matrix. What NOT to use.
- `Websites/rule257.nyc/.planning/research/STACK.md` — Research-level stack rationale and alternatives
- `Websites/rule257.nyc/.planning/research/ARCHITECTURE.md` — System architecture for dual-target web + native
- `Websites/rule257.nyc/.planning/research/PITFALLS.md` — Known gotchas for SvelteKit + Capacitor + Supabase combo
- `Websites/rule257.nyc/.planning/research/FEATURES.md` — Feature-level capability breakdown
- `Websites/rule257.nyc/.planning/research/SUMMARY.md` — Research synthesis

### Project-level
- `Websites/rule257.nyc/.planning/PROJECT.md` — Core value, constraints, key decisions
- `Websites/rule257.nyc/.planning/REQUIREMENTS.md` — BRAND-06 (mobile-responsive) is the only Phase 1 requirement
- `Websites/rule257.nyc/.planning/ROADMAP.md` §"Phase 1: Foundation" — Goal and success criteria

### Phase 1 success criteria (from ROADMAP.md)
1. SvelteKit builds with both `adapter-vercel` (SSR) and `adapter-static` (Capacitor) via `BUILD_TARGET` env var
2. Mobile-responsive layout on any device width with safe area handling
3. Supabase local dev running with Drizzle schema migrated (profiles, point_transactions, rewards, redemptions, scan_tokens)
4. Test user can sign up and log in via Better Auth on web

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. Only `.planning/` and `CLAUDE.md` exist.

### Established Patterns
- None yet — Phase 1 establishes the first patterns.

### Integration Points
- None — first phase.

### Scaffolding Note
- Project must be created from scratch using Svelte CLI: `npx sv create` with SvelteKit + TypeScript + TailwindCSS v4 + Better Auth + Drizzle selections
- Supabase CLI required for local dev (`supabase init`, `supabase start`)
- Capacitor must be added after SvelteKit is working: `npm i @capacitor/core @capacitor/cli && npx cap init`
- Xcode 26+ and Android Studio 2025.2.1+ required for Phase 4 builds — Phase 1 only needs them if verifying `adapter-static` wrapper works

</code_context>

<deferred>
## Deferred Ideas

- **Apple Sign-in / Google OAuth** — Not in Phase 1. Revisit if user friction data shows magic link is too slow. Apple is mandatory only if other social logins are added.
- **Bottom tab bar for native app** — Rejected for Phase 1 and Phase 4. If mobile UX feedback demands it later, reconsider as a dedicated polish phase.
- **Dark mode token inversion** — Phase 5 (POLISH-01). Phase 1 defines tokens as CSS variables so Phase 5 can invert cleanly without refactor.
- **Accent color** — Explicitly rejected. If brand evolves and wants an accent, add later — do not pre-bake one "just in case".
- **Real home page content** — Phase 2 (BRAND-01 hero, BRAND-04 menu cards, etc.). Phase 1 stops at "Coming Soon".
- **Real `/account` dashboard** — Phase 3 (LOYAL-01 through LOYAL-09). Phase 1 stops at a stub.
- **Reward economics model** (points-per-dollar vs. buy-8-get-1-free) — Deferred to Phase 3 per STATE.md. Phase 1 schema must stay flexible.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-10*
