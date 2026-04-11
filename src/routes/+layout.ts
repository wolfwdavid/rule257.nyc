// Phase 1 Coming Soon page is static — prerender for both adapter-vercel (SSG pages)
// and adapter-static (writes prerendered HTML into build/). Plan 04's /account route
// will opt out with its own +page.ts that sets prerender = false.
export const prerender = true;
