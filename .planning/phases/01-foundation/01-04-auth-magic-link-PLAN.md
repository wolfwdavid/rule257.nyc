---
phase: 01-foundation
plan: 04
type: execute
wave: 3
depends_on:
  - "01-02"
  - "01-03"
files_modified:
  - package.json
  - src/lib/server/auth.ts
  - src/lib/auth-client.ts
  - src/lib/server/email/resend.ts
  - src/lib/server/email/templates/MagicLink.svelte
  - src/hooks.server.ts
  - src/routes/api/auth/[...all]/+server.ts
  - src/lib/components/AuthModal.svelte
  - src/routes/account/+page.svelte
  - src/routes/+layout.svelte
autonomous: true
requirements:
  - BRAND-06
user_setup:
  - service: resend
    why: "Transactional email delivery for magic links (CONTEXT.md D-27)"
    env_vars:
      - name: RESEND_API_KEY
        source: "Resend Dashboard > API Keys (https://resend.com/api-keys)"
    dashboard_config:
      - task: "Optional for Phase 1 dev: verify rule257.nyc domain in Resend to send to any address. For local testing, the Supabase local Inbucket (http://localhost:54324) catches all outbound mail regardless of provider and can substitute for Resend."
        location: "https://resend.com/domains"
must_haves:
  truths:
    - "User enters email in the auth modal and clicks 'Send magic link'; a magic link email is generated"
    - "In local dev with Inbucket, the magic link email is visible at http://localhost:54324 and clicking it logs the user in"
    - "After clicking the magic link, the user lands on /account and sees 'Welcome' + their email + a 'Sign out' button"
    - "Clicking 'Sign out' clears the session and redirects to /"
    - "Visiting /account while signed out redirects to / (client-side guard)"
    - "Closing the auth modal returns the user to wherever they were (D-33 preserves browse context)"
    - "Test user can sign up (first time) AND sign in (subsequent times) with the same magic link flow (D-25 unified)"
  artifacts:
    - path: "src/lib/server/auth.ts"
      provides: "Better Auth server config with magicLink plugin + Drizzle adapter + Resend sendMagicLink"
      contains: "betterAuth"
    - path: "src/lib/auth-client.ts"
      provides: "Better Auth svelte client with magicLinkClient plugin"
      contains: "createAuthClient"
    - path: "src/hooks.server.ts"
      provides: "Session population into locals + svelteKitHandler wrapping"
      contains: "svelteKitHandler"
    - path: "src/routes/api/auth/[...all]/+server.ts"
      provides: "Catch-all endpoint for Better Auth's REST API"
      contains: "auth.handler"
    - path: "src/lib/components/AuthModal.svelte"
      provides: "Magic link sign-in modal overlay with input → sending → success states"
      contains: "Send magic link"
    - path: "src/routes/account/+page.svelte"
      provides: "Auth-gated stub showing Welcome + email + Sign out"
      contains: "Welcome"
    - path: "src/lib/server/email/templates/MagicLink.svelte"
      provides: "Inline-styled email template for magic link"
      contains: "Rule 257"
  key_links:
    - from: "src/lib/server/auth.ts"
      to: "src/lib/server/db/index.ts"
      via: "drizzleAdapter(db, { provider: 'pg' })"
      pattern: "drizzleAdapter"
    - from: "src/lib/server/auth.ts"
      to: "Resend API"
      via: "resend.emails.send inside sendMagicLink callback"
      pattern: "resend.emails.send"
    - from: "src/lib/components/AuthModal.svelte"
      to: "src/lib/auth-client.ts"
      via: "authClient.signIn.magicLink({ email, callbackURL: '/account' })"
      pattern: "authClient.signIn.magicLink"
    - from: "src/lib/components/AuthModal.svelte"
      to: "src/lib/stores/auth-modal.svelte.ts"
      via: "bindable open state"
      pattern: "authModal"
    - from: "src/hooks.server.ts"
      to: "event.locals.user / event.locals.session"
      via: "auth.api.getSession then populate locals"
      pattern: "event.locals.user"
    - from: "src/routes/+layout.svelte"
      to: "src/lib/components/AuthModal.svelte"
      via: "mount AuthModal portal"
      pattern: "AuthModal"
---

