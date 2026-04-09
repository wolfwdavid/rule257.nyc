# Feature Research

**Domain:** Creative cafe brand/portfolio website + loyalty mobile app (art/fashion/coffee culture convergence)
**Researched:** 2026-04-09
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hero section with strong visual identity | First impression defines brand. Every top cafe site (Kitsune, Sunday in Brooklyn, Chinatown Soup) leads with immersive hero imagery. A cafe site without a compelling hero feels amateur | LOW | Full-bleed photo or video, sharp typography, minimal text. SvelteKit page transitions add polish cheaply |
| Location, hours, contact info | 90%+ of cafe site visits are "where is it / when is it open." Burying this = bounce. Google expects structured data for local SEO | LOW | Prominent footer or dedicated section. Google Maps embed, phone (+1 917-774-7263), address (54 Eldridge St). Schema.org LocalBusiness markup for Knowledge Panel |
| Mobile-responsive design | 70%+ of cafe traffic is mobile. Non-responsive = unusable for majority of visitors | LOW | SvelteKit + CSS handles natively. Mobile-first approach. TailwindCSS responsive utilities |
| Menu / offerings teaser | Visitors want to preview what to expect. Not a full ordering system, but a curated highlight of signature items (French vanilla oat latte, strawberry matcha, pistachio tiramisu). Happy hour callout (3-5 PM pastries) | LOW | Styled product cards with photography. Atmosphere over exhaustive listing. Static content, no CMS |
| Photo gallery of the space | Customers want to feel the vibe before visiting. Critical for a space that blends art/fashion/design. Every comparable art cafe features space photography prominently | MEDIUM | Masonry or grid layout. Lazy-loaded images with @sveltejs/enhanced-img for avif/webp optimization. Showcase both physical space and atmosphere/people |
| Social media links + Instagram integration | @rule257.nyc is the living proof of the brand. 4.9/5 Google rating (170 reviews) is social proof. Visitors expect to find and follow | MEDIUM | Instagram feed embed or curated grid via oEmbed API (Basic Display API is deprecated). Lazy loading. Link to all social profiles in footer. Note: Instagram API is fragile -- manual curation is a safer fallback |
| User accounts for loyalty | Customers need to identify themselves to earn/redeem points. 60% of loyalty members prefer mobile app access | MEDIUM | Email/password minimum. Add social login (Google, Apple) for mobile convenience. JWT-based auth. Capacitor handles native auth flows. Keep signup friction minimal (name, email, phone) |
| Points-per-purchase tracking with balance | Core value proposition of the app. 79% of daily coffee drinkers say loyalty programs influence where they buy. Digital punch cards or points-per-dollar are table stakes in 2026 | HIGH | Points ledger, real-time balance display, transaction history. This is the heart of the app. Atomic transactions required (deduct + record must be coupled) |
| QR code based point earning | Without POS integration, QR scanning is the standard mechanism. BonusQR, Open Loyalty, and most indie cafe solutions use this pattern. Staff scan customer code or customer scans counter code | MEDIUM | Two approaches: (1) customer shows QR, staff scans to add points (faster for queues), or (2) counter displays QR, customer scans and staff confirms. Needs camera access via Capacitor. ML Kit barcode scanner for native, html5-qrcode for web fallback |
| Rewards catalog and redemption flow | Customers need to see what they're earning toward. 64% of consumers want rewards earned quickly. Without visible rewards, points feel meaningless | MEDIUM | Simple list/grid of rewards with point costs. Staff-confirmed redemption (show screen to barista). Start with free drink tiers. Redemption must be atomic (deduct points + create redemption record) |
| Events section | Rule 257 hosts gatherings and pop-ups. Visitors need to discover upcoming events and see past event documentation. Every comparable art cafe (Happy Medium, Chinatown Soup) features events prominently | LOW | List/card layout with date, title, description, image. Past events as archive. No ticketing for v1. Static content managed in codebase |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Editorial lookbook content | Rule 257 blends art, fashion, and design -- this is the killer differentiator. Curated editorial pages (styled photography, artist features, fashion/design narratives) elevate from "coffee shop website" to "culture brand platform." Kitsune does this brilliantly; no indie NYC cafe does it well | MEDIUM | Full-bleed image layouts, minimal text overlays, mood-driven storytelling. Think fashion editorial, not blog post. Magazine-style layouts with Svelte transitions for reveals. Managed through codebase per PROJECT.md |
| Artist collaboration profiles | Showcasing collaborating artists with dedicated profile pages tells the story of the creative community. Chinatown Soup features artist residencies; Happy Medium features artist-led classes. Rule 257 can own this niche as a gallery-cafe hybrid | MEDIUM | Artist name, bio, portfolio images, link to their work. Rotating/archival. Builds the narrative that Rule 257 is a creative hub, not just a coffee shop |
| Apple Wallet / Google Wallet loyalty pass | Apps that save to native wallet consistently outperform standalone apps. 75% of consumers are reluctant to install single-purpose apps. A wallet pass removes that friction entirely. No NYC indie cafe competitor currently offers this | MEDIUM | @jackobo/capacitor-pass-to-wallet plugin exists for Capacitor. PassKit or custom .pkpass generation on backend. Pass shows point balance, updates automatically |
| Scroll-driven animations and micro-interactions | Parallax effects, entrance animations, subtle hover states make the site feel alive and premium. Top cafe sites use these extensively in 2025-2026. Parallax scrolling is a "clever storytelling technique" per Figma's 2026 trend report | MEDIUM | SvelteKit + Intersection Observer for scroll triggers. CSS animations for micro-interactions. Svelte's built-in transition system (fly, fade, crossfade) is excellent. Keep tasteful, not overwhelming |
| Haptic feedback on point earn | Subtle vibration when scanning successfully and earning points makes the app feel premium and native. Small detail, massive UX impact | LOW | Capacitor Haptics plugin. Literally one line of code |
| Curated atmosphere playlist links | Kitsune integrates music (Kitsune Musique) as brand pillar. Linking to Spotify/Apple Music playlists extends the cafe vibe beyond the physical space | LOW | Simple links or embedded Spotify player. Curated playlists matching the aesthetic. Low effort, high brand value |
| Dark mode / light mode toggle | Increasingly standard for apps. YouTube, Slack, X all offer it. Signals polish and accessibility. Battery savings on OLED | LOW | CSS custom properties for theming. prefers-color-scheme detection. Toggle in localStorage. SvelteKit store-based theme management |
| Neighborhood storytelling | Rule 257 is in Chinatown/LES, one of NYC's most culturally rich neighborhoods. Chinatown Soup does this well -- weaving neighborhood identity into brand. No generic cafe site competes on local cultural authenticity | LOW | About section or editorial content positioning Rule 257 within its neighborhood. Photography of surrounding area. Cultural context that makes the location part of the brand |
| Personalized reward notifications | "You're one stamp away from a free drink" messages drive return visits. 73% of customers expect personalized digital rewards. "Double stamps before noon" fills slow mornings | HIGH | Defer push to v2 per PROJECT.md. In-app notification badges and email for v1 are viable. Requires notification infrastructure |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full online ordering system | Seems like obvious cafe digital feature | PROJECT.md explicitly out-of-scope. Massive complexity: inventory management, payment processing, order flow, fulfillment tracking. Rule 257 is brand-first, not a commerce platform. Commoditizes the walk-in experience | Menu teaser with "visit us" CTA. Drive foot traffic, not delivery. Defer to v2+ only if validated by overwhelming customer demand |
| POS integration | Automates point earning, reduces manual friction | POS system undecided per PROJECT.md. Integration locks into a vendor. Adds backend complexity and ongoing maintenance burden. QR-based standalone loyalty works without it and most indie cafe solutions use this pattern | QR code scanning for points. Staff confirms via app dashboard. Revisit POS integration when POS decision is made |
| Full CMS / blog system | Content updates without code changes | PROJECT.md says editorial managed through codebase. CMS adds infrastructure cost, security surface area, and content governance overhead for a small team. Markdown in repo is simpler and version-controlled | Static content in SvelteKit routes. Markdown files for editorial. Git-based workflow keeps content in version control |
| Reservation / booking system | Common restaurant feature request | Rule 257 is a walk-in cafe, not a restaurant. Booking adds unused complexity and implies scarcity that doesn't exist. PROJECT.md explicitly defers | Location + hours + "walk-ins welcome" messaging |
| Push notifications (v1) | Engage users about rewards and events | PROJECT.md defers to v2. Requires APNs/FCM setup, notification permissions (users increasingly decline), and ongoing engagement strategy. High complexity for uncertain value before loyalty validates | In-app notification badges. Email for reward milestones. Revisit push after loyalty engagement is proven |
| Real-time chat / customer support | Modern app expectation | Single-location indie cafe does not need real-time support infrastructure. Adds ongoing staffing burden and always-on monitoring. Instagram DMs and phone already serve this purpose well | Contact info (phone, Instagram DM, email). FAQ if needed |
| User-generated content / reviews | Social proof and engagement | Already have 4.9/5 on Google (170 reviews). Managing UGC requires moderation, storage, abuse prevention, and content policies. Instagram integration surfaces real customer content naturally without the moderation burden | Instagram feed surfaces authentic customer photos. Link to Google reviews for social proof |
| Complex gamification (badges, streaks, leaderboards) | Make loyalty "fun" | Over-engineering for a single-location cafe. Adds complexity without proportional value. Most successful indie cafe loyalty programs are dead simple (points/stamps). Gamification distracts from the core earn/redeem loop | Simple points-per-purchase. Clear progress bar toward next reward. Consider tiered status in v2+ if loyalty validates |
| Multi-language support | NYC is multilingual, Chinatown context | Significant content management burden. Rule 257's brand voice is English-language. Doubles content work for every update. Chinatown context is expressed visually, not textually | Keep copy minimal and visual-heavy. Consider Mandarin/Chinese for location/hours only if validated by actual customer feedback |
| Multi-location support | Future-proofing for expansion | Single location at 54 Eldridge St. Premature abstraction for expansion that may never happen. Building multi-tenant from day one adds complexity to every feature | Hardcode location data. Architecture should not prevent future multi-location, but do not build for it now |

