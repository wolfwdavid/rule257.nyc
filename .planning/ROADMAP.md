# Roadmap: Rule 257 NYC

## Overview

This roadmap delivers Rule 257's digital presence in five phases: scaffolding the dual-target SvelteKit + Capacitor foundation, building the brand portfolio website that lets visitors feel the vibe before walking in, implementing the points-per-purchase loyalty system that drives repeat visits, wrapping loyalty features in native iOS/Android apps that justify App Store presence, and polishing with scroll animations, dark mode, and atmosphere playlists. Each phase delivers a coherent, verifiable capability and unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - SvelteKit + Capacitor scaffolding, dual-adapter config, database schema, auth, design system
- [ ] **Phase 2: Brand Portfolio** - Full brand website with gallery, menu, events, artists, editorial, location, and Instagram content
- [ ] **Phase 3: Loyalty System** - Points-per-purchase program with user accounts, QR scanning, staff admin, rewards catalog, and redemption
- [ ] **Phase 4: Native Mobile Apps** - iOS and Android apps via Capacitor with native QR scanning, haptics, and loyalty-first experience
- [ ] **Phase 5: Polish and Atmosphere** - Dark mode, scroll animations, and curated playlist links

## Phase Details

### Phase 1: Foundation
**Goal**: Project infrastructure is configured correctly so all downstream phases build on solid ground -- dual adapters, route groups, database, auth, and design tokens are all working
**Depends on**: Nothing (first phase)
**Requirements**: BRAND-06
**Success Criteria** (what must be TRUE):
  1. SvelteKit project builds successfully with both adapter-vercel (SSR) and adapter-static (Capacitor) via BUILD_TARGET env var
  2. Visitor sees a mobile-responsive layout on any device width with correct safe area handling
  3. Supabase local dev is running with Drizzle schema migrated (profiles, point_transactions, rewards, redemptions, scan_tokens tables exist)
  4. A test user can sign up and log in via Better Auth on the web
**Plans:** 5 plans

Plans:
- [x] 01-01-PLAN.md -- Scaffold SvelteKit + dual-adapter + TailwindCSS v4 tokens + self-hosted fonts (Wave 1)
- [x] 01-02-PLAN.md -- Supabase local + Drizzle schema + 9 tables migrated (Wave 2)
- [x] 01-03-PLAN.md -- Layout shell components + Coming Soon home (Wave 2)
- [ ] 01-04-PLAN.md -- Better Auth + magic link + Resend + AuthModal + /account stub (Wave 3)
- [ ] 01-05-PLAN.md -- Capacitor 8 SPM + full smoke test + human verify (Wave 4)

### Phase 2: Brand Portfolio
**Goal**: Visitors experience Rule 257's identity online -- they can see the space, browse the menu, discover events and artist collaborations, read editorial content, and find the cafe
**Depends on**: Phase 1
**Requirements**: BRAND-01, BRAND-02, BRAND-03, BRAND-04, BRAND-05, BRAND-07, CONT-01, CONT-02, CONT-03, CONT-04
**Success Criteria** (what must be TRUE):
  1. Visitor lands on a full-bleed hero section with strong visual identity and sharp typography that communicates Rule 257's brand
  2. Visitor can find the cafe location, hours, phone number, and contact info with a Google Maps embed on the site
  3. Visitor can browse signature menu items (French vanilla oat latte, strawberry matcha, pistachio tiramisu) as styled product cards
  4. Visitor can browse a photo gallery of the space, view upcoming and past events, explore artist collaboration profiles, and read editorial lookbook content
  5. Site renders Schema.org LocalBusiness markup and social links are visible in the footer; curated Instagram content from @rule257.nyc appears on the site
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Loyalty System
**Goal**: Customers can earn points on purchases via QR code scanning, track their balance, and redeem rewards -- staff can manage the program through an admin panel
**Depends on**: Phase 1
**Requirements**: LOYAL-01, LOYAL-02, LOYAL-03, LOYAL-04, LOYAL-05, LOYAL-06, LOYAL-07, LOYAL-08, LOYAL-09
**Success Criteria** (what must be TRUE):
  1. Customer can create an account, log in, and stay logged in across browser sessions
  2. Customer can display a personal QR code on screen; staff can scan it to award points; the QR token is single-use with expiry to prevent replay attacks
  3. Customer can view their current points balance (updated in real-time) and full transaction history
  4. Customer can browse a rewards catalog, select a reward, and redeem it with staff confirmation
  5. Staff can access an admin panel to view customers, manage points, and confirm redemptions
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Native Mobile Apps
**Goal**: iOS and Android apps provide a native loyalty experience with ML Kit QR scanning and haptic feedback that justifies App Store presence
**Depends on**: Phase 3
**Requirements**: MOBILE-01, MOBILE-02, MOBILE-03
**Success Criteria** (what must be TRUE):
  1. iOS app installs and runs with native feel -- tab bar navigation, haptic feedback on point earn, splash screen with Rule 257 branding
  2. Android app installs and runs with equivalent native feel and features
  3. Mobile apps lead with loyalty features (dashboard, scan, rewards) as the primary experience, not a wrapped website -- meeting Apple Guideline 4.2
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Polish and Atmosphere
**Goal**: The site and app feel premium with visual refinements and atmosphere features that elevate Rule 257 from functional to brand-defining
**Depends on**: Phase 2, Phase 4
**Requirements**: POLISH-01, POLISH-02, POLISH-03
**Success Criteria** (what must be TRUE):
  1. Visitor can toggle between dark mode and light mode; system preference is detected and applied automatically on first visit
  2. Scroll-driven animations (parallax, entrance reveals) activate as visitor scrolls through brand pages
  3. Visitor can access curated Spotify/Apple Music playlist links for cafe atmosphere
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5
Note: Phases 2 and 3 share a dependency on Phase 1 only; they could run in parallel if desired.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/5 | Planned | - |
| 2. Brand Portfolio | 0/? | Not started | - |
| 3. Loyalty System | 0/? | Not started | - |
| 4. Native Mobile Apps | 0/? | Not started | - |
| 5. Polish and Atmosphere | 0/? | Not started | - |
