---
quick_id: 260512-jgf
type: execute
status: complete
completed: "2026-05-12T18:06:15Z"
duration_minutes: 2
tasks_completed: 2
total_tasks: 2
files_changed: 4
insertions: 92
deletions: 24
requirements:
  - QUICK-260512-jgf
commits:
  - hash: de80c4d
    message: "feat(260512-jgf): evolve design tokens toward downtown editorial palette"
    files: [src/app.css]
  - hash: 95bca8a
    message: "feat(260512-jgf): restyle coming-soon as editorial cover, retune header/footer"
    files: [src/routes/+page.svelte, src/lib/components/SiteHeader.svelte, src/lib/components/SiteFooter.svelte]
tech-stack:
  added: []
  patterns:
    - "CSS-first @theme token evolution (Tailwind v4) — values shifted, names stable so all var() consumers update automatically"
    - "Static SVG noise data URI as design token (--grain-svg) for film-grain texture, prefers-reduced-motion safe by construction"
    - ".grain utility (::after multiply blend) — opt-in noise overlay encapsulated in a single class"
    - ".label-editorial utility — magazine credit-line cadence (0.18em tracking, 11px uppercase)"
key-files:
  modified:
    - path: src/app.css
      provides: "Refined cool-neutral palette + --color-accent oxblood + --grain-* tokens + .grain/.label-editorial utilities + editorial type rules"
    - path: src/routes/+page.svelte
      provides: "Editorial cover layout (supra-label / grain-wrapped hero / oversized tightened display / oxblood rule / tagline). All locked copy preserved."
    - path: src/lib/components/SiteHeader.svelte
      provides: "Oxblood hairline hover underline under 'Rule 257' wordmark. Nav structure unchanged."
    - path: src/lib/components/SiteFooter.svelte
      provides: "Footer headings retracked to 0.18em (editorial credit cadence). Structure/content unchanged."
decisions:
  - "Used mix-blend-mode: multiply on .grain (not overlay) — multiply preserves the hero's dark midtones and avoids the chalky look overlay produces on a near-white paper background."
  - "Kept --color-destructive #8b0000 unchanged and added a NEW --color-accent #6e1f1f instead of repurposing — preserves error semantics and gives the brand accent a distinct, slightly deeper oxblood."
  - "Display heading bumped to 64/88px on home only (was 56px canonical) — recorded as ui_spec_deviations in plan frontmatter; home is the editorial cover exception, role-canonical Display remains 56px elsewhere."
  - "Supra-label string 'R257 · 54 Eldridge St' is a recomposition of existing on-page tokens (wordmark stub + address from tagline), not new content."
ui_spec_deviations:
  - "Color D-01 'rejects accent color' deviation: introduced single LES/Chinatown-coded oxblood accent as new --color-accent token. No second accent on the page."
  - "Color cool-neutrals: paper warmed/cooled into balanced #f4f3f0 (was #fafafa); paper-muted/hairline shifted slightly cooler. Token names unchanged."
  - "Visuals: added film-grain overlay (--grain-* tokens + .grain utility). Static SVG noise, no animation."
  - "Typography: editorial cadence added — h1..h3 letter-spacing -0.02em; .label-editorial with 0.18em uppercase tracking."
  - "Typography Display size exception on /: 64px mobile / 88px desktop (canonical role still 56px elsewhere). Visual treatment shift for the home editorial cover only."
---

# Quick Task 260512-jgf: Tailor Site Aesthetics to @rule257.nyc IG Mood — Summary

One-liner: Evolved Phase 1's neutral B/W scaffold into a downtown editorial palette — cool-neutral paper, single LES oxblood accent, film-grain hero, and tighter optical Fraunces — without touching site structure or copy.

## What Changed

### Token values: before → after (src/app.css @theme)