## Feature Dependencies

```
[User Accounts]
    |
    +--requires--> [Points-per-Purchase Tracking]
    |                  |
    |                  +--requires--> [QR Code Scanning]
    |                  |                  |
    |                  |                  +--requires--> [Staff Admin Interface]
    |                  |                                  (to validate QR codes)
    |                  |
    |                  +--requires--> [Rewards Catalog & Redemption]
    |
    +--enhances--> [Apple/Google Wallet Pass]
    |
    +--enhances--> [Personalized Notifications]

[Photo Gallery]
    +--enhances--> [Artist Collaboration Profiles]
    +--enhances--> [Editorial Lookbook Content]
    +--enhances--> [Events Section]

[Instagram Integration] --enhances--> [Photo Gallery]

[Scroll Animations] --enhances--> [Hero Section]
                    --enhances--> [Editorial Lookbook]
                    --enhances--> [Photo Gallery]

[Location/Hours/Contact] --independent-- (no dependencies)
[Menu Teaser] --independent-- (no dependencies)
[Dark Mode Toggle] --independent-- (no dependencies)
[Playlist Links] --independent-- (no dependencies)
```

### Dependency Notes

- **Points Tracking requires User Accounts:** Users must be identified to track their points balance and history
- **QR Code Scanning requires User Accounts:** Staff need to associate scanned codes with a specific user to credit points
- **QR Code Scanning requires Staff Admin Interface:** Someone needs to validate/generate transaction QR codes on the cafe side
- **Rewards Redemption requires Points Tracking:** Cannot redeem without knowing the user's current balance
- **Apple/Google Wallet Pass enhances User Accounts:** Pass is linked to user's loyalty profile; requires account to exist first
- **Personalized Notifications enhance User Accounts:** Need user identity and purchase history to personalize messages
- **Artist Profiles, Lookbook, and Events all enhance Photo Gallery:** They share image infrastructure and visual patterns; building gallery first establishes reusable components
- **Instagram Integration enhances Photo Gallery:** Can supplement or feed into the gallery section; shares lazy-loading infrastructure
- **Staff Admin Interface is a hidden dependency:** The loyalty system requires a way for cafe staff to issue points -- this is critical but easy to overlook

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to validate the concept.

