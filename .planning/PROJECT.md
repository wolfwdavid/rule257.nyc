# Rule 257 NYC

## What This Is

A brand and portfolio website for Rule 257 — a creative café & studio at 54 Eldridge St in NYC's Chinatown/Lower East Side. The site showcases the space, artist collaborations, events, and editorial content with a clean minimal aesthetic. Companion iOS and Android apps power a points-per-purchase loyalty program. Built with SvelteKit and deployed as web + native apps via Capacitor.

## Core Value

The site must authentically represent Rule 257's identity as a space where art, fashion, design, and coffee culture converge — making visitors feel the vibe before they walk through the door.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Brand portfolio website with clean minimal design
- [ ] Photo galleries showcasing the space, atmosphere, and aesthetic
- [ ] Artist collaboration features and profiles
- [ ] Events section for past and upcoming gatherings/pop-ups
- [ ] Editorial lookbook content (curated fashion/art/design)
- [ ] Minimal menu teaser highlighting signature items (French vanilla oat latte, strawberry matcha, pistachio tiramisu)
- [ ] Points-per-purchase loyalty program
- [ ] User accounts for loyalty tracking
- [ ] QR code or scan-based point earning at the café
- [ ] Rewards catalog and redemption flow
- [ ] iOS app via Capacitor (loyalty-focused)
- [ ] Android app via Capacitor (loyalty-focused)
- [ ] Location info, hours, and contact details
- [ ] Instagram feed integration (@rule257.nyc)

### Out of Scope

- Full online ordering system — not a commerce platform, brand comes first
- POS integration — undecided on POS system, will revisit later
- Reservations/booking — not needed for v1
- Blog/CMS — editorial content managed through the codebase for now
- Push notifications — defer to v2 after loyalty program validates

## Context

- Rule 257 is at 54 Eldridge St, New York, NY 10002 (Chinatown/LES)
- Phone: +1 (917) 774-7263, Instagram: @rule257.nyc
- 4.9/5 Google rating (170 reviews), 9.0/10 on Atly
- Known for blending art, fashion, and design with authentic neighborhood textures
- Popular items: French vanilla oat latte, strawberry matcha latte, pistachio tiramisu
- Happy hour specials on pastries 3-5 PM daily
- Wi-Fi available, outdoor seating, accepts all payment types

## Constraints

- **Tech stack**: SvelteKit for web, Capacitor for iOS/Android — single codebase
- **Design**: Clean minimal aesthetic — white space, sharp typography, modern
- **POS**: No POS integration for v1 — loyalty points managed in-app
- **Hosting**: TBD — likely Vercel or similar for SvelteKit

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SvelteKit + Capacitor | Single codebase for web + mobile, user preference | ✓ Shipped (Phase 1) — dual-adapter via BUILD_TARGET env var |
| Points-per-purchase loyalty | Simple, proven model for café loyalty | — Pending (Phase 3) |
| Clean minimal design | Matches Rule 257's blend of Nordic simplicity and creative energy | ✓ Shipped (Phase 1) — TailwindCSS v4 @theme tokens + Fraunces/Inter |
| Standalone loyalty (no POS) | POS system undecided, build independent first | — Pending (Phase 3) |
| Better Auth magic-link (passwordless) | Lower friction than passwords; aligns with brand minimalism | ✓ Shipped (Phase 1) — code/endpoint wired, real-email E2E deferred pending Resend domain |
| Svelte email template via `svelte/server` | Avoid React transitive dep (D-29 substituted React Email) | ✓ Shipped (Phase 1) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after Phase 1 (foundation) completion*
