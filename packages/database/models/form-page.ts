import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { formTables } from "./form";

export const formPagesTable = pgTable("form_pages", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .references(() => formTables.id)
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),

  /** Sort order — ascending. Managed by reorderPages service method. */
  order: integer("order").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectFormPage = typeof formPagesTable.$inferSelect;
export type InsertFormPage = typeof formPagesTable.$inferInsert;