<objective>
Wire the complete Better Auth 1.6 + magic link + Drizzle + Resend chain: server config with the magicLink plugin and drizzleAdapter, client config with magicLinkClient, SvelteKit hooks that populate `locals.user`/`locals.session` and delegate to `svelteKitHandler`, the catch-all `/api/auth/[...all]` server endpoint, the AuthModal component with three visual states (input → sending → success), the Svelte email template rendered via `svelte/server`, and the `/account` stub page with a client-side auth guard. Mount the AuthModal in the root layout so the SiteHeader's "Sign in" button opens it.

Purpose: Phase 1 success criterion #4 — a test user can sign up and log in via Better Auth on the web. This is the most integration-heavy plan in Phase 1: 7+ files, 3 cross-file contracts (client ↔ server ↔ hook), and a human-verifiable end-to-end flow (enter email → receive link → click → land on /account). Plan 05 smoke-tests everything together.

Output: A working magic-link sign-in that a user can exercise from the home page, with the `/account` stub rendering post-login.
</objective>

<deviations>
<!-- CONTEXT.md D-29 literal vs. plan's chosen approach. RESEARCH.md §Email explicitly instructs the planner to flag this substitution. -->

- **D-29 literal text:** "React Email templates for magic link emails. Must match brand typography (serif headings, sans body)."
- **Research-recommended substitute (01-RESEARCH.md §Email and §Alternatives Considered):** `svelte-email-tailwind` — the Svelte-native equivalent of React Email. Same intent: component-based email templates, server-rendered to HTML, passed to Resend.
- **This plan's chosen approach:** Hand-rolled Svelte 5 component (`src/lib/server/email/templates/MagicLink.svelte`) with ONLY inline styles, rendered to HTML via `svelte/server`'s `render(MagicLinkEmail, { props: { url, email } })`, destructured as `{ body: html }`, then passed to `resend.emails.send()`.
- **Rationale for the deviation:**
  1. Minimal Phase 1 approach — the magic link is the ONLY transactional email for Phase 1; adding a new library (`svelte-email-tailwind`) for one template is over-engineering.
  2. Avoids introducing React (`@react-email/components` + `@react-email/render`) as a transitive dependency into a pure Svelte codebase — RESEARCH.md §Alternatives Considered explicitly flags this tradeoff.
  3. `svelte/server`'s `render()` is already in SvelteKit's runtime; zero new dependencies.
  4. The component-based + server-rendered + brand-typography intent of D-29 is preserved; only the specific library identity is swapped.
- **Action required of the executor:** Surface this deviation explicitly in the 01-04-SUMMARY.md so the user can accept or reject it during `/gsd:verify-work`. If the user rejects, Phase 1 reopens Plan 04 Task 2 to swap the hand-rolled component for `svelte-email-tailwind`.
</deviations>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation/01-CONTEXT.md
@.planning/phases/01-foundation/01-RESEARCH.md
@.planning/phases/01-foundation/01-UI-SPEC.md
@.planning/phases/01-foundation/01-02-SUMMARY.md
@.planning/phases/01-foundation/01-03-SUMMARY.md
@src/lib/server/db/index.ts
@src/lib/server/db/schema.ts
@src/lib/stores/auth-modal.svelte.ts
@src/routes/+layout.svelte
@.env

<interfaces>
<!-- EXACT content from RESEARCH.md Pattern 3 and UI-SPEC Copywriting Contract. -->

Packages to install:
```
better-auth@^1.6.2
resend@^6.10.0
```

Locked copy (UI-SPEC.md Copywriting Contract — DO NOT IMPROVISE):
- Auth modal heading:                     `Sign in to Rule 257`
- Auth modal body:                        `Enter your email and we'll send you a link.`
- Auth modal email label:                 `Email`
- Auth modal email placeholder:           `you@example.com`
- Auth modal primary CTA:                 `Send magic link`
- Auth modal submitting state:            `Sending...`
- Auth modal success state heading:       `Check your email`
- Auth modal success state body:          `We sent a sign-in link to {email}. It expires in 10 minutes.`
- Auth modal success secondary:           `Use a different email`
- Auth modal error state:                 `We couldn't send that link. Check the email and try again.`
- Auth modal dismiss aria-label:          `Close sign-in`
- /account stub heading:                  `Welcome`
- /account stub body:                     `Signed in as {email}. Your loyalty dashboard is coming soon.`
- /account primary CTA:                   `Sign out`
- Magic link email subject:               `Your Rule 257 sign-in link`
- Magic link email heading:               `Rule 257`
- Magic link email body:                  `Click the link below to sign in to your account.`
- Magic link email CTA:                   `Sign in`
- Magic link email footer:                `This link expires in 10 minutes. If you didn't request it, you can safely ignore this email.`
- Magic link email address line:          `Rule 257 · 54 Eldridge St, New York, NY`

