import { pgTable, uuid, varchar, timestamp, boolean, jsonb, integer, pgEnum } from "drizzle-orm/pg-core";

export const templateCategoryEnum = pgEnum("template_category_enum", [
  "feedback",
  "hr",
  "education",
  "events",
  "research",
  "health",
  "business",
  "personal",
]);

export const templatesTable = pgTable("templates", {
  id:          uuid("id").primaryKey().defaultRandom(),
  title:       varchar("title", { length: 100 }).notNull(),
  description: varchar("description", { length: 300 }),
  category:    templateCategoryEnum("category").notNull(),
  emoji:       varchar("emoji", { length: 10 }),
  isPaid:      boolean("is_paid").notNull().default(false),
  /** Array of { label, labelKey, type, isRequired, placeholder, description, config } objects */
  fields:      jsonb("fields").notNull().$type<TemplateField[]>(),
  usageCount:  integer("usage_count").notNull().default(0),
  createdAt:   timestamp("created_at").defaultNow(),
});

export interface TemplateField {
  label: string;
  labelKey: string;
  type: "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE";
  isRequired: boolean;
  placeholder?: string | null;
  description?: string | null;
  config?: {
    maxWords?: number;
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    mode?: "single" | "range";
  };
}

export type SelectTemplate = typeof templatesTable.$inferSelect;
export type InsertTemplate = typeof templatesTable.$inferInsert;
