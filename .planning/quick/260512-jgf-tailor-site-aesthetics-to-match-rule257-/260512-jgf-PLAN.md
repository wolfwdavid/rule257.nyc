---
quick_id: 260512-jgf
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app.css
  - src/routes/+page.svelte
  - src/lib/components/SiteHeader.svelte
  - src/lib/components/SiteFooter.svelte
autonomous: true
requirements:
  - QUICK-260512-jgf
ui_spec_deviations:
  - "UI-SPEC §Color D-01 'rejects accent color' is intentionally deviated from: user locked a single LES/Chinatown-coded accent (oxblood/burgundy). Implemented as new --color-accent token (separate from --color-destructive). No second accent introduced."
  - "UI-SPEC §Color cool-neutrals shift: --color-paper warms slightly into a cool/warm-balanced paper (kept WCAG AA contrast) and --color-paper-muted introduces a subtle cool gray. Token names unchanged; values shift."
  - "UI-SPEC §Visuals adds film-grain overlay (new --grain-* tokens + .grain utility). Not in original spec; gated by prefers-reduced-motion via static SVG noise (no animation)."
  - "UI-SPEC §Typography adds editorial cadence: tracking-tight + optical-size feature flags on Fraunces display, looser tracking on uppercase Label sans. Existing role sizes preserved."
  - "UI-SPEC §+page.svelte copy LOCKED — only visual treatment changes. 'Coming Soon' display heading and tagline strings are untouched."

must_haves:
  truths:
    - "Coming-soon page reads as a moody downtown editorial cover (not a plain centered card) when loaded at / on desktop and mobile"
    - "A single oxblood/burgundy accent is visible on the page (e.g. a tracked R257 mark or rule line) without a second accent appearing anywhere else"
    - "Photography on / feels filmic — a subtle grain texture is layered over the hero image"
    - "Headlines use Fraunces with editorial spacing (tight optical, generous leading on subheads); body copy stays Inter"
    - "Header logo + nav and footer columns inherit the new palette/typography without structural changes (no new nav items, no new sections)"
    - "`npm run check` passes; dev server (`npm run dev`) renders / with no console errors and no Tailwind compile errors"
    - "prefers-reduced-motion still honored (grain is static, no new animations introduced)"
  artifacts:
    - path: "src/app.css"
      provides: "Cool-neutral palette refinement + --color-accent (oxblood) + --grain-* tokens + .grain utility class + editorial type rules"
      contains: "--color-accent"
    - path: "src/routes/+page.svelte"
      provides: "Editorial cover treatment of coming-soon (grain over hero, oxblood detail, editorial type rhythm) — copy unchanged"
      contains: "Coming Soon"
    - path: "src/lib/components/SiteHeader.svelte"
      provides: "Header retuned to new tokens (paper/ink shifts, optional oxblood hairline accent under wordmark) — structure unchanged"
      contains: "Rule 257"
    - path: "src/lib/components/SiteFooter.svelte"
      provides: "Footer retuned to new tokens (cool-neutral divider, label tracking) — structure/content unchanged"
      contains: "54 Eldridge St"
  key_links:
    - from: "src/routes/+page.svelte"
      to: "src/app.css"
      via: ".grain utility + var(--color-accent)"
      pattern: "class=\"[^\"]*grain[^\"]*\""
    - from: "src/lib/components/SiteHeader.svelte"
      to: "src/app.css"
      via: "consumes existing --color-paper/--color-ink/--color-hairline tokens (new values)"
      pattern: "color:var\\(--color-(paper|ink|hairline|accent)"
    - from: "src/app.css"
      to: "the page"
      via: "@theme block defines tokens consumed by Tailwind utilities and CSS vars"
      pattern: "@theme"
---

<objective>
Tailor the live site to match the @rule257.nyc IG mood — cool neutrals + a single LES/Chinatown-coded oxblood accent, filmic/grainy moody photography, serif-led editorial typography — without changing site structure or copy. This is a visual-only pass.

Purpose: Phase 1 shipped a correct but visually neutral scaffold (UI-SPEC pure B/W minimalism). The user has since refined the brand direction toward downtown editorial — slightly warmer/cooler paper, one restrained accent (oxblood already exists as `--color-destructive`), and film-grain photography. Update the design tokens and re-treat the coming-soon page so the visitor feels Rule 257's vibe immediately. Leave nav structure, footer structure, and all copy strings untouched.

