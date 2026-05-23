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
} from "drizzle-orm/pg-core";
import { formTables } from "./form";

export const fieldTypeEnum = pgEnum("field_type_enum", [
  "TEXT",
  "NUMBER",
  "EMAIL",
  "YES_NO",
  "PASSWORD",
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
    options: text("options"),

    formId: uuid("form_id").references(() => formTables.id),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => {
    return {
      uniqueFormIdAndIndex: unique().on(table.formId, table.index),
    };
  },
);
 