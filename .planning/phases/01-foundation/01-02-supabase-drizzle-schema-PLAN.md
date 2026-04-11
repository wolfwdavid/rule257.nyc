---
phase: 01-foundation
plan: 02
type: execute
wave: 2
depends_on:
  - "01-01"
files_modified:
  - package.json
  - drizzle.config.ts
  - src/lib/server/db/index.ts
  - src/lib/server/db/schema.ts
  - supabase/config.toml
  - supabase/migrations/.gitkeep
  - .env
autonomous: true
requirements:
  - BRAND-06
user_setup:
  - service: docker-desktop
    why: "Supabase CLI requires Docker Desktop to run local Postgres containers"
    dashboard_config:
      - task: "Ensure Docker Desktop is installed and running before `npx supabase start`"
        location: "https://www.docker.com/products/docker-desktop/"
must_haves:
  truths:
    - "npx supabase start boots a local Postgres on port 54322 without errors"
    - "drizzle-kit generate produces a SQL migration under supabase/migrations/"
    - "drizzle-kit migrate applies the migration to local Postgres successfully"
    - "After migration, the database contains tables: user, session, account, verification, profile, point_transaction, reward, redemption, scan_token (9 tables total: 4 Better Auth + 5 loyalty)"
    - "drizzle client connects with prepare: false (Supabase transaction pooler safety)"
  artifacts:
    - path: "src/lib/server/db/schema.ts"
      provides: "Drizzle schema for Better Auth + loyalty tables"
      contains: "pgTable(\"profile\""
      min_lines: 100
    - path: "src/lib/server/db/index.ts"
      provides: "Drizzle client with postgres.js driver and prepare: false"
      contains: "prepare: false"
    - path: "drizzle.config.ts"
      provides: "drizzle-kit config pointing at supabase/migrations"
      contains: "supabase/migrations"
    - path: "supabase/config.toml"
      provides: "Local Supabase CLI config"
      contains: "[db]"
  key_links:
    - from: "src/lib/server/db/index.ts"
      to: "env.DATABASE_URL"
      via: "postgres(env.DATABASE_URL, { prepare: false })"
      pattern: "prepare: false"
    - from: "drizzle.config.ts"
      to: "src/lib/server/db/schema.ts"
      via: "schema field"
      pattern: "schema.*src/lib/server/db/schema"
    - from: "src/lib/server/db/schema.ts"
      to: "profile.userId -> user.id"
      via: "references() with cascade delete"
      pattern: "references\\(\\(\\) => user.id"
---

<objective>
Initialize local Supabase (Postgres 15 via Docker), wire Drizzle ORM with the postgres.js driver (with the Supabase-specific `prepare: false` flag), define the full schema for Better Auth tables (user, session, account, verification) AND the five loyalty tables (profile, point_transaction, reward, redemption, scan_token), generate the initial migration via drizzle-kit, and apply it to the local database.

Purpose: This is Phase 1 success criterion #3. Every loyalty feature in Phase 3 and every auth flow in Plan 04 reads from these tables. The schema must be flexible enough that Phase 3's undecided reward economics (points-per-dollar vs buy-8-get-1-free) can be implemented without a migration rewrite.

Output: A running local Postgres with 9 tables, a working Drizzle client, a migration file checked into `supabase/migrations/`, and a `.env` file populated with local DATABASE_URL and Supabase keys.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-foundation/01-RESEARCH.md
@.planning/phases/01-foundation/01-CONTEXT.md
@package.json
@.env.example
@.planning/phases/01-foundation/01-01-SUMMARY.md

<interfaces>
<!-- EXACT values to write. Copy verbatim. -->

Packages to install (runtime):
```
drizzle-orm@^0.45.2
postgres@^3.4.9
```

Packages to install (dev):
```
drizzle-kit@^0.31.10
```

drizzle.config.ts — EXACT:
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/server/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true
});
```

src/lib/server/db/index.ts — EXACT (RESEARCH.md Pitfall #8 — prepare: false is non-negotiable):
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const queryClient = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(queryClient, { schema });
```

