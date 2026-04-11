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