**Brand Website (Phase 1):**
- [ ] Hero section with strong visual identity -- first impression is everything for a brand site
- [ ] Location, hours, contact with Schema.org markup and Google Maps -- answers the #1 visitor question
- [ ] Menu teaser with signature items and photography -- gives visitors a reason to come
- [ ] Photo gallery of the space -- lets visitors feel the vibe before walking in
- [ ] Events section (upcoming + past archive) -- shows the space is alive and active
- [ ] Mobile-responsive clean minimal design -- matches Rule 257's aesthetic DNA
- [ ] Social media links + basic Instagram grid -- connects digital to social presence
- [ ] Animated page transitions (Svelte built-ins) -- low effort, high polish

**Loyalty App (Phase 2):**
- [ ] User account creation (email + social login) -- foundation for everything loyalty
- [ ] QR code scanning for point earning (native ML Kit + web fallback) -- the interaction at the counter
- [ ] Staff admin interface for point validation -- the other side of the QR scan
- [ ] Points balance display with transaction history -- core loyalty UX, must be real-time
- [ ] Rewards catalog with redemption flow -- the payoff that keeps people coming back
- [ ] Haptic feedback on successful scan -- one line of code, premium feel

### Add After Validation (v1.x)

Features to add once core is working and loyalty program shows traction.

