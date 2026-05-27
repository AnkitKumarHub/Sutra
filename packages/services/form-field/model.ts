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

const fieldConfigInput = z.object({
  maxWords: z.number().int().min(1).optional(),
  options: z.array(z.string().min(1)).optional(),
  min: z.number().int().optional(),
  max: z.number().int().optional(),
  step: z.number().int().min(1).optional(),
  mode: z.enum(["single", "range"]).optional(),
});

export const createFieldInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the user creating the field"),
  label: z.string().min(1).max(100).describe("The display label of the field"),
  description: z.string().optional().nullable().describe("The optional description of the field"),
  placeholder: z.string().optional().nullable().describe("The optional placeholder of the field"),
  isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
  type: fieldTypeInput.describe("The type of the field"),
  config: fieldConfigInput.optional().describe("Type-specific field configuration"),
});

export type CreateFieldInputType = z.infer<typeof createFieldInput>;

export const updateFieldInput = z.object({
  fieldId: z.uuid().describe("The unique identifier of the field"),
  userId: z.uuid().describe("The unique identifier of the requesting user (must be the form owner)"),
  label: z.string().min(1).max(100).optional().describe("The display label of the field"),
  description: z.string().optional().nullable().describe("The optional description of the field"),
  placeholder: z.string().optional().nullable().describe("The optional placeholder of the field"),
  isRequired: z.boolean().optional().describe("Whether the field is required"),
  type: fieldTypeInput.optional().describe("The type of the field"),
  config: fieldConfigInput.optional().describe("Type-specific field configuration"),
});

export type UpdateFieldInputType = z.infer<typeof updateFieldInput>;

export const deleteFieldInput = z.object({
  fieldId: z.uuid().describe("The unique identifier of the field"),
  userId: z.uuid().describe("The unique identifier of the requesting user (must be the form owner)"),
});

export type DeleteFieldInputType = z.infer<typeof deleteFieldInput>;

export const getFieldsByFormIdInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
});

export type GetFieldsByFormIdInputType = z.infer<typeof getFieldsByFormIdInput>;

export const reorderFieldsInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the form owner"),
  pageId: z.uuid().nullable().describe("Page ID, or null for unassigned bucket"),
  fieldIds: z.array(z.uuid()).min(1).describe("Field IDs in desired display order"),
});

export type ReorderFieldsInputType = z.infer<typeof reorderFieldsInput>;
