import { json, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { formTables } from "./form";

export interface FormSubmissionValue {
  fieldId: string;
  value: string | number | boolean | string[];
}

export type FormSubmissionValuesRow = FormSubmissionValue[];

export const formSubmissionTable = pgTable(
  "form_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id").references(() => formTables.id),

    values: json("values").$type<FormSubmissionValuesRow>(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
);