Output:
- `src/app.css` evolved with refined cool-neutral palette + `--color-accent` token + grain texture variable/utility + editorial typography rules.
- `src/routes/+page.svelte` restyled as editorial cover (grain overlay on hero, oxblood detail, editorial cadence). Copy unchanged.
- `src/lib/components/SiteHeader.svelte` and `src/lib/components/SiteFooter.svelte` lightly retuned to new tokens — no structural changes.
- A list of UI-SPEC deviations recorded in frontmatter for downstream visibility.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.planning/phases/01-foundation/01-UI-SPEC.md
@./CLAUDE.md

# Active source files this plan touches
@src/app.css
@src/routes/+page.svelte
@src/routes/+layout.svelte
@src/lib/components/SiteHeader.svelte
@src/lib/components/SiteFooter.svelte
@src/lib/components/MobileMenu.svelte

<interfaces>
<!-- Current design tokens defined in src/app.css @theme. These are the contracts the executor must evolve, not abandon. -->
<!-- Existing token names MUST remain (consumers across SiteHeader/SiteFooter/MobileMenu/AuthModal/+page reference them). New tokens may be added. -->

From src/app.css (current @theme):
```css
@theme {
  --color-paper: #fafafa;          /* page bg */
  --color-paper-muted: #eaeaea;    /* subtle surface */
  --color-hairline: #e5e5e5;       /* 1px dividers */
  --color-ink: #0a0a0a;            /* text + CTAs */
  --color-ink-muted: #6b6b6b;      /* secondary text */
  --color-destructive: #8b0000;    /* errors only */

  --font-serif: "Fraunces", Georgia, "Times New Roman", serif;
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;

  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

Components consuming these tokens (do NOT break these references):
- SiteHeader.svelte: --color-paper, --color-ink, --color-hairline (sticky header + nav)
- SiteFooter.svelte: --color-hairline, --color-ink, --color-ink-muted (3-col footer)
- MobileMenu.svelte: --color-paper, --color-ink (full-screen drawer)
- +page.svelte: --color-ink, --color-ink-muted (coming-soon copy)

Locked copy strings on /:
- Display heading: "Coming Soon"
- Tagline: "Where art, fashion, design, and coffee converge. 54 Eldridge St, New York."
- Hero image: /images/rule257-coming-soon.jpg (1600x900)
</interfaces>

<aesthetic_targets>
<!-- User-locked aesthetic decisions. Implement exactly. -->

- **Palette:** cool neutrals + one accent.
  - Paper: shift from pure-neutral `#fafafa` toward a faintly cool/warm-balanced off-white (think gallery wall / Kinfolk paper, NOT bright white, NOT cream). Target ~`#f4f3f0` — reads slightly warm but with a cool gray bias.
  - Paper-muted: shift `#eaeaea` toward a cool gray (~`#e3e2df`) — keep WCAG headroom.
  - Hairline: shift `#e5e5e5` to a slightly cooler `#d9d8d4`.
  - Ink: deepen `#0a0a0a` very slightly to `#111110` (richer, less neon-black on the warmer paper).
  - Ink-muted: shift `#6b6b6b` to `#5e5d59` (warmer mid-gray, more downtown than tech-gray).
  - **Accent (new, --color-accent):** `#6e1f1f` (deep oxblood) — restrained, LES-coded. Distinct from --color-destructive which stays `#8b0000` for error semantics.
  - Verify WCAG AA after shift: ink on paper must stay >= 12:1. Accent on paper must stay >= 4.5:1 for any text use.

- **Photography feel:** film/grain, moody.
  - Add static SVG noise as a CSS background-image data URI exposed as `--grain-svg`.
  - Add `.grain` utility that layers `var(--grain-svg)` over its element via `::after` with `mix-blend-mode: multiply` (or `overlay` if multiply muddies the image) and `opacity: 0.10–0.15`.
  - Slightly desaturate the hero image via a CSS filter (`filter: saturate(0.9) contrast(1.05)`) — do NOT replace the image asset.

- **Mood:** downtown / cool / edgy.
  - Editorial cover composition for /: hero image larger (max-w-3xl or wider), grain overlay, a small uppercase tracked supra-label above "Coming Soon" using oxblood (e.g., "R257 — 54 Eldridge St"), tagline pushed wider with looser leading.
  - No new content. Only visual reorganization of existing strings.

- **Typography:** serif-led editorial.
  - Display (Fraunces): apply `font-feature-settings: "ss01"`-style optical tightening via `letter-spacing: -0.02em` on display sizes. Keep weight 400.
  - Heading: keep 28px Fraunces, slightly tighter tracking.
  - Label (uppercase sans): bump `letter-spacing: 0.12em` (was `tracking-wide` ~0.025em) — more magazine credit-line feel. Apply via .label-editorial utility or inline classes.
  - Body: keep Inter 16/1.6.
  - All copy strings remain unchanged.
