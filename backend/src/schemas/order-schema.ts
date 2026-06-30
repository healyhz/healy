import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { user } from './auth-schema.js';
import { partner } from './partner-schema.js';

export const order = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  partner_id: uuid('partner_id').references(() => partner.id, { onDelete: 'cascade' }),
  items: jsonb('items').notNull(),
  total: integer('total').notNull(),
  status: text('status').notNull().default('pending'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