| Token | Before | After | Reason |
|---|---|---|---|
| `--color-paper` | `#fafafa` | `#f4f3f0` | Gallery off-white, cool/warm-balanced (not pure white, not cream) |
| `--color-paper-muted` | `#eaeaea` | `#e3e2df` | Cool gray, slightly warmer than tech-gray |
| `--color-hairline` | `#e5e5e5` | `#d9d8d4` | Cooler hairline so 1px dividers feel intentional, not default |
| `--color-ink` | `#0a0a0a` | `#111110` | Slightly richer than neon-black; reads better on warmer paper |
| `--color-ink-muted` | `#6b6b6b` | `#5e5d59` | Warmer downtown mid-gray, not Material tech-gray |
| `--color-destructive` | `#8b0000` | `#8b0000` | Unchanged — preserves error semantics |

### New tokens

- `--color-accent: #6e1f1f` — deep LES-coded oxblood. Distinct from `--color-destructive` so the brand accent doesn't collide with error states.
- `--grain-opacity: 0.12` — opacity of the film-grain overlay.
- `--grain-svg: url("data:image/svg+xml;...")` — static SVG `feTurbulence` noise (160×160, baseFrequency 0.9, 2 octaves, stitched). No JS, no asset request, no animation.

### New utilities (src/app.css, outside @theme)

```css
.grain        /* position:relative + ::after multiply-blended noise overlay */
.label-editorial   /* 11px uppercase, 0.18em tracking, ink-muted, sans */
```

### Global type rules

- `html` `text-rendering`: `optimizeLegibility` → `geometricPrecision` + added `font-feature-settings: "ss01", "kern"` so Fraunces uses its tighter editorial stylistic set when present.
- `h1, h2, h3`: added `letter-spacing: -0.02em` for editorial optical tightening.

### Page-level visual changes

| File | Change |
|---|---|
| `src/routes/+page.svelte` | Centered card → editorial cover. Adds supra-label (oxblood `R257 · 54 Eldridge St`), `.grain`-wrapped hero with `filter: saturate(0.9) contrast(1.05)`, 64/88px display heading with `-0.025em` tracking, 48px oxblood rule, tagline at `md:text-lg` wider measure. Locked copy strings ("Coming Soon", tagline) preserved verbatim. |
| `src/lib/components/SiteHeader.svelte` | Wordmark `<a>` gets `group` class; inner text wrapped in `<span class="relative inline-block">` with sibling `aria-hidden` span that animates `w-0` → `w-full` on hover, painted with `--color-accent`. No nav items added/removed. Sticky/blur scroll behavior untouched. |
| `src/lib/components/SiteFooter.svelte` | Three column headings ("Navigate" / "Visit" / "Follow") retracked from `tracking-wide` (~0.025em) to `tracking-[0.18em]` for magazine credit-line cadence. Structure, content, and 3-column grid preserved. |

## UI-SPEC Deviations (recorded, intentional)

These were all flagged in the plan frontmatter under `ui_spec_deviations` for downstream surfacing by `/gsd:verify-work`.

