import { z } from "zod";

export const fieldTypeInput = z.enum([
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

export const createFieldInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  label: z.string().min(1).max(100).describe("The display label of the field"),
  description: z.string().optional().nullable().describe("The optional description of the field"),
  placeholder: z.string().optional().nullable().describe("The optional placeholder of the field"),
  isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
  type: fieldTypeInput.describe("The type of the field"),
  options: z
    .string()
    .optional()
    .nullable()
    .describe("The optional serialized options for the field"),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const updateFieldInput = z.object({
  fieldId: z.uuid().describe("The unique identifier of the field"),
  label: z.string().min(1).max(100).optional().describe("The display label of the field"),
  description: z.string().optional().nullable().describe("The optional description of the field"),
  placeholder: z.string().optional().nullable().describe("The optional placeholder of the field"),
  isRequired: z.boolean().optional().describe("Whether the field is required"),
  type: fieldTypeInput.optional().describe("The type of the field"),
  options: z
    .string()
    .optional()
    .nullable()
    .describe("The optional serialized options for the field"),
});

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const deleteFieldInput = z.object({
  fieldId: z.uuid().describe("The unique identifier of the field"),
});

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;

export const getFieldsByFormIdInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
});

export type GetFieldsByFormIdInputType = z.infer<typeof getFieldsByFormIdInput>;
