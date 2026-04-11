// Force client-side rendering — /account is auth-gated client-side via
// authClient.useSession() so it works in both adapter-vercel and adapter-static.
export const ssr = false;
export const prerender = false;
