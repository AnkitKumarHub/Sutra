import { z } from "zod";

export const createFormInputModel = z.object({
  title: z
    .string()
    .min(1)
    .max(55)
    .describe("The title of the form"),
  description: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .describe("The optional description of the form"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("Unique identifier for the form"),
});

export const listFormsInputModel = z.undefined();

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("Unique identifier for the form"),
    title: z.string().describe("The title of the form"),
    description: z.string().nullable().describe("The optional description of the form"),
    createdAt: z.date().nullable().describe("Creation Timestamp"),
    updatedAt: z.date().nullable().describe("Last Updated Timestamp"),
  }),
);

export const formFieldTypeModel = z.enum(["TEXT", "NUMBER", "EMAIL", "YES_NO", "PASSWORD"]);

export const createFieldInputModel = z.object({
  formId: z.uuid().describe("Unique identifier for the form"),
  label: z.string().min(1).max(100).describe("Display label of the field"),
  description: z.string().optional().nullable().describe("Optional field description"),
  placeholder: z.string().optional().nullable().describe("Optional field placeholder"),
  isRequired: z.boolean().optional().default(false).describe("Whether the field is required"),
  type: formFieldTypeModel.describe("Type of the field"),
  options: z.string().optional().nullable().describe("Optional serialized options"),
});

export const createFieldOutputModel = z.object({
  id: z.string().describe("Unique identifier for the field"),
  labelKey: z.string().describe("Stable slug key derived from initial label"),
  index: z.string().describe("Fractional sort index assigned by server"),
});

export const updateFieldInputModel = z.object({
  fieldId: z.uuid().describe("Unique identifier for the field"),
  label: z.string().min(1).max(100).optional().describe("Display label of the field"),
  description: z.string().optional().nullable().describe("Optional field description"),
  placeholder: z.string().optional().nullable().describe("Optional field placeholder"),
  isRequired: z.boolean().optional().describe("Whether the field is required"),
  type: formFieldTypeModel.optional().describe("Type of the field"),
  options: z.string().optional().nullable().describe("Optional serialized options"),
});

export const updateFieldOutputModel = z.object({
  id: z.string().describe("Unique identifier for the updated field"),
});

export const deleteFieldInputModel = z.object({
  fieldId: z.uuid().describe("Unique identifier for the field"),
});

export const deleteFieldOutputModel = z.object({
  id: z.string().describe("Unique identifier for the deleted field"),
});

export const getFieldsByFormIdInputModel = z.object({
  formId: z.uuid().describe("Unique identifier for the form"),
});

export const getFieldsByFormIdOutputModel = z.array(
  z.object({
    id: z.string().describe("Unique identifier for the field"),
    formId: z.string().uuid().nullable().describe("Parent form identifier"),
    label: z.string().describe("Display label of the field"),
    labelKey: z.string().describe("Stable slug key generated at create time"),
    description: z.string().nullable().describe("Optional field description"),
    placeholder: z.string().nullable().describe("Optional field placeholder"),
    isRequired: z.boolean().describe("Whether the field is required"),
    index: z.string().describe("Fractional sort index"),
    type: formFieldTypeModel.describe("Type of the field"),
    options: z.string().nullable().describe("Optional serialized options"),
    createdAt: z.date().nullable().describe("Creation timestamp"),
    updatedAt: z.date().nullable().describe("Last updated timestamp"),
  }),
);

export const getPublicFormByIdInputModel = z.object({
  formId: z.uuid().describe("Unique identifier for the form"),
});

export const publicFieldOutputModel = z.object({
  id: z.string().describe("Unique identifier for the field"),
  label: z.string().describe("Display label of the field"),
  labelKey: z.string().describe("Stable slug key generated at create time"),
  description: z.string().nullable().describe("Optional field description"),
  placeholder: z.string().nullable().describe("Optional field placeholder"),
  isRequired: z.boolean().describe("Whether the field is required"),
  index: z.string().describe("Fractional sort index"),
  type: formFieldTypeModel.describe("Type of the field"),
  options: z.string().nullable().describe("Optional serialized options"),
  createdAt: z.date().nullable().describe("Creation timestamp"),
  updatedAt: z.date().nullable().describe("Last updated timestamp"),
});

export const getPublicFormByIdOutputModel = z.object({
  id: z.string().describe("Unique identifier for the form"),
  title: z.string().describe("The title of the form"),
  description: z.string().nullable().describe("The optional description of the form"),
  createdAt: z.date().nullable().describe("Creation timestamp"),
  updatedAt: z.date().nullable().describe("Last updated timestamp"),
  fields: z.array(publicFieldOutputModel).describe("Ordered fields for rendering"),
});
