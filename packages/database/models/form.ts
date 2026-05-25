import { pgTable, uuid, varchar, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formStatusEnum = pgEnum("form_status_enum", ["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const formTables = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: varchar("title", { length: 55 }).notNull(),
  description: varchar("description", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique(),

  status: formStatusEnum("status").notNull().default("DRAFT"),

  passwordHash: varchar("password_hash", { length: 255 }),
  unlockDurationMinutes: integer("unlock_duration_minutes"),

  createdBy: uuid("created_by").references(() => usersTable.id),

  deletedAt: timestamp("deleted_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectForm = typeof formTables.$inferSelect;
export type InsertForm = typeof formTables.$inferInsert;
