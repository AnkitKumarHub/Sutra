import { db, eq } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionTable, type FormSubmissionValuesRow } from "@repo/database/models/form-submission";
import { formTables } from "@repo/database/models/form";
import { z } from "zod";

import {
  type CreateSubmissionInputType,
  createSubmissionInput,
} from "./model";

const emailSchema = z.string().email();

class FormSubmissionService {
  public async createSubmission(payload: CreateSubmissionInputType) {
    const { formId, values } = await createSubmissionInput.parseAsync(payload);

    const form = await db
      .select({
        id: formTables.id,
      })
      .from(formTables)
      .where(eq(formTables.id, formId));

    if (!form || form.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist`);
    }

    const fields = await db
      .select({
        id: formFieldsTable.id,
        type: formFieldsTable.type,
        isRequired: formFieldsTable.isRequired,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));

    const fieldById = new Map(fields.map((field) => [field.id, field]));
    const submittedFieldIds = new Set<string>();

    for (const submissionValue of values) {
      if (submittedFieldIds.has(submissionValue.fieldId)) {
        throw new Error(`Duplicate value found for field ${submissionValue.fieldId}`);
      }

      submittedFieldIds.add(submissionValue.fieldId);

      const field = fieldById.get(submissionValue.fieldId);
      if (!field) {
        throw new Error(`Field ${submissionValue.fieldId} does not belong to form ${formId}`);
      }

      const value = submissionValue.value;

      if (field.type === "NUMBER") {
        if (typeof value !== "number" || !Number.isFinite(value)) {
          throw new Error(`Field ${submissionValue.fieldId} must be a valid number`);
        }
      } else if (field.type === "YES_NO") {
        if (typeof value !== "boolean") {
          throw new Error(`Field ${submissionValue.fieldId} must be a boolean`);
        }
      } else if (field.type === "EMAIL") {
        if (typeof value !== "string" || !emailSchema.safeParse(value).success) {
          throw new Error(`Field ${submissionValue.fieldId} must be a valid email`);
        }
      } else if (field.type === "TEXT" || field.type === "PASSWORD") {
        if (typeof value !== "string") {
          throw new Error(`Field ${submissionValue.fieldId} must be text`);
        }
      }

      if (
        field.isRequired &&
        typeof value === "string" &&
        value.trim().length === 0
      ) {
        throw new Error(`Field ${submissionValue.fieldId} is required`);
      }
    }

    for (const field of fields) {
      if (field.isRequired && !submittedFieldIds.has(field.id)) {
        throw new Error(`Field ${field.id} is required`);
      }
    }

    const normalizedValues: FormSubmissionValuesRow = values.map((submissionValue) => ({
      fieldId: submissionValue.fieldId,
      value: submissionValue.value,
    }));

    const submissionInsertResult = await db
      .insert(formSubmissionTable)
      .values({
        formId,
        values: normalizedValues,
      })
      .returning({
        id: formSubmissionTable.id,
      });

    if (!submissionInsertResult || submissionInsertResult.length === 0 || !submissionInsertResult[0]?.id) {
      throw new Error("Something went wrong while creating form submission");
    }

    return {
      id: submissionInsertResult[0].id,
    };
  }
}

export default FormSubmissionService;