AuthModal visual contract (UI-SPEC Layout Shell Component Inventory):
- Centered card `max-w-md`
- Padding `p-12`
- Background `bg-[color:var(--color-paper)]`
- Border `border border-[color:var(--color-hairline)]`
- Serif heading (`font-serif text-[28px]`)
- Sans body (`font-sans text-base`)
- Full-width ink CTA (`bg-[color:var(--color-ink)] text-[color:var(--color-paper)]`)
- Backdrop `bg-[color:var(--color-ink)]/60`
- Enter transition: fade in backdrop 200ms + fade-up modal card 300ms ease-out 8px translate
- Exit transition: reverse 200ms
- State transition (input → success): fade old 150ms, fade new 150ms, modal height holds
- Submit spinner: text-only, button label swaps to `Sending...`, button disabled

src/lib/server/email/resend.ts — EXACT:
```typescript
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';

export const resend = new Resend(env.RESEND_API_KEY);
```

src/lib/server/auth.ts — follows RESEARCH.md Pattern 3 EXACTLY:
```typescript
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { render } from 'svelte/server';
import { db } from '$lib/server/db';
import { resend } from '$lib/server/email/resend';
import MagicLinkEmail from '$lib/server/email/templates/MagicLink.svelte';
import { env } from '$env/dynamic/private';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  plugins: [
    magicLink({
      expiresIn: 60 * 10,
      disableSignUp: false,
      sendMagicLink: async ({ email, url }) => {
        const { body: html } = render(MagicLinkEmail, { props: { url, email } });
        await resend.emails.send({
          from: 'Rule 257 <onboarding@resend.dev>',
          to: email,
          subject: 'Your Rule 257 sign-in link',
          html
        });
      }
    }),
    sveltekitCookies(getRequestEvent)
  ]
});
```
NOTE: The `from` address uses `onboarding@resend.dev` (Resend's shared dev sender, RESEARCH.md Pitfall #6). Production will need a verified rule257.nyc domain — documented in summary.

src/lib/auth-client.ts — EXACT:
```typescript
import { createAuthClient } from 'better-auth/svelte';
import { magicLinkClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [magicLinkClient()]
});
```

src/hooks.server.ts — EXACT (RESEARCH.md Pattern 3):
```typescript
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
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

src/routes/api/auth/[...all]/+server.ts — EXACT:
```typescript
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ request }) => auth.handler(request);
export const POST: RequestHandler = ({ request }) => auth.handler(request);