- [ ] Artist collaboration profiles -- after editorial workflow is established and content pipeline is validated
- [ ] Editorial lookbook pages -- after gallery infrastructure proves the visual storytelling approach
- [ ] Apple Wallet / Google Wallet pass -- after user base reaches meaningful size (100+ active users); reduces app-open friction
- [ ] Scroll-driven animations and micro-interactions -- after core content is solid, layer on visual polish
- [ ] Dark mode / light mode toggle -- after design system is stable
- [ ] Curated playlist links -- low effort, add whenever brand playlists are ready
- [ ] Neighborhood storytelling content -- after editorial voice is established
- [ ] In-app reward milestone notifications -- after loyalty engagement patterns are understood from data

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Push notifications -- per PROJECT.md, defer until loyalty validates engagement
- [ ] POS integration -- per PROJECT.md, revisit when POS system is selected
- [ ] Tiered loyalty status (e.g., Green/Gold/Reserve a la Starbucks) -- only if user base warrants the complexity
- [ ] Personalized reward recommendations -- requires enough transaction data to be meaningful
- [ ] Online ordering -- only if customer demand is overwhelming and proven
- [ ] Event RSVP / ticketing -- only if event attendance tracking becomes necessary
- [ ] Referral program -- only after organic loyalty growth plateaus

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero section + visual identity | HIGH | LOW | P1 |
| Location / hours / contact | HIGH | LOW | P1 |
| Menu teaser | HIGH | LOW | P1 |
| Mobile-responsive design | HIGH | LOW | P1 |
| Photo gallery | HIGH | MEDIUM | P1 |
| Events section | MEDIUM | LOW | P1 |
| Social media links | MEDIUM | LOW | P1 |
| Page transitions (Svelte) | MEDIUM | LOW | P1 |
| User accounts | HIGH | MEDIUM | P1 |
| Points tracking + balance | HIGH | HIGH | P1 |
| QR code scanning | HIGH | MEDIUM | P1 |
| Staff admin interface | HIGH | MEDIUM | P1 |
| Rewards catalog + redemption | HIGH | MEDIUM | P1 |
| Haptic feedback | MEDIUM | LOW | P1 |
| Instagram feed embed | MEDIUM | MEDIUM | P2 |
| Artist collaboration profiles | MEDIUM | MEDIUM | P2 |
| Editorial lookbook content | MEDIUM | MEDIUM | P2 |
| Scroll animations | MEDIUM | MEDIUM | P2 |
| Apple/Google Wallet pass | HIGH | MEDIUM | P2 |
| Dark mode toggle | LOW | LOW | P2 |
| Playlist links | LOW | LOW | P2 |
| Neighborhood storytelling | LOW | LOW | P2 |
| Push notifications | MEDIUM | HIGH | P3 |
| POS integration | MEDIUM | HIGH | P3 |
| Tiered loyalty status | LOW | MEDIUM | P3 |
| Online ordering | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add after validation
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Cafe Kitsune | Happy Medium (NYC) | Chinatown Soup (NYC) | Starbucks App | Rule 257 Approach |
|---------|-------------|-------------------|---------------------|---------------|-------------------|
| Brand storytelling | Full lifestyle brand: fashion, music, culture. E-commerce, collabs, artist features. Massive scale | Art activity focused. Instagram-driven (158K followers). Classes as product | Artist community hub. Gallery, studio, cafe as distinct pillars. Strong Chinatown neighborhood identity | Minimal brand storytelling. Function-first utilitarian UX | Brand-first like Kitsune but at indie scale. Art/fashion/design convergence without e-commerce overhead |
| Menu / offerings | Cafe page within larger brand site. Interactive recipe cards (brownies, carrot cake) | Art class "menu" -- activities priced under $25 | Tea culture focus. Artist-made ceramics | Full digital menu with customization, mobile ordering, pricing | Curated signature item highlights. Atmosphere over exhaustive listing |
| Loyalty program | "Loyalty Card" link on site (details unclear) | None visible. Instagram DM-driven engagement | None visible. Donation-based (Fractured Atlas) | Industry-leading: 3 tiers (Green/Gold/Reserve), points per dollar, personalized offers, mobile payment integration | Points-per-purchase via custom SvelteKit + Capacitor app. QR scanning. Simple, start small, grow with demand |
| Events | Not prominent on cafe section | Instagram-driven. "Art Noir" Fri/Sat 9-11pm | "Event Soup" via Eventbrite link. Community events prominent | Seasonal promotions only | Dedicated events section with past archive. Static content, no ticketing v1 |
| Artist collaborations | Collabs page with brand partnerships (Sungai Watch, Native Union). Product collaborations | Featured artists lead classes. Artist-as-teacher model | Core identity: gallery exhibitions, artist residencies, curated shows, artist-made ceramics | None | Artist profile pages with portfolio, bio, collaboration story. Gallery-cafe hybrid positioning |
| Gallery / visual content | Location photos, interior design. Fashion product photography | Instagram-centric studio/activity photos | Gallery as distinct pillar. Underground studio (inspired by 1970s Basement Workshop) | None (purely functional) | Photo gallery of space + editorial lookbook for curated visual storytelling |
| Social integration | Instagram, TikTok, Spotify, YouTube, Facebook. Full ecosystem | Instagram-centric (158K followers). DM for bookings | Instagram + YouTube. Community-focused | In-app ecosystem only | Instagram feed integration + social links. Instagram as primary external channel |
| Mobile app | No dedicated app | No dedicated app | No dedicated app. Web only | Full-featured app: ordering, payment, loyalty, personalization, drive-thru integration | SvelteKit + Capacitor: loyalty-focused native app. Brand site is web-first |
| Wallet integration | None visible | None | None | Apple Pay/Google Pay for payment. Starbucks Card in wallet | Apple/Google Wallet loyalty pass via Capacitor plugin (v1.x) |
| Music / audio | Kitsune Musique: releases, archives, artworks, featured artists. Music is a brand pillar | None visible | None visible | None | Curated Spotify/Apple Music playlist links. Music as atmosphere extension (v1.x) |

