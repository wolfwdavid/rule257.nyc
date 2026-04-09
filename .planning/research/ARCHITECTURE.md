# Architecture Patterns

**Domain:** Creative cafe brand/portfolio website + loyalty mobile app
**Researched:** 2026-04-09
**Confidence:** HIGH

## Recommended Architecture

```
                    +-------------------+
                    |   Supabase Cloud   |
                    |  (PostgreSQL +     |
                    |   Auth + Storage   |
                    |   + Realtime)      |
                    +--------+----------+
                             |
              +--------------+--------------+
              |                             |
    +---------v----------+     +------------v-----------+
    |   SvelteKit Web    |     |   SvelteKit Static     |
    |   (adapter-vercel) |     |   (adapter-static)     |
    |   SSR + Prerender  |     |   Fully prerendered    |
    +--------------------+     +------------+-----------+
              |                             |
              |                  +----------+----------+
              |                  |                     |
              |           +------v------+    +---------v-----+
              |           | Capacitor   |    | Capacitor     |
              |           | iOS (SPM)   |    | Android       |
              |           +-------------+    +---------------+
              |
    +---------v----------+
    |   Vercel Edge      |
    |   CDN + Functions  |
    +--------------------+
```

### Single Codebase, Dual Build Strategy

The same SvelteKit source code produces two outputs:

1. **Web build** (adapter-vercel): SSR for SEO-critical pages (portfolio, events, menu, location). Deployed to Vercel with edge functions for API routes.

2. **Mobile build** (adapter-static): Fully prerendered static HTML/CSS/JS. Bundled into Capacitor 8 native shells for iOS (via SPM) and Android. No server at runtime -- all API calls go directly to Supabase.

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `src/routes/(site)/` | Brand portfolio pages (gallery, menu, events, artists, location) | Supabase Storage (images), Supabase DB (events) |
| `src/routes/(app)/` | Loyalty app pages (dashboard, scan, rewards, profile) | Supabase Auth, Supabase DB (points, transactions, rewards) |
| `src/routes/(admin)/` | Staff-facing admin (generate QR codes, confirm transactions, manage rewards) | Supabase DB with admin RLS policies |
| `src/lib/server/` | Server-only code: auth hooks, Supabase server client, admin guards | Supabase via @supabase/ssr |
| `src/lib/components/` | Shared UI components (gallery, cards, buttons, QR display) | Props/events only, no direct DB access |
| `src/lib/stores/` | Client-side state (user session, point balance, scan state) | Svelte 5 Runes ($state, $derived). Supabase realtime subscriptions. |
| `src/lib/db/` | Drizzle ORM schema, migrations, type exports | Supabase PostgreSQL |
| `ios/` + `android/` | Capacitor native projects | SvelteKit static build via webDir |

### Data Flow

**Brand site visitor (web):**
```
Browser --> Vercel Edge --> SvelteKit SSR --> Supabase (read gallery/events)
                                          --> Prerendered HTML (menu, location)
```

**Loyalty user earning points (mobile):**
```
User opens app --> Capacitor native shell --> SvelteKit SPA
  --> Tap "Scan" --> ML Kit camera opens --> Scans QR code
  --> Supabase RPC function --> Validates QR + adds points
  --> Realtime subscription updates balance --> Haptic feedback
```

**Staff confirming purchase (admin):**
```
Staff opens admin --> Generates unique QR code for transaction
  --> Customer scans QR --> Transaction validated + points awarded
  --> QR code invalidated (single-use)
```

## Patterns to Follow

### Pattern 1: Route Groups for Web vs App

**What:** Use SvelteKit route groups `(site)` and `(app)` to separate brand portfolio from loyalty app with different layouts.
**When:** Always. This is the architectural backbone.

```
src/routes/
  (site)/
    +layout.svelte          # Brand layout: header, footer, nav
    +page.svelte            # Homepage
    gallery/+page.svelte
    menu/+page.svelte
    events/+page.svelte
  (app)/
    +layout.svelte          # App layout: bottom tab bar, no footer
    dashboard/+page.svelte
    scan/+page.svelte
    rewards/+page.svelte
    profile/+page.svelte
  (admin)/
    +layout.server.ts       # Auth guard: admin role only
    +layout.svelte
    transactions/+page.svelte
```

### Pattern 2: Platform-Aware Feature Gating

**What:** Use `Capacitor.isNativePlatform()` to conditionally enable native features.
**When:** Any feature that differs between web and native (QR scanning, haptics, status bar).

```typescript
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

// In scan page: use ML Kit on native, html5-qrcode on web
if (isNative) {
  const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning');
  // Native camera scan
} else {
  // Web-based QR scanner fallback
}
```

### Pattern 3: Supabase RPC for Atomic Loyalty Transactions

**What:** Use PostgreSQL functions called via Supabase RPC for point operations instead of client-side multi-step updates.
**When:** Any operation that must be atomic: earn points, redeem rewards, validate QR codes.

```sql
CREATE OR REPLACE FUNCTION earn_points(
  p_user_id UUID,
  p_qr_token TEXT,
  p_amount INT
) RETURNS JSON AS $$
DECLARE
  v_transaction RECORD;
BEGIN
  -- Validate QR token (single-use check)
  -- Deduct/invalidate QR token
  -- Add points to user balance
  -- Create transaction record
  -- Return new balance
  RETURN json_build_object('new_balance', ...);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Pattern 4: Adapter Switching via Environment

**What:** Use environment variables to swap adapters for web vs mobile builds.
**When:** Build time. CI/CD builds both variants.

```javascript
// svelte.config.js
import adapterVercel from '@sveltejs/adapter-vercel';
import adapterStatic from '@sveltejs/adapter-static';