export const prerender = false;
```
The `prerender = false` is mandatory — adapter-static would otherwise try to prerender this and fail.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Install Better Auth + Resend, generate Better Auth schema, and wire server/client/hooks</name>
  <files>
    package.json,
    src/lib/server/auth.ts,
    src/lib/auth-client.ts,
    src/lib/server/email/resend.ts,
    src/lib/server/email/templates/MagicLink.svelte,
    src/hooks.server.ts,
    src/routes/api/auth/[...all]/+server.ts,
    src/lib/server/db/schema.ts
  </files>
  <read_first>
    package.json,
    src/lib/server/db/schema.ts,
    src/lib/server/db/index.ts,
    .env,
    .planning/phases/01-foundation/01-RESEARCH.md,
    .planning/phases/01-foundation/01-02-SUMMARY.md
  </read_first>
  <action>
    1. Install packages: `npm install better-auth@^1.6.2 resend@^6.10.0`

    2. Generate the canonical Better Auth schema and compare to what Plan 02 wrote. Run:
       `npx @better-auth/cli generate --output better-auth-schema.generated.ts` (flags may differ — if the CLI refuses, run `npx @better-auth/cli@latest generate` and let it ask for the output path).
       Compare the generated `user` / `session` / `account` / `verification` tables to what is currently in `src/lib/server/db/schema.ts`. If the Better Auth CLI emits additional columns (e.g., a new `updatedAt` or plugin-specific field), MERGE those additions into `src/lib/server/db/schema.ts` and re-run `npx drizzle-kit generate --name better_auth_sync` followed by `npx drizzle-kit migrate`. If the generated schema matches exactly, delete the temp file and do nothing.
       This step exists to prevent RESEARCH.md Pitfall #7 (Better Auth CLI schema drift).
       Delete `better-auth-schema.generated.ts` before committing.

    3. Write `src/lib/server/email/resend.ts` with the EXACT content from <interfaces>.

    4. Write `src/lib/server/email/templates/MagicLink.svelte`. It is a Svelte 5 component that takes `{ url, email }` via `$props()`. Use ONLY inline styles (email clients strip external CSS). Copy this EXACT template, adjusting nothing:
       ```svelte
       <script lang="ts">
         let { url, email }: { url: string; email: string } = $props();
       </script>

       <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 560px; margin: 0 auto; padding: 48px 24px; background: #fafafa; color: #0a0a0a;">
         <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; margin: 0 0 24px; line-height: 1.2;">
           Rule 257
         </h1>
         <p style="font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
           Click the link below to sign in to your account.
         </p>
         <p style="margin: 32px 0;">
           <a href={url} style="display: inline-block; padding: 14px 28px; background: #0a0a0a; color: #fafafa; text-decoration: none; font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;">
             Sign in
           </a>
         </p>
         <p style="font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 13px; color: #6b6b6b; line-height: 1.6; margin: 0;">
           This link expires in 10 minutes. If you didn't request it, you can safely ignore this email.
         </p>
         <p style="font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12px; color: #6b6b6b; margin-top: 48px; border-top: 1px solid #e5e5e5; padding-top: 16px;">
           Rule 257 &middot; 54 Eldridge St, New York, NY
         </p>
         <!-- email used for tracking context, not rendered -->
         <span style="display:none">{email}</span>
       </div>
       ```

    5. Write `src/lib/server/auth.ts` with the EXACT content from the <interfaces> block. Do not paraphrase.
       - Pay attention to the `render(MagicLinkEmail, { props: { url, email } })` call and destructure `{ body: html }` from it — `svelte/server`'s `render()` returns `{ body, head }`, not a plain string. If Better Auth 1.6.x changes the API, consult the installed Better Auth docs and adapt, but document the adaptation.

    6. Write `src/lib/auth-client.ts` with the EXACT content from <interfaces>.

    7. Write `src/hooks.server.ts` with the EXACT content from <interfaces>.

    8. Create the directory `src/routes/api/auth/[...all]/` and write `+server.ts` with the EXACT content from <interfaces> (including `export const prerender = false;` — mandatory for adapter-static).

    9. Run `npm run check` (svelte-check). Zero type errors allowed in the files touched by this plan.

    10. Run `npm run build:vercel` — must succeed.

    11. Run `npm run build:mobile` — must succeed. This is the critical test: if `+server.ts` doesn't have `prerender = false`, this build will fail with a prerender error. If it fails, fix and re-run.
  </action>
  <verify>
    <automated>test -d node_modules/better-auth && test -d node_modules/resend && test -f src/lib/server/auth.ts && grep -q 'betterAuth' src/lib/server/auth.ts && grep -q 'magicLink' src/lib/server/auth.ts && grep -q 'drizzleAdapter' src/lib/server/auth.ts && grep -q 'sveltekitCookies' src/lib/server/auth.ts && grep -q 'render(MagicLinkEmail' src/lib/server/auth.ts && grep -q 'resend.emails.send' src/lib/server/auth.ts && grep -q "subject: 'Your Rule 257 sign-in link'" src/lib/server/auth.ts && test -f src/lib/auth-client.ts && grep -q 'createAuthClient' src/lib/auth-client.ts && grep -q 'magicLinkClient' src/lib/auth-client.ts && test -f src/lib/server/email/resend.ts && grep -q 'new Resend' src/lib/server/email/resend.ts && test -f src/lib/server/email/templates/MagicLink.svelte && grep -q 'Rule 257' src/lib/server/email/templates/MagicLink.svelte && test -f src/hooks.server.ts && grep -q 'svelteKitHandler' src/hooks.server.ts && grep -q 'event.locals.user' src/hooks.server.ts && test -f 'src/routes/api/auth/[...all]/+server.ts' && grep -q 'prerender = false' 'src/routes/api/auth/[...all]/+server.ts' && grep -q 'auth.handler' 'src/routes/api/auth/[...all]/+server.ts' && npm run build:vercel && npm run build:mobile</automated>
  </verify>
  <acceptance_criteria>
    - `node_modules/better-auth/` exists
    - `node_modules/resend/` exists
    - File `src/lib/server/auth.ts` contains `betterAuth(`, `drizzleAdapter(db, { provider: 'pg' })`, `magicLink(`, `sveltekitCookies(getRequestEvent)`, `render(MagicLinkEmail`, `resend.emails.send(`
    - File `src/lib/server/auth.ts` uses `env.BETTER_AUTH_SECRET` and `env.BETTER_AUTH_URL`
    - File `src/lib/server/auth.ts` subject literal is `'Your Rule 257 sign-in link'`
    - File `src/lib/server/auth.ts` `expiresIn` is `60 * 10` (600 seconds / 10 minutes per UI-SPEC)
    - File `src/lib/auth-client.ts` contains `createAuthClient({` and `magicLinkClient()`
    - File `src/lib/server/email/resend.ts` contains `new Resend(env.RESEND_API_KEY)`
    - File `src/lib/server/email/templates/MagicLink.svelte` contains literal strings `Rule 257`, `Click the link below to sign in to your account.`, `This link expires in 10 minutes.`, `Rule 257 &middot; 54 Eldridge St, New York, NY`
    - File `src/lib/server/email/templates/MagicLink.svelte` uses ONLY inline styles — verified by `grep -v '<style' src/lib/server/email/templates/MagicLink.svelte | grep -c 'style='` returning > 5 AND `grep -c '<style' src/lib/server/email/templates/MagicLink.svelte` returning 0
    - File `src/hooks.server.ts` contains `svelteKitHandler({ event, resolve, auth, building })`
    - File `src/hooks.server.ts` populates `event.locals.user` AND `event.locals.session`
    - File `src/routes/api/auth/[...all]/+server.ts` contains `export const prerender = false;`
    - File `src/routes/api/auth/[...all]/+server.ts` exports GET and POST handlers that call `auth.handler(request)`
    - Command `npm run build:vercel` exits 0
    - Command `npm run build:mobile` exits 0
    - Temp file `better-auth-schema.generated.ts` does NOT exist (was cleaned up)
  </acceptance_criteria>
  <done>
    Better Auth server + client + hooks + email template + catch-all API route are all wired together. Both builds pass, proving the prerender configuration is correct for adapter-static.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Build AuthModal component and mount it in +layout.svelte; build /account stub</name>
  <files>
    src/lib/components/AuthModal.svelte,
    src/routes/+layout.svelte,
    src/routes/account/+page.svelte,
    src/routes/account/+page.ts
  </files>
  <read_first>
    src/routes/+layout.svelte,
    src/lib/stores/auth-modal.svelte.ts,
    src/lib/auth-client.ts,
    .planning/phases/01-foundation/01-UI-SPEC.md,
    .planning/phases/01-foundation/01-03-SUMMARY.md
  </read_first>
  <action>
    1. Create `src/lib/components/AuthModal.svelte` with these requirements:

       Imports:
       ```svelte
       <script lang="ts">
         import { authClient } from '$lib/auth-client';
         import { authModal } from '$lib/stores/auth-modal.svelte';
         import { fade, fly } from 'svelte/transition';
         import { cubicOut } from 'svelte/easing';
       </script>
       ```

       Local state (Svelte 5 runes):
       - `email = $state('')`
       - `status = $state<'input' | 'sending' | 'sent' | 'error'>('input')`
       - `errorMessage = $state('')`

       Derived `open` from the shared store:
       ```typescript
       let open = $derived(authModal.open);
       ```

       `handleSubmit(e: SubmitEvent)` function:
       - prevents default
       - sets `status = 'sending'`
       - calls `await authClient.signIn.magicLink({ email: email.trim(), callbackURL: '/account' })`
       - on `error`: sets status to `'error'`, stores error message, keeps the modal open
       - on success: sets status to `'sent'`

       `handleClose()` function: calls `authModal.close()` and resets local state (email='', status='input', errorMessage='').

       `handleUseDifferentEmail()` function: resets email='' and status='input'.

       Keyboard handler: `$effect` that adds a `keydown` listener on `window` when `open === true`. On `Escape`, call `handleClose()`.

       Template (when `open === true`):
       - Outer: `<div role="dialog" aria-modal="true" aria-labelledby="auth-modal-heading" class="fixed inset-0 z-50 flex items-center justify-center" transition:fade={{ duration: 200 }}>` — the backdrop transition.
       - Backdrop: `<div class="absolute inset-0 bg-[color:var(--color-ink)]/60" onclick={handleClose} aria-hidden="true"></div>`
       - Card: `<div class="relative w-full max-w-md mx-6 p-12 bg-[color:var(--color-paper)] border border-[color:var(--color-hairline)]" transition:fly={{ y: 8, duration: 300, easing: cubicOut }} onclick|stopPropagation>` (use Svelte 5 syntax for stopPropagation — `onclick={(e) => e.stopPropagation()}`; the `|stopPropagation` modifier is Svelte 4).
       - Close button top right: `aria-label="Close sign-in"`, min-h-11 min-w-11, calls `handleClose()`.
       - Input state (when `status === 'input' || status === 'sending'`):
         - `<h2 id="auth-modal-heading" class="font-serif text-[28px] font-normal leading-tight">Sign in to Rule 257</h2>`
         - `<p class="font-sans text-base leading-relaxed mt-4 text-[color:var(--color-ink-muted)]">Enter your email and we'll send you a link.</p>`
         - `<form onsubmit={handleSubmit} class="mt-8 space-y-4">`
           - `<label for="auth-email" class="block font-sans text-[13px] uppercase tracking-wide text-[color:var(--color-ink-muted)]">Email</label>`
           - `<input id="auth-email" type="email" required bind:value={email} placeholder="you@example.com" aria-describedby={status === 'error' ? 'auth-error' : undefined} class="w-full border-b border-[color:var(--color-hairline)] bg-transparent py-3 font-sans text-base focus:outline-none focus:border-[color:var(--color-ink)]" />`
           - `<button type="submit" disabled={status === 'sending'} class="w-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] py-4 font-sans text-[13px] uppercase tracking-wide min-h-11 transition-opacity duration-150 ease-out hover:opacity-85 disabled:opacity-50">{status === 'sending' ? 'Sending...' : 'Send magic link'}</button>`
           - If `status === 'error'`: `<p id="auth-error" role="alert" class="font-sans text-sm text-[color:var(--color-destructive)]">We couldn't send that link. Check the email and try again.</p>`
         - `</form>`
       - Success state (when `status === 'sent'`):
         - `<h2 id="auth-modal-heading" class="font-serif text-[28px] font-normal leading-tight">Check your email</h2>`
         - `<p class="font-sans text-base leading-relaxed mt-4 text-[color:var(--color-ink-muted)]" aria-live="polite">We sent a sign-in link to <strong class="text-[color:var(--color-ink)]">{email}</strong>. It expires in 10 minutes.</p>`
         - `<button type="button" onclick={handleUseDifferentEmail} class="mt-8 font-sans text-[13px] uppercase tracking-wide text-[color:var(--color-ink)] underline">Use a different email</button>`

    2. Overwrite `src/routes/+layout.svelte` to ALSO import and mount AuthModal. Add to the imports: `import AuthModal from '$lib/components/AuthModal.svelte';`. After the closing `</SafeArea>` (or inside it, at the bottom), add `<AuthModal />`. The modal is a single global portal — there's only one instance and it reads from the shared store.

       If Plan 03 used the snippet-shadowing pattern for SafeArea children, adapt carefully. The layout file should look approximately:
       ```svelte
       <script lang="ts">
         import '../app.css';
         import SafeArea from '$lib/components/SafeArea.svelte';
         import SiteHeader from '$lib/components/SiteHeader.svelte';
         import SiteFooter from '$lib/components/SiteFooter.svelte';
         import AuthModal from '$lib/components/AuthModal.svelte';

         let { children: pageContent } = $props();
       </script>

       <SafeArea>
         {#snippet children()}
           <div class="flex min-h-dvh flex-col">
             <SiteHeader />
             <main class="flex-1">
               {@render pageContent()}
             </main>
             <SiteFooter />
           </div>
         {/snippet}
       </SafeArea>

       <AuthModal />
       ```
       The `AuthModal` sits OUTSIDE the SafeArea because its fixed-position backdrop should cover the whole viewport including safe-area insets.

    3. Create `src/routes/account/+page.ts`:
       ```typescript
       // Force client-side rendering — /account is auth-gated client-side via authClient.useSession()
       // so it works in both adapter-vercel and adapter-static.
       export const ssr = false;
       export const prerender = false;
       ```

    4. Create `src/routes/account/+page.svelte`. It must:
       - Import `authClient` and `goto` from `$app/navigation`
       - Use `const session = authClient.useSession()` (per RESEARCH.md Code Examples)
       - `$effect`: if `$session.data === null`, `goto('/')`
       - Loading state: if `$session.isPending`, render `<p class="p-8 font-sans text-[color:var(--color-ink-muted)]">Loading...</p>`
       - Signed-in state: render
         - `<h1 class="font-serif text-[28px] font-normal leading-tight">Welcome</h1>`
         - `<p class="font-sans text-base leading-relaxed mt-4 text-[color:var(--color-ink-muted)]">Signed in as <strong class="text-[color:var(--color-ink)]">{$session.data.user.email}</strong>. Your loyalty dashboard is coming soon.</p>`
         - `<button onclick={handleSignOut} class="mt-12 bg-[color:var(--color-ink)] text-[color:var(--color-paper)] px-8 py-4 font-sans text-[13px] uppercase tracking-wide min-h-11 transition-opacity duration-150 ease-out hover:opacity-85">Sign out</button>`
       - `handleSignOut` async function: `await authClient.signOut(); goto('/');`
       - Wrap the signed-in content in `<section class="px-6 py-32 md:py-40 max-w-3xl mx-auto" aria-label="Your account">`

    5. Run `npm run check` — zero type errors.
    6. Run `npm run build:vercel` — must succeed.
    7. Run `npm run build:mobile` — must succeed.
    8. Verify that `build/account/index.html` (or similar) exists after `build:mobile` OR the fallback `build/index.html` covers /account via the SPA fallback — either is acceptable because `+page.ts` set `ssr = false`.
  </action>
  <verify>
    <automated>test -f src/lib/components/AuthModal.svelte && grep -q "Sign in to Rule 257" src/lib/components/AuthModal.svelte && grep -q "Send magic link" src/lib/components/AuthModal.svelte && grep -q "Check your email" src/lib/components/AuthModal.svelte && grep -q "Use a different email" src/lib/components/AuthModal.svelte && grep -q "authClient.signIn.magicLink" src/lib/components/AuthModal.svelte && grep -q "callbackURL: '/account'" src/lib/components/AuthModal.svelte && grep -q 'role="dialog"' src/lib/components/AuthModal.svelte && grep -q 'aria-modal="true"' src/lib/components/AuthModal.svelte && grep -q "authModal.close" src/lib/components/AuthModal.svelte && grep -q 'import AuthModal' src/routes/+layout.svelte && grep -q '<AuthModal' src/routes/+layout.svelte && test -f src/routes/account/+page.ts && grep -q 'ssr = false' src/routes/account/+page.ts && test -f src/routes/account/+page.svelte && grep -q ">Welcome<" src/routes/account/+page.svelte && grep -q "Sign out" src/routes/account/+page.svelte && grep -q "authClient.useSession" src/routes/account/+page.svelte && grep -q "authClient.signOut" src/routes/account/+page.svelte && npm run build:vercel && npm run build:mobile</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/components/AuthModal.svelte` contains ALL locked copy strings: `Sign in to Rule 257`, `Enter your email and we'll send you a link.`, `Email`, `you@example.com`, `Send magic link`, `Sending...`, `Check your email`, `We sent a sign-in link to`, `It expires in 10 minutes.`, `Use a different email`, `We couldn't send that link. Check the email and try again.`, `Close sign-in`
    - File `src/lib/components/AuthModal.svelte` contains `role="dialog"` AND `aria-modal="true"` AND `aria-labelledby="auth-modal-heading"`
    - File `src/lib/components/AuthModal.svelte` calls `authClient.signIn.magicLink({ email:` with `callbackURL: '/account'`
    - File `src/lib/components/AuthModal.svelte` imports `authModal` from `$lib/stores/auth-modal.svelte`
    - File `src/lib/components/AuthModal.svelte` imports `{ fade, fly }` from `svelte/transition`
    - File `src/lib/components/AuthModal.svelte` uses `$state` and `$derived` (Svelte 5 runes)
    - File `src/lib/components/AuthModal.svelte` handles `Escape` key to close
    - File `src/lib/components/AuthModal.svelte` has a `Close sign-in` aria-label on the close button
    - File `src/lib/components/AuthModal.svelte` CTA button uses `bg-[color:var(--color-ink)]` and `text-[color:var(--color-paper)]` AND has `min-h-11`
    - File `src/routes/+layout.svelte` contains `import AuthModal from '$lib/components/AuthModal.svelte'` AND `<AuthModal />` in the template
    - File `src/routes/account/+page.ts` contains `export const ssr = false;` AND `export const prerender = false;`
    - File `src/routes/account/+page.svelte` contains literal strings `Welcome`, `Signed in as`, `Your loyalty dashboard is coming soon.`, `Sign out`
    - File `src/routes/account/+page.svelte` calls `authClient.useSession()`
    - File `src/routes/account/+page.svelte` calls `authClient.signOut()` AND `goto('/')`
    - File `src/routes/account/+page.svelte` has a `$effect` that redirects to `/` when `session.data === null`
    - Command `npm run build:vercel` exits 0
    - Command `npm run build:mobile` exits 0
  </acceptance_criteria>
  <done>
    AuthModal is a global portal mounted once in +layout.svelte. Clicking the SiteHeader "Sign in" button opens it via the shared runes store. Submitting the form calls Better Auth's magicLink endpoint. The /account route loads client-side, reads `authClient.useSession()`, redirects to / when signed out, and shows Welcome + email + Sign out when signed in. Phase 1 success criterion #4 is met end-to-end.
  </done>
</task>

</tasks>

<verification>
- [ ] `test -f src/lib/server/auth.ts && test -f src/lib/auth-client.ts && test -f src/hooks.server.ts`
- [ ] `test -f 'src/routes/api/auth/[...all]/+server.ts'`
- [ ] `test -f src/lib/components/AuthModal.svelte && test -f src/routes/account/+page.svelte`
- [ ] `grep -q 'prerender = false' 'src/routes/api/auth/[...all]/+server.ts'`
- [ ] `grep -q 'ssr = false' src/routes/account/+page.ts`
- [ ] `npm run build:vercel && npm run build:mobile` both succeed
- [ ] AuthModal is mounted in +layout.svelte
</verification>

<success_criteria>
1. Better Auth server config wires drizzleAdapter + magicLink plugin + Resend sendMagicLink callback
2. Better Auth client config includes magicLinkClient plugin
3. hooks.server.ts populates event.locals.user/session before passing through svelteKitHandler
4. /api/auth/[...all] catch-all server endpoint exists with prerender = false
5. AuthModal renders all three states (input/sending/success) with EXACTLY the locked UI-SPEC copy
6. /account stub redirects signed-out users to / and shows Welcome + email + Sign out button when signed in
7. Both adapter-vercel and adapter-static builds succeed (no prerender errors on the auth catch-all)
8. Phase 1 success criterion #4 is code-complete; Plan 05 smoke-tests it end-to-end
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-04-SUMMARY.md` documenting:
- **D-29 substitution decision (REQUIRED):** Explicitly record that this plan substituted a hand-rolled Svelte 5 email component + `svelte/server` `render()` in place of CONTEXT.md D-29's literal "React Email templates" (and in place of RESEARCH.md's recommended `svelte-email-tailwind`). State the rationale (see `<deviations>` block above) and ask the user during `/gsd:verify-work` to accept or reject the substitution.
- Better Auth CLI drift analysis result (schema matched or additions merged)
- The exact `from` address used for dev (probably `onboarding@resend.dev`) and the plan to verify rule257.nyc for production
- Whether `svelte/server`'s `render()` returned `{ body, head }` as expected or required a different destructure
- Any TypeScript friction with $bindable or $derived between AuthModal and the store
- Confirmation that build:mobile succeeded (no prerender errors on the [...all] route)
- A note that end-to-end smoke testing (entering an email, receiving the link, clicking it, landing on /account) happens in Plan 05
</output>
</content>
</invoke>