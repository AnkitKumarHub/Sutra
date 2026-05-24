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
  json,
} from "drizzle-orm/pg-core";
import { formTables } from "./form";
import { formFieldsTable } from "../schema";

export interface FormSubmissionValue {
  fieldId: string;
  value: string;
}

export type formSubmissionValueRow = FormSubmissionValue 
 
export const formSubmissionTable = pgTable(
  "form_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id").references(() => formTables.id),

    values : json('values').$type<FormSubmissionValue>(),
    

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  }
);
 