</aesthetic_targets>

<deviation_note>
UI-SPEC §Color D-01 explicitly says "rejects accent color." This plan deviates because the user has since updated brand direction to allow exactly ONE accent (oxblood). Implementation strategy: add `--color-accent` as a new token (do NOT repurpose `--color-destructive`, do NOT introduce a second accent). All deviations are recorded in frontmatter.ui_spec_deviations for surfacing during /gsd:verify-work or in the final summary.
</deviation_note>

</context>

<tasks>

<task type="auto">
  <name>Task 1: Evolve design tokens in src/app.css (cool-neutral palette, oxblood accent, grain, editorial type)</name>
  <files>src/app.css</files>
  <action>
Edit `src/app.css` to evolve — not replace — the @theme block and global rules. Make the following changes precisely:

1. **Update @theme color tokens** (values only; names unchanged):
   - `--color-paper: #f4f3f0;` (was #fafafa — cool/warm-balanced off-white, gallery paper)
   - `--color-paper-muted: #e3e2df;` (was #eaeaea — cool gray)
   - `--color-hairline: #d9d8d4;` (was #e5e5e5 — slightly cooler)
   - `--color-ink: #111110;` (was #0a0a0a — richer on warmer paper)
   - `--color-ink-muted: #5e5d59;` (was #6b6b6b — warmer mid-gray)
   - Keep `--color-destructive: #8b0000;` unchanged (error semantics preserved).

2. **Add new accent token** inside the same @theme block, after --color-destructive:
   - `--color-accent: #6e1f1f;` (deep LES-coded oxblood, distinct from destructive)

3. **Add grain texture tokens** inside the same @theme block:
   - `--grain-opacity: 0.12;`
   - `--grain-svg: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");`

4. **Add a `.grain` utility class** OUTSIDE the @theme block (Tailwind v4 still accepts plain CSS for utilities):
   ```css
   .grain {
     position: relative;
     isolation: isolate;
   }
   .grain::after {
     content: "";
     position: absolute;
     inset: 0;
     background-image: var(--grain-svg);
     background-size: 160px 160px;
     mix-blend-mode: multiply;
     opacity: var(--grain-opacity);
     pointer-events: none;
     z-index: 1;
   }
   ```

5. **Add editorial typography rules** after the existing `h1..h6` rule:
   ```css
   h1, h2, h3 {
     letter-spacing: -0.02em;
   }
   .label-editorial {
     font-family: var(--font-sans);
     font-size: 11px;
     font-weight: 400;
     letter-spacing: 0.18em;
     text-transform: uppercase;
     color: var(--color-ink-muted);
   }
   ```

6. **Update the global `html` rule** to use `text-rendering: geometricPrecision;` (was `optimizeLegibility`) and add `font-feature-settings: "ss01", "kern";` so Fraunces uses its tighter editorial stylistic set when available. Keep -webkit-font-smoothing antialiased.

7. **Do NOT change**:
   - The @font-face declarations (Fraunces/Inter paths and weights).
   - The :root safe-area-inset block.
   - The prefers-reduced-motion media query.
   - The :focus-visible rule.
   - --font-serif, --font-sans, --font-mono stacks.
   - --spacing, --breakpoint-*, --duration-*, --ease-out tokens.

Why this approach: Tailwind v4 CSS-first @theme means token name stability is critical — every existing component class like `text-[color:var(--color-ink)]` will pick up the new values automatically. New `--color-accent` is additive. Grain is encapsulated in a single utility so any future hero can opt in via `class="grain"`.
  </action>
  <verify>
    <automated>npm run check</automated>
    Manual sanity (executor): grep -n "color-accent\|grain\|color-paper:" src/app.css and confirm the new lines exist; reload dev server and confirm the paper color visibly shifted from pure white toward gallery off-white.
  </verify>
  <done>
- `src/app.css` contains `--color-paper: #f4f3f0;`, `--color-accent: #6e1f1f;`, `--grain-svg: url(...)`, `--grain-opacity: 0.12;`, and the `.grain` utility class.
- `letter-spacing: -0.02em` rule applied to h1..h3 and `.label-editorial` utility defined.
- All pre-existing tokens still present (no token deleted, only color values changed; new tokens additive).
- `npm run check` exits 0.
  </done>
</task>

<task type="auto">
  <name>Task 2: Restyle coming-soon as editorial cover + retune Header/Footer to new tokens</name>
  <files>src/routes/+page.svelte, src/lib/components/SiteHeader.svelte, src/lib/components/SiteFooter.svelte</files>
  <action>
Apply the new tokens and editorial cover treatment. **Do not change any copy strings. Do not change navigation structure. Do not add new sections.**

### A. `src/routes/+page.svelte` — editorial cover restyle

Replace the current centered card composition with an editorial cover layout. The page must still contain exactly:
- One supra-label (uses existing context — derive from copy already on page, e.g., "R257 · 54 Eldridge St")
- The existing `<h1>Coming Soon</h1>` (string unchanged)
- The existing tagline `<p>` (string unchanged)
- The existing `<img>` hero (src and alt unchanged)

Target structure (replace the current `<section>`):

```svelte
<section
  aria-label="Coming soon"
  class="relative flex flex-col items-center justify-center px-6 py-32 md:py-40 min-h-[calc(100vh-10rem)]"
>
  <!-- Supra-label (oxblood accent, editorial cadence) -->
  <span class="label-editorial mb-12" style="color: var(--color-accent);">
    R257 · 54 Eldridge St
  </span>

  <!-- Hero image with grain overlay + filmic filter -->
  <div class="grain w-full max-w-3xl mb-16">
    <img
      src="/images/rule257-coming-soon.jpg"
      alt="Rule 257 — 54 Eldridge St, NYC"
      width="1600"
      height="900"
      loading="eager"
      fetchpriority="high"
      class="w-full aspect-[16/9] object-cover"
      style="filter: saturate(0.9) contrast(1.05);"
    />
  </div>

  <!-- Editorial display heading (Fraunces, tighter optical) -->
  <h1
    class="font-serif text-[64px] md:text-[88px] font-normal leading-[1.02] text-[color:var(--color-ink)] text-center mb-8"
    style="letter-spacing: -0.025em;"
  >
    Coming Soon
  </h1>

  <!-- Oxblood rule (single-pixel accent line, restrained) -->
  <span
    aria-hidden="true"
    class="block w-12 h-px mb-8"
    style="background-color: var(--color-accent);"
  ></span>

  <!-- Tagline (Inter, generous leading, max readable measure) -->
  <p class="font-sans text-base md:text-lg leading-relaxed text-[color:var(--color-ink-muted)] max-w-xl text-center">
    Where art, fashion, design, and coffee converge. 54 Eldridge St, New York.
  </p>
</section>
```

Notes:
- The supra-label string "R257 · 54 Eldridge St" is derived from the address that already appears in the tagline + the site wordmark; it is not new content. If the executor judges this counts as new copy, fall back to using the address-fragment only: `54 ELDRIDGE ST`.
- Display heading size bumps from 56px to a responsive 64/88px for editorial impact; this is a visual treatment shift, not a token change. UI-SPEC §Typography Display is still 56px for the canonical role — Phase 1 home page is the one exception (record under ui_spec_deviations if not already implied).
- The `<img>` keeps its src, alt, width/height, loading, and fetchpriority attributes — only the wrapping container changes (adds `.grain`) and a CSS filter is added.

### B. `src/lib/components/SiteHeader.svelte` — retune only, no structural change

Open the file. Make ONLY the following surgical edits — do not touch the `<script>` block, do not change nav items, do not change the hamburger:

1. The bottom-border of the header currently uses `border-b border-[color:var(--color-hairline)]`. Keep this. The new hairline color (`#d9d8d4`) will be picked up automatically — no class change needed.
2. The "Sign in" button currently uses `bg-[color:var(--color-ink)]` + `text-[color:var(--color-paper)]`. Keep these. The new ink (#111110) and paper (#f4f3f0) will be picked up automatically.
3. **Add a 1px oxblood underline beneath the "Rule 257" wordmark on hover only** (subtle LES detail). Modify the wordmark `<a>` tag:
   - Add `group` to its classes.
   - Wrap its text content `Rule 257` in a `<span class="relative inline-block">...</span>`, then add an `::after` style via inline class or by adding a tracked `<span aria-hidden="true">` sibling. Implementation: change the inner from `Rule 257` to:
     ```
     <span class="relative inline-block">
       Rule 257
       <span
         aria-hidden="true"
         class="absolute left-0 -bottom-1 h-px w-0 transition-[width] duration-150 ease-out group-hover:w-full"
         style="background-color: var(--color-accent);"
       ></span>
     </span>
     ```
4. No other changes. MobileMenu structure stays as-is.

### C. `src/lib/components/SiteFooter.svelte` — retune only, no structural change

Open the file. Make ONLY the following surgical edits:

1. The three section headings ("Navigate", "Visit", "Follow") currently use the inline classes `font-sans text-[13px] font-normal uppercase tracking-wide text-[color:var(--color-ink-muted)]`. Replace `tracking-wide` with `tracking-[0.18em]` on all three headings to match the new editorial label cadence (the `.label-editorial` utility exists in app.css; you may apply that class instead — either works).
2. The top divider on the bottom row `border-t border-[color:var(--color-hairline)]` automatically gets the new cooler hairline. No class change needed.
3. No copy changes. No structural changes. No new columns.

### Final sanity for both files
- Run `npm run check` after all three files are edited.
- Start `npm run dev` and load `/` once to confirm no Tailwind compile errors and no runtime console errors. (The dev server doesn't need to remain running for verification — a single successful boot is enough.)

Why this approach: Token-first means most visual change comes "for free" via existing var() consumers. The +page.svelte rewrite is the only substantive visual restructure and stays within a single `<section>`. Header/Footer touch points are minimal and surgical to avoid regressing Phase 1's verified behavior (sticky scroll, mobile menu, hover underlines).
  </action>
  <verify>
    <automated>npm run check</automated>
    Manual sanity (executor):
    1. `npm run dev` then open http://localhost:5173/ — confirm:
       - Page background is a soft off-white (not pure white).
       - Hero image has visible film-grain texture over it (subtle, not noisy).
       - A small oxblood horizontal rule sits between "Coming Soon" and the tagline.
       - A small uppercase "R257 · 54 Eldridge St" label (oxblood) sits above the hero.
       - "Coming Soon" headline is larger and tighter than before.
       - Header wordmark gets a thin oxblood underline on hover.
       - Footer column labels look more spaced/editorial.
       - No console errors. No layout shift on reload.
    2. Toggle prefers-reduced-motion in OS settings — grain is still visible (it's static, not animated), no transitions fire.
  </verify>
  <done>
- `src/routes/+page.svelte` renders the editorial cover layout with supra-label, grain-wrapped hero, oversized tightened display heading, oxblood rule, and tagline. All original copy strings present and unchanged.
- `src/lib/components/SiteHeader.svelte` has the new oxblood hover underline under "Rule 257"; no nav items added/removed; sticky+blur scroll behavior preserved.
- `src/lib/components/SiteFooter.svelte` heading tracking updated to editorial cadence; structure preserved.
- `npm run check` exits 0.
- Dev server boots and renders / without console or compile errors.
  </done>
</task>

</tasks>

<verification>
- `npm run check` passes (TypeScript + Svelte check).
- `npm run dev` boots, `/` renders without errors.
- Visual: paper color reads cool/off-white; one oxblood accent appears (label + rule + header hover); hero shows film grain; display heading reads editorial; no second accent color anywhere on the page.
- All locked copy strings on / unchanged: "Coming Soon", "Where art, fashion, design, and coffee converge. 54 Eldridge St, New York."
- No new nav items, no new footer columns, no new sections.
- UI-SPEC deviations recorded in frontmatter (palette shift, --color-accent introduction, grain overlay, editorial type tightening, display-size exception on home).
</verification>

<success_criteria>
- [ ] `src/app.css` contains `--color-accent: #6e1f1f`, `--grain-svg`, `--grain-opacity`, `.grain` utility, and shifted neutral values.
- [ ] `src/routes/+page.svelte` renders editorial cover layout with grain-wrapped hero and oxblood detail; all original copy preserved.
- [ ] `src/lib/components/SiteHeader.svelte` and `src/lib/components/SiteFooter.svelte` consume new tokens; no structural changes.
- [ ] `npm run check` passes.
- [ ] No new dependencies added (no GSAP, no noise-library, no image processing — all CSS).
- [ ] Deviations from `01-UI-SPEC.md` are documented in this plan's frontmatter for downstream visibility.
</success_criteria>

<output>
After completion, create `.planning/quick/260512-jgf-tailor-site-aesthetics-to-match-rule257-/260512-jgf-SUMMARY.md` summarizing:
- Exact token values before -> after
- New tokens introduced (--color-accent, --grain-*)
- New utility (.grain, .label-editorial)
- UI-SPEC deviations (palette/accent/grain/display-size)
- Files touched and lines changed
- Any visual judgment calls made by the executor (e.g., whether to use mix-blend-mode multiply vs overlay on the grain)
</output>
