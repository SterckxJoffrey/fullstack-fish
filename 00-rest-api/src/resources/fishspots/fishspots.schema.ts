import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

export const fishspots = sqliteTable('fishspots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  fishs: text('fishs').notNull(),
  image: text('image').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const insertFishspotSchema = createInsertSchema(fishspots).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateFishspotSchema = createUpdateSchema(fishspots).omit({ 
  createdAt: true, 
  updatedAt: true 
});

export type Fishspot = typeof fishspots.$inferSelect;
export type NewFishspot = typeof fishspots.$inferInsert;