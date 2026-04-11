import {
  pgTable, text, integer, boolean, timestamp, uuid, check, index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---------- Better Auth tables ----------
// Merged with `npx @better-auth/cli@latest generate` output from Plan 04.
// Additions from CLI drift check (2026-04-11):
//   - user.name made notNull (Better Auth now requires a name on insert)
//   - account: added accessToken/refreshToken/idToken/accessTokenExpiresAt/refreshTokenExpiresAt/scope/password
//     (all nullable; unused by magic-link but required for future OAuth providers per Better Auth 1.6 schema)
//   - indexes added on session.userId, account.userId, verification.identifier (CLI-recommended performance hints)

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  name: text('name').notNull(),
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
}, (t) => [
  index('session_userId_idx').on(t.userId)
]);

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (t) => [
  index('account_userId_idx').on(t.userId)
]);

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
}, (t) => [
  index('verification_identifier_idx').on(t.identifier)
]);

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
