import { z } from "zod";

export const createSubmissionValueInput = z.object({
  fieldId: z.uuid().describe("Unique identifier of the field"),
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.string())])
    .describe("Submitted field value"),
});

export const createSubmissionInput = z.object({
  formId: z.uuid().describe("Unique identifier of the form"),
  values: z.array(createSubmissionValueInput).min(1, "At least one field value is required").describe("Submitted answers"),
});

export type CreateSubmissionInputType = z.infer<typeof createSubmissionInput>;

export const getFormSubmissionsInput = z.object({
  formId: z.uuid().describe("Unique identifier of the form"),
  userId: z.uuid().describe("Unique identifier of the user"),
});

export type GetFormSubmissionsInputType = z.infer<typeof getFormSubmissionsInput>;