## Sources

- [Cafe & Coffee Shop Websites: 43 Inspiring Examples (2026)](https://www.sitebuilderreport.com/inspiration/cafe-coffee-shop-websites)
- [Best Loyalty Programs for Coffee Shops in 2026 - CoffeeCloud](https://coffeecloud.com/blog/best-loyalty-programs-for-coffee-shops)
- [5 Best Loyalty Apps for Coffee Shops in USA (2026) - Perkstar](https://perkstar.co.uk/blog/best-loyalty-apps-coffee-shops-usa-2026)
- [Loyalty App: 5 Must-Have Features in 2026 - SimpleLoyalty](https://blog.simpleloyalty.com/best-restaurant-loyalty-app-features/)
- [Effective Loyalty Trends 2025 - SnapLoyalty](https://snaployaltyapp.com/loyalty-trends-2025-digital-rewards-for-cafes/)
- [Coffee Loyalty Programs: 10 Successful Examples - OpenLoyalty](https://www.openloyalty.io/insider/coffee-loyalty-programs-successful-examples)
- [Starbucks Reimagined Loyalty Program 2026](https://about.starbucks.com/press/2026/starbucks-unveils-reimagined-loyalty-program-to-deliver-more-meaningful-value-personalization-and-engagement-to-members/)
- [Top Cafe Website Designs That Convert - DesignRush](https://www.designrush.com/best-designs/websites/trends/cafe-website-design)
- [Best Cafe Website Designs 2025 - Nivo](https://nivo.co.uk/the-best-cafe-website-designs/)
- [Chinatown Soup - NYC Creative Community](https://www.chinatownsoup.nyc/)
- [Cafe Kitsune - Maison Kitsune](https://maisonkitsune.com/mk/cafe-kitsune-3-2/)
- [@jackobo/capacitor-pass-to-wallet npm package](https://www.npmjs.com/package/@jackobo/capacitor-pass-to-wallet)
- [How QR Code Loyalty Cards Work - Veeloy](https://veeloy.com/blog/how-qr-code-loyalty-cards-work/17)
- [Best Loyalty Apps for Small Cafes 2026 - StampMe](https://www.stampme.com/blog/best-loyalty-app-for-small-cafes-2025)
- [Web Design Trends 2026 - Figma](https://www.figma.com/resource-library/web-design-trends/)
- [Happy Medium NYC - Art Cafe](https://www.instagram.com/gethappymedium/)
- [Best Coffee Shop Website Design Examples 2026 - Colorlib](https://colorlib.com/wp/coffee-shop-websites/)
- [How to Embed Instagram Feed 2025 - Elfsight](https://elfsight.com/blog/how-to-embed-instagram-feed-on-website/)

---
*Feature research for: Rule 257 NYC -- Creative cafe brand/portfolio website + loyalty app*
*Researched: 2026-04-09*