const isMobileBuild = process.env.BUILD_TARGET === 'mobile';

export default {
  kit: {
    adapter: isMobileBuild
      ? adapterStatic({ fallback: 'index.html' })
      : adapterVercel(),
    ...(isMobileBuild && {
      output: { bundleStrategy: 'single' }
    })
  }
};
```

### Pattern 5: Realtime Point Balance

**What:** Subscribe to Supabase Realtime for instant point balance updates after transactions.
**When:** User dashboard and any page showing point balance.

```typescript
// src/lib/stores/loyalty.svelte.ts
import { supabase } from '$lib/supabase';

let balance = $state(0);

supabase
  .channel('loyalty')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'user_profiles',
    filter: `id=eq.${userId}`
  }, (payload) => {
    balance = payload.new.point_balance;
  })
  .subscribe();
```

### Pattern 6: Auth Divergence -- Web vs Native

**What:** Two different Supabase client initialization paths for web (cookie-based via @supabase/ssr) and native (token-based via @supabase/supabase-js with Preferences storage).
**When:** Always. Auth is the most critical divergence between platforms.

```typescript
// Web: hooks.server.ts
import { createServerClient } from '@supabase/ssr';

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(URL, KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' });
        });
      }
    }
  });
  return resolve(event);
};

// Native: direct client with Preferences storage
import { createClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';

const supabase = createClient(URL, KEY, {
  auth: {
    storage: {
      getItem: async (key) => (await Preferences.get({ key })).value,
      setItem: async (key, value) => await Preferences.set({ key, value }),
      removeItem: async (key) => await Preferences.remove({ key })
    }
  }
});
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client-Side Point Manipulation

**What:** Updating point balances via multiple client-side Supabase calls.
**Why bad:** Race conditions. Two scans read the same balance and one update is lost. Also allows client-side tampering.
**Instead:** Supabase RPC functions with SECURITY DEFINER. All point math in PostgreSQL.

### Anti-Pattern 2: Shared Layout for Web and App

**What:** Using a single root layout for both the brand site and loyalty app.
**Why bad:** Completely different navigation paradigms. Layout thrashing and conditional spaghetti.
**Instead:** Route groups with separate layouts.

### Anti-Pattern 3: Storing Images in Database

**What:** Image binary data or base64 in PostgreSQL columns.
**Why bad:** Bloats database, slow queries, no CDN caching.
**Instead:** Supabase Storage for dynamic images. @sveltejs/enhanced-img for static images.

### Anti-Pattern 4: API Routes for Mobile

**What:** Mobile app calling SvelteKit server routes (`/api/*`).
**Why bad:** Static build has no server. Routes don't exist.
**Instead:** Mobile calls Supabase directly. Server routes only for web SSR.

### Anti-Pattern 5: Monolithic Capacitor Config

**What:** Same capacitor.config.ts for dev and production.
**Why bad:** Dev config has `server.url` pointing to local dev server. If shipped to production, app breaks.
**Instead:** Strip server config during production builds or use environment-specific configs.

## Database Schema

```sql
-- Core user profile (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  points_balance INTEGER DEFAULT 0 NOT NULL,
  lifetime_points INTEGER DEFAULT 0 NOT NULL,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  qr_code_id TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Points transaction ledger (append-only)
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'redeem', 'bonus', 'adjust')),
  description TEXT,
  issued_by UUID REFERENCES profiles(id),
  scan_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rewards catalog
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  stock INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Redemption records
CREATE TABLE redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  reward_id UUID REFERENCES rewards(id) NOT NULL,
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired')),
  redemption_code TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES profiles(id)
);

-- Scan tokens (anti-replay for QR-based earning)
CREATE TABLE scan_tokens (
  token TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  points_value INTEGER NOT NULL DEFAULT 1,
  used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES profiles(id),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '5 minutes'),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Database | Supabase Free tier. Single PostgreSQL instance. | Supabase Pro ($25/mo). Indexes on user_id, timestamps. | Enterprise. Read replicas, pgBouncer. Partition transactions by date. |
| Auth | Better Auth on Supabase. No issues. | Add rate limiting on login attempts. | Dedicated auth service or Supabase Auth with custom claims. |
| Image storage | Supabase Storage free (1GB). Static images via enhanced-img. | Supabase Storage Pro. CDN handles reads. | Cloudflare Images or Imgix. |
| QR scanning | Negligible load. | Same. Indexed token table. | Shard tokens. Redis cache for hot lookups. |
| Realtime | Free tier: 200 concurrent connections. | Pro for more connections. Polling fallback. | Evaluate if realtime needed or optimistic UI suffices. |

## Sources

- [SvelteKit Route Groups](https://svelte.dev/docs/kit/routing) -- HIGH confidence
- [Capacitor.isNativePlatform()](https://capacitorjs.com/docs/core-apis/web) -- HIGH confidence
- [Supabase RPC Functions](https://supabase.com/docs/reference/javascript/rpc) -- HIGH confidence
- [SvelteKit Adapter Docs](https://svelte.dev/docs/kit/adapters) -- HIGH confidence
- [Supabase Realtime](https://supabase.com/docs/guides/realtime) -- HIGH confidence
- [Supabase SSR Auth for SvelteKit](https://supabase.com/docs/guides/auth/server-side/sveltekit) -- HIGH confidence
- [Capacitor 8 Announcement](https://ionic.io/blog/announcing-capacitor-8) -- HIGH confidence

---
*Architecture patterns for: Rule 257 NYC*
*Researched: 2026-04-09*
