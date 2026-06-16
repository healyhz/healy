import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const productSchema = pgTable('product', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
