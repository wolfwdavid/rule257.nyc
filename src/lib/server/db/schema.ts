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
