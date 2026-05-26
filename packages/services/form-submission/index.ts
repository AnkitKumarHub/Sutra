import { and, asc, db, desc, eq } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formSubmissionTable, type FormSubmissionValuesRow } from "@repo/database/models/form-submission";
import { formTables } from "@repo/database/models/form";
import { z } from "zod";

import {
  type CreateSubmissionInputType,
  type GetFormSubmissionsInputType,
  type ExportCsvInputType,
  createSubmissionInput,
  getFormSubmissionsInput,
  exportCsvInput,
} from "./model";

const emailSchema = z.string().email();

class FormSubmissionService {
  public async createSubmission(payload: CreateSubmissionInputType) {
    const { formId, values, startedAt } = await createSubmissionInput.parseAsync(payload);

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

      if (field.type === "NUMBER" || field.type === "RATING") {
        if (typeof value !== "number" || !Number.isFinite(value)) {
          throw new Error(`Field ${submissionValue.fieldId} must be a valid number`);
        }
      } else if (field.type === "CHECKBOX") {
        if (typeof value !== "boolean") {
          throw new Error(`Field ${submissionValue.fieldId} must be a boolean`);
        }
      } else if (field.type === "EMAIL") {
        if (typeof value !== "string" || !emailSchema.safeParse(value).success) {
          throw new Error(`Field ${submissionValue.fieldId} must be a valid email`);
        }
      } else if (field.type === "SHORT_TEXT" || field.type === "LONG_TEXT") {
        if (typeof value !== "string") {
          throw new Error(`Field ${submissionValue.fieldId} must be text`);
        }
      } else if (field.type === "SINGLE_SELECT") {
        if (typeof value !== "string") {
          throw new Error(`Field ${submissionValue.fieldId} must be a string`);
        }
      } else if (field.type === "MULTI_SELECT") {
        if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
          throw new Error(`Field ${submissionValue.fieldId} must be a string array`);
        }
      } else if (field.type === "DATE") {
        if (
          typeof value !== "string" ||
          Number.isNaN(new Date(value).getTime())
        ) {
          throw new Error(`Field ${submissionValue.fieldId} must be a valid date string`);
        }
      }

      if (
        field.isRequired &&
        typeof value === "string" &&
        value.trim().length === 0
      ) {
        throw new Error(`Field ${submissionValue.fieldId} is required`);
      }

      if (
        field.isRequired &&
        Array.isArray(value) &&
        value.length === 0
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
        startedAt: startedAt ? new Date(startedAt) : undefined,
      })
      .returning({
        id: formSubmissionTable.id,
        createdAt: formSubmissionTable.createdAt,
      });

    if (!submissionInsertResult || submissionInsertResult.length === 0 || !submissionInsertResult[0]?.id) {
      throw new Error("Something went wrong while creating form submission");
    }

    return {
      id: submissionInsertResult[0].id,
      submittedAt: submissionInsertResult[0].createdAt?.toISOString() ?? new Date().toISOString(),
      values: normalizedValues,
    };
  }

  public async getFormSubmissions(payload: GetFormSubmissionsInputType) {
    const { formId, userId } = await getFormSubmissionsInput.parseAsync(payload);

    const form = await db
      .select({
        id: formTables.id,
      })
      .from(formTables)
      .where(and(eq(formTables.id, formId), eq(formTables.createdBy, userId)));

    if (!form || form.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist`);
    }

    const submissions = await db
      .select({
        id: formSubmissionTable.id,
        formId: formSubmissionTable.formId,
        values: formSubmissionTable.values,
        createdAt: formSubmissionTable.createdAt,
        updatedAt: formSubmissionTable.updatedAt,
      })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(desc(formSubmissionTable.createdAt));

    return submissions;
  }

  public async exportCsv(payload: ExportCsvInputType) {
    const { formId, userId, fieldIds } = await exportCsvInput.parseAsync(payload);

    // Verify ownership
    const form = await db
      .select({ id: formTables.id, title: formTables.title })
      .from(formTables)
      .where(and(eq(formTables.id, formId), eq(formTables.createdBy, userId)));

    if (!form || form.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    // Get fields to determine headers
    let fields = await db
      .select({
        id: formFieldsTable.id,
        label: formFieldsTable.label,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.index));

    if (fieldIds && fieldIds.length > 0) {
      const fieldIdSet = new Set(fieldIds);
      fields = fields.filter(f => fieldIdSet.has(f.id));
    }

    // Get submissions
    const submissions = await db
      .select({
        id: formSubmissionTable.id,
        values: formSubmissionTable.values,
        createdAt: formSubmissionTable.createdAt,
      })
      .from(formSubmissionTable)
      .where(eq(formSubmissionTable.formId, formId))
      .orderBy(desc(formSubmissionTable.createdAt));

    // CSV Helper
    const escapeCsv = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes('"') || str.includes(',') || str.includes('\\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build header row
    const headers = ["Submitted At", ...fields.map(f => f.label)];
    let csvString = headers.map(escapeCsv).join(",") + "\\n";

    // Build data rows
    for (const sub of submissions) {
      const valuesMap = new Map((sub.values ?? []).map(v => [v.fieldId, v.value]));
      const row = [
        sub.createdAt ? sub.createdAt.toISOString() : "",
        ...fields.map(f => {
          let val = valuesMap.get(f.id);
          if (Array.isArray(val)) {
            val = val.join(", ");
          }
          return val;
        }),
      ];
      csvString += row.map(escapeCsv).join(",") + "\\n";
    }

    return {
      csvContent: csvString,
      filename: `${form[0]!.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_submissions.csv`,
    };
  }
}

export default FormSubmissionService;
