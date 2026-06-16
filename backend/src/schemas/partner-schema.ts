import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';

export const partner = pgTable('partner', {
  id: uuid('id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  referral_code: text('referral_code').notNull().unique(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  deleted_at: timestamp('deleted_at'),
});
