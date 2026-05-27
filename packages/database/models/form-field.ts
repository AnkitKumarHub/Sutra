import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  numeric,
  pgEnum,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";
import { formTables } from "./form";
import { formPagesTable } from "./form-page";

export const fieldTypeEnum = pgEnum("field_type_enum", [
  "SHORT_TEXT",
  "LONG_TEXT",
  "EMAIL",
  "NUMBER",
  "SINGLE_SELECT",
  "MULTI_SELECT",
  "CHECKBOX",
  "RATING",
  "DATE",
]);

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    label: varchar("label", { length: 100 }).notNull(),
    labelKey: varchar("label_key", { length: 100 }).notNull(),
    description: text("description"),

    placeholder: text("placeholder"),
    isRequired: boolean("is_required").notNull().default(false),
    index: numeric("index", { scale: 2 }).notNull(),

    type: fieldTypeEnum("type").notNull(),
    config: jsonb("config").notNull().$type<{
      maxWords?: number;
      options?: string[];
      min?: number;
      max?: number;
      step?: number;
      mode?: "single" | "range";
    }>(),

    formId: uuid("form_id").references(() => formTables.id),

    /** Page this field belongs to. null = unassigned (renders in single-page mode). */
    pageId: uuid("page_id").references(() => formPagesTable.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      uniqueFormIdAndIndex: unique().on(table.formId, table.index),
    };
  },
);
 