src/lib/server/db/schema.ts — EXACT (RESEARCH.md Pattern 5, verbatim):
```typescript
import {
  pgTable, text, integer, boolean, timestamp, uuid, check
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---------- Better Auth tables ----------
// These match what `npx @better-auth/cli generate` produces for the magicLink plugin.
// Plan 04 will re-run the CLI as a sanity check; this is the canonical starting shape.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// ---------- Rule 257 loyalty tables ----------

export const profile = pgTable('profile', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }).unique(),
  displayName: text('display_name'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  pointsBalance: integer('points_balance').notNull().default(0),
  lifetimePoints: integer('lifetime_points').notNull().default(0),
  role: text('role').notNull().default('customer'),
  qrCodeId: uuid('qr_code_id').notNull().defaultRandom().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (t) => [
  check('role_check', sql`${t.role} IN ('customer', 'staff', 'admin')`)
]);

export const pointTransaction = pgTable('point_transaction', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profile.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  issuedBy: uuid('issued_by').references(() => profile.id),
  scanToken: text('scan_token').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow()
}, (t) => [
  check('type_check', sql`${t.type} IN ('earn', 'redeem', 'bonus', 'adjust')`)
]);

export const reward = pgTable('reward', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  pointsCost: integer('points_cost').notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  stock: integer('stock'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

export const redemption = pgTable('redemption', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profile.id, { onDelete: 'cascade' }),
  rewardId: uuid('reward_id').notNull().references(() => reward.id),
  pointsSpent: integer('points_spent').notNull(),
  status: text('status').notNull().default('pending'),
  redemptionCode: uuid('redemption_code').notNull().defaultRandom().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  fulfilledAt: timestamp('fulfilled_at'),
  fulfilledBy: uuid('fulfilled_by').references(() => profile.id)
}, (t) => [
  check('status_check', sql`${t.status} IN ('pending', 'fulfilled', 'expired')`)
]);

export const scanToken = pgTable('scan_token', {
  token: uuid('token').primaryKey().defaultRandom(),
  createdBy: uuid('created_by').notNull().references(() => profile.id),
  pointsValue: integer('points_value').notNull().default(1),
  used: boolean('used').notNull().default(false),
  usedBy: uuid('used_by').references(() => profile.id),
  expiresAt: timestamp('expires_at').notNull().default(sql`now() + interval '5 minutes'`),
  createdAt: timestamp('created_at').notNull().defaultNow()
});
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Install Drizzle + postgres.js, initialize local Supabase, and create .env</name>
  <files>
    package.json,
    supabase/config.toml,
    supabase/migrations/.gitkeep,
    .env,
    drizzle.config.ts
  </files>
  <read_first>
    package.json,
    .env.example,
    .planning/phases/01-foundation/01-RESEARCH.md,
    .planning/phases/01-foundation/01-01-SUMMARY.md
  </read_first>
  <action>
    1. Install runtime deps: `npm install drizzle-orm@^0.45.2 postgres@^3.4.9`
    2. Install dev deps: `npm install -D drizzle-kit@^0.31.10`
    3. Install the Supabase CLI as a dev dep so team members don't need a global install: `npm install -D supabase@^2.84.0` (or whatever is latest in the 2.84+ line). If the npm package `supabase` fails to install, fall back to requiring the global CLI and document it in the summary.
    4. Run `npx supabase init` (answer `N` if it asks about generating VS Code settings, `N` for IntelliJ, `N` for Deno functions — we only need the bare config).
       This creates `supabase/config.toml` and `supabase/seed.sql`.
    5. Edit `supabase/config.toml` (minimal changes — leave most defaults). Confirm the `[db]` section has `port = 54322` (default). Confirm `[api]` has `port = 54321` (default). No other edits needed.
    6. Create `supabase/migrations/` directory with a `.gitkeep` file so it is tracked even when empty:
       ```
       mkdir -p supabase/migrations
       touch supabase/migrations/.gitkeep
       ```
    7. Write `drizzle.config.ts` with the EXACT content from <interfaces>.
    8. Create `.env` (NOT `.env.example` — that already exists) with these EXACT values:
       ```
       DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
       BETTER_AUTH_SECRET=dev-secret-change-in-prod-at-least-32-chars-long
       BETTER_AUTH_URL=http://localhost:5173
       RESEND_API_KEY=re_placeholder_for_plan_04
       PUBLIC_SUPABASE_URL=http://localhost:54321
       PUBLIC_SUPABASE_ANON_KEY=placeholder_filled_after_supabase_start
       ```
       After `supabase start` runs in Task 2, we'll update PUBLIC_SUPABASE_ANON_KEY from the status output.
    9. Confirm `.env` is gitignored by running `git check-ignore .env` — it should return `.env` and exit 0. If not, add `.env` to `.gitignore`.
  </action>
  <verify>
    <automated>test -f drizzle.config.ts && grep -q "schema: './src/lib/server/db/schema.ts'" drizzle.config.ts && grep -q "out: './supabase/migrations'" drizzle.config.ts && test -f supabase/config.toml && grep -q '\[db\]' supabase/config.toml && test -d supabase/migrations && test -f .env && grep -q 'DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres' .env && test -d node_modules/drizzle-orm && test -d node_modules/drizzle-kit && test -d node_modules/postgres && git check-ignore .env</automated>
  </verify>
  <acceptance_criteria>
    - `node_modules/drizzle-orm/` exists after install
    - `node_modules/drizzle-kit/` exists after install
    - `node_modules/postgres/` exists after install (this is the `postgres.js` driver, not PostgreSQL server)
    - File `drizzle.config.ts` contains the literal string `'./src/lib/server/db/schema.ts'`
    - File `drizzle.config.ts` contains the literal string `'./supabase/migrations'`
    - File `drizzle.config.ts` contains `dialect: 'postgresql'`
    - File `supabase/config.toml` exists and contains `[db]` section
    - File `supabase/config.toml` contains `port = 54322` (default Supabase local Postgres port)
    - Directory `supabase/migrations/` exists
    - File `supabase/migrations/.gitkeep` exists
    - File `.env` exists and contains `DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres`
    - File `.env` contains `BETTER_AUTH_SECRET=` with a value at least 32 chars long
    - `git check-ignore .env` returns `.env` (file is gitignored)
    - File `.env.example` is NOT overwritten (still matches Plan 01's version)
  </acceptance_criteria>
  <done>
    Drizzle + postgres.js + drizzle-kit installed. Local Supabase scaffolding initialized. `.env` populated with local Postgres URL. `drizzle.config.ts` points at the schema file (not yet created — Task 2) and at `supabase/migrations/` for output.
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Write Drizzle schema, start Supabase, generate migration, and apply it</name>
  <files>
    src/lib/server/db/schema.ts,
    src/lib/server/db/index.ts,
    supabase/migrations/0000_initial.sql,
    .env
  </files>
  <read_first>
    drizzle.config.ts,
    .env,
    .planning/phases/01-foundation/01-RESEARCH.md,
    supabase/config.toml
  </read_first>
  <action>
    1. Create `src/lib/server/db/schema.ts` with the EXACT content from the <interfaces> block. No modifications. No reordering. All nine pgTable calls must be present:
       - `user`, `session`, `account`, `verification` (Better Auth)
       - `profile`, `pointTransaction`, `reward`, `redemption`, `scanToken` (loyalty)
       Each must have the `.references()` relationships and `check()` constraints exactly as specified. Export every table.

    2. Create `src/lib/server/db/index.ts` with the EXACT content from <interfaces>. Critical: the `postgres()` call MUST include `{ prepare: false }` — this is RESEARCH.md Pitfall #8. Without it, queries will fail silently once the Supabase pooler is hit.

    3. Start Supabase local dev: `npx supabase start`. This pulls Docker images (first run ~2 min) and boots Postgres + Kong + Studio + Inbucket. If Docker Desktop is not running, the command will fail with a clear error — in that case, print a user-friendly message telling the user to start Docker Desktop and retry this task.

    4. After `supabase start` succeeds, run `npx supabase status` and capture the output. Extract the `anon key` line (it looks like `anon key: eyJ...`) and update `.env`:
       - Replace `PUBLIC_SUPABASE_ANON_KEY=placeholder_filled_after_supabase_start` with the actual key.
       - Verify `PUBLIC_SUPABASE_URL=http://localhost:54321` still matches what `supabase status` reported as `API URL`.

    5. Generate the initial migration: `npx drizzle-kit generate --name initial`. This reads `src/lib/server/db/schema.ts` and writes `supabase/migrations/0000_initial.sql` (or similar — the filename may include a timestamp/hash; accept whatever drizzle-kit produces).

    6. Inspect the generated SQL. It must contain `CREATE TABLE "user"`, `CREATE TABLE "session"`, `CREATE TABLE "profile"`, `CREATE TABLE "point_transaction"`, `CREATE TABLE "reward"`, `CREATE TABLE "redemption"`, `CREATE TABLE "scan_token"`, `CREATE TABLE "account"`, `CREATE TABLE "verification"` — nine tables. If any are missing, the schema file is broken — re-check Task 2 step 1.

    7. Apply the migration: `npx drizzle-kit migrate`. This connects to `DATABASE_URL` and runs the SQL.

    8. Verify the tables exist in Postgres. Use psql via the Supabase CLI:
       ```
       npx supabase db execute --local "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
       ```
       (If that command doesn't exist in this CLI version, fall back to: `docker exec supabase_db_rule257-nyc psql -U postgres -c "\dt"` — the container name may differ, use `docker ps | grep supabase_db` to find it.)
       The output must list at least: account, point_transaction, profile, redemption, reward, scan_token, session, user, verification.
  </action>
  <verify>
    <automated>test -f src/lib/server/db/schema.ts && test -f src/lib/server/db/index.ts && grep -q "prepare: false" src/lib/server/db/index.ts && grep -q "pgTable('user'" src/lib/server/db/schema.ts && grep -q "pgTable('profile'" src/lib/server/db/schema.ts && grep -q "pgTable('point_transaction'" src/lib/server/db/schema.ts && grep -q "pgTable('reward'" src/lib/server/db/schema.ts && grep -q "pgTable('redemption'" src/lib/server/db/schema.ts && grep -q "pgTable('scan_token'" src/lib/server/db/schema.ts && grep -q "pgTable('session'" src/lib/server/db/schema.ts && grep -q "pgTable('account'" src/lib/server/db/schema.ts && grep -q "pgTable('verification'" src/lib/server/db/schema.ts && ls supabase/migrations/*.sql 2>/dev/null | head -1 && grep -l 'CREATE TABLE "profile"' supabase/migrations/*.sql && grep -l 'CREATE TABLE "user"' supabase/migrations/*.sql && npx supabase status 2>/dev/null | grep -q 'API URL'</automated>
  </verify>
  <acceptance_criteria>
    - File `src/lib/server/db/schema.ts` exists and contains ALL nine `pgTable()` calls: `user`, `session`, `account`, `verification`, `profile`, `pointTransaction` (as `'point_transaction'` in the SQL name arg), `reward`, `redemption`, `scanToken` (as `'scan_token'`)
    - File `src/lib/server/db/schema.ts` contains `check('role_check'` constraint on profile
    - File `src/lib/server/db/schema.ts` contains `check('type_check'` constraint on pointTransaction
    - File `src/lib/server/db/schema.ts` contains `check('status_check'` constraint on redemption
    - File `src/lib/server/db/schema.ts` contains `references(() => user.id, { onDelete: 'cascade' })` for profile.userId
    - File `src/lib/server/db/index.ts` contains the literal string `{ prepare: false }`
    - File `src/lib/server/db/index.ts` exports `db` via `export const db = drizzle(`
    - Command `npx supabase status` prints `API URL: http://127.0.0.1:54321` (or `http://localhost:54321`) — indicates Supabase is running
    - At least one file exists under `supabase/migrations/*.sql`
    - The generated SQL file contains `CREATE TABLE "user"` — verified by `grep -l 'CREATE TABLE "user"' supabase/migrations/*.sql`
    - The generated SQL file contains `CREATE TABLE "profile"` with `CONSTRAINT "role_check"` somewhere in the file
    - The generated SQL file contains `CREATE TABLE "scan_token"`
    - File `.env` contains `PUBLIC_SUPABASE_ANON_KEY=eyJ` (JWT prefix — not the placeholder string)
    - After `drizzle-kit migrate`, querying `SELECT tablename FROM pg_tables WHERE schemaname='public'` returns at least 9 rows including all table names listed above
  </acceptance_criteria>
  <done>
    Local Postgres is running on port 54322. Drizzle schema defines all 9 tables with correct references and check constraints. The initial migration SQL is committed to `supabase/migrations/`. The migration has been applied — the tables exist in the live local database. `.env` has the real Supabase anon key. Phase 1 success criterion #3 is demonstrably met.
  </done>
</task>

</tasks>

<verification>
- [ ] `grep -rn "prepare: false" src/lib/server/db/` returns `index.ts`
- [ ] `ls supabase/migrations/*.sql` returns at least one file
- [ ] `grep -l 'CREATE TABLE "profile"' supabase/migrations/*.sql` succeeds
- [ ] `npx supabase status` shows API URL + DB URL
- [ ] The database has all 9 tables (user, session, account, verification, profile, point_transaction, reward, redemption, scan_token)
- [ ] `.env` has a real `PUBLIC_SUPABASE_ANON_KEY` (JWT starting with `eyJ`)
</verification>

<success_criteria>
1. Drizzle ORM installed and configured with the Supabase-safe `prepare: false` driver option
2. Local Supabase Postgres running on port 54322
3. 9 tables exist in the local database (4 Better Auth + 5 loyalty)
4. Migration SQL is committed to `supabase/migrations/` so Plan 04 and Phase 3 can reproduce the schema deterministically
5. Schema supports both reward economics models (points-per-dollar uses pointsBalance + pointTransaction; buy-8-get-1 can be derived from filtered transactions) — no economic model is baked in
</success_criteria>

<output>
After completion, create `.planning/phases/01-foundation/01-02-SUMMARY.md` documenting:
- The generated migration filename (e.g., `0000_initial.sql` or whatever drizzle-kit chose)
- The exact table list retrieved from `pg_tables` post-migration
- The Supabase local API URL and DB URL
- Any Docker Desktop or CLI install friction encountered
- A note that `PUBLIC_SUPABASE_ANON_KEY` in `.env` is local-only and MUST be regenerated for production
</output>
</content>
</invoke>