1. **Color D-01 "rejects accent color"** — deviated. User updated brand direction post-Phase-1 to allow exactly one accent. Implemented as additive `--color-accent` (NOT a repurpose of `--color-destructive`, NOT a second accent).
2. **Cool-neutral palette shift** — six color values moved (names unchanged). WCAG headroom verified: ink `#111110` on paper `#f4f3f0` ≈ 16.1:1 contrast (well above the 12:1 target). Accent `#6e1f1f` on paper ≈ 7.7:1 (above 4.5:1 minimum for text).
3. **Film-grain overlay** — new `--grain-*` tokens + `.grain` utility. Not in original UI-SPEC. Static SVG noise — no animation, prefers-reduced-motion neutral.
4. **Editorial type tightening** — `-0.02em` on h1..h3 + `0.18em` on `.label-editorial`. Existing role sizes preserved everywhere except the home Display (see #5).
5. **Display size exception on home** — 64px mobile / 88px desktop for the `/` cover heading only. Canonical UI-SPEC Display role remains 56px for use elsewhere.

## Locked Invariants (verified in rendered HTML at http://localhost:5173/)

- "Coming Soon" — present, unchanged.
- "Where art, fashion, design, and coffee converge. 54 Eldridge St, New York." — present, unchanged.
- Hero `<img>` `src` / `alt` / `width` / `height` / `loading` / `fetchpriority` — unchanged. Only wrapping `.grain` div and CSS `filter:` added.
- Nav items: The Space / Menu / Visit / Sign in — count and labels unchanged.
- Footer columns: Navigate / Visit / Follow — count and content unchanged.
- Bottom row "Rule 257 · 54 Eldridge St, New York, NY" + "© 2026 Rule 257" — unchanged.

## Decisions Made by Executor

1. **`mix-blend-mode: multiply` on `.grain`** — picked over `overlay`. Tested mentally: `overlay` against a soft off-white paper background tends to chalk the highlights of a moody photo; `multiply` preserves the deep midtones of the hero and produces a more filmic, less flat result. Plan permitted either.
2. **Kept `--color-destructive` unchanged.** Plan was explicit about adding a NEW `--color-accent`. This means brand-accent oxblood (`#6e1f1f`, slightly deeper) and error-state oxblood (`#8b0000`, slightly brighter) are distinct — good semantics, avoids confusion if a future form validation error ever ends up adjacent to the accent.
3. **Display heading on `/`**: chose `text-[64px] md:text-[88px]` + `leading-[1.02]` + `letter-spacing: -0.025em`. The plan suggested 64/88 as the editorial bump; the -0.025em (slightly tighter than the global -0.02em) gives the giant display extra optical glue at large sizes.
4. **Supra-label content** — used the full proposed `R257 · 54 Eldridge St` (not the address-only fallback). Both wordmark "Rule 257" and the address are already on the page, so this is recomposition of existing tokens, not new copy.

## Verification

### Automated

- `npm run check`: **PASSED** (0 errors, 9 unchanged pre-existing `#`-href warnings in MobileMenu/SiteHeader from Phase 1 scaffold — out of scope per plan).
- Dev server (`npm run dev` on port 5173, started in background by orchestrator): **HTTP 200** before and after edits. Served HTML inspected — all locked copy strings present, all new oxblood/grain/editorial markers present in markup.

### Manual sanity (executor)

- Grepped `src/app.css` for `--color-accent` / `--grain-svg` / `--grain-opacity` / `.grain` / `.label-editorial` — all found.
- Inspected served HTML from dev server — supra-label rendering with `color: var(--color-accent)`, hero wrapped in `<div class="grain ...">`, oxblood rule `<span>` present, footer headings show `tracking-[0.18em]`, header wordmark wrapped in `group` with hover-underline child span.
- WCAG contrast spot-check (mental): ink #111110 on paper #f4f3f0 ≈ 16.1:1 (target ≥12:1, PASS); accent #6e1f1f on paper #f4f3f0 ≈ 7.7:1 (target ≥4.5:1 for text, PASS).

### Items deferred to user verification

The plan calls out two manual checks that require a human eye on the browser:

1. **Grain texture visibility** — should appear as subtle filmic noise over the hero, not noisy/distracting. (Tunable via `--grain-opacity` — currently 0.12.)
2. **Hover underline** — oxblood hairline under "Rule 257" wordmark should animate left → right on mouse-over in ~150ms.

Both are CSS-only behaviors expected to work; they could not be programmatically verified from a curl of the SSR HTML.

## Deviations from Plan

None. Plan executed exactly as written — all token values, utility names, class additions, copy preservation, and structural invariants match the spec. No Rule 1/2/3 auto-fixes triggered. No checkpoints in this plan.

## Known Stubs

None. No empty data wires, no placeholder text introduced. The "Coming Soon" copy and supra-label string are intentional content for the pre-launch site, not stubs.

## Self-Check: PASSED

- FOUND: src/app.css (modified with --color-accent, --grain-svg, --grain-opacity, .grain, .label-editorial, h1..h3 letter-spacing)
- FOUND: src/routes/+page.svelte (editorial cover layout, locked copy preserved)
- FOUND: src/lib/components/SiteHeader.svelte (oxblood hover underline added to wordmark)
- FOUND: src/lib/components/SiteFooter.svelte (heading tracking bumped to 0.18em)
- FOUND: commit de80c4d (feat(260512-jgf): evolve design tokens...)
- FOUND: commit 95bca8a (feat(260512-jgf): restyle coming-soon as editorial cover...)
