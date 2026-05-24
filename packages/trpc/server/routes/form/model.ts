import { z } from "zod";

export const formStatusModel = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

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
    status: formStatusModel.describe("The current status of the form"),
    createdAt: z.date().nullable().describe("Creation Timestamp"),
    updatedAt: z.date().nullable().describe("Last Updated Timestamp"),
  }),
);

export const updateFormInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
  title: z.string().min(1).max(55).optional().describe("New title for the form"),
  description: z.string().max(255).optional().nullable().describe("New description for the form"),
});

export const updateFormOutputModel = z.object({
  id: z.string().describe("Unique identifier for the updated form"),
});

export const publishFormInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
});

export const publishFormOutputModel = z.object({
  id: z.string().describe("Unique identifier for the published form"),
  status: formStatusModel.describe("The new status of the form"),
});

export const unpublishFormInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
});

export const unpublishFormOutputModel = z.object({
  id: z.string().describe("Unique identifier for the unpublished form"),
  status: formStatusModel.describe("The new status of the form"),
});

export const deleteFormInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
});

export const deleteFormOutputModel = z.object({
  id: z.string().describe("Unique identifier for the deleted form"),
});

export const formFieldTypeModel = z.enum([
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

export const createFieldInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
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
  fieldId: z.string().uuid().describe("Unique identifier for the field"),
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
  fieldId: z.string().uuid().describe("Unique identifier for the field"),
});

export const deleteFieldOutputModel = z.object({
  id: z.string().describe("Unique identifier for the deleted field"),
});

export const getFieldsByFormIdInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
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

export const getFormByIdInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
});

export const getFormByIdOutputModel = z.object({
  id: z.string().describe("Unique identifier for the form"),
  title: z.string().describe("The title of the form"),
  description: z.string().nullable().describe("The optional description of the form"),
  status: formStatusModel.describe("The current status of the form"),
  createdAt: z.date().nullable().describe("Creation timestamp"),
  updatedAt: z.date().nullable().describe("Last updated timestamp"),
  fields: z.array(publicFieldOutputModel).describe("Ordered fields for rendering"),
});

export const getPublishedFormByIdInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
});

export const getPublishedFormByIdOutputModel = z.object({
  id: z.string().describe("Unique identifier for the form"),
  title: z.string().describe("The title of the form"),
  description: z.string().nullable().describe("The optional description of the form"),
  status: formStatusModel.describe("The current status of the form"),
  createdAt: z.date().nullable().describe("Creation timestamp"),
  updatedAt: z.date().nullable().describe("Last updated timestamp"),
  fields: z.array(publicFieldOutputModel).describe("Ordered fields for rendering"),
});

export const submitPublicFormInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
  values: z.array(
    z.object({
      fieldId: z.string().uuid().describe("Unique identifier for the field"),
      value: z
        .union([z.string(), z.number(), z.boolean(), z.array(z.string())])
        .describe("Submitted answer"),
    }),
  ),
});

export const submitPublicFormOutputModel = z.object({
  id: z.string().describe("Unique identifier for the submission"),
});

export const getFormSubmissionsInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
});

export const formSubmissionValueOutputModel = z.object({
  fieldId: z.string().uuid().describe("Unique identifier for the field"),
  value: z
    .union([z.string(), z.number(), z.boolean(), z.array(z.string())])
    .describe("Submitted answer value"),
});

export const getFormSubmissionsOutputModel = z.array(
  z.object({
    id: z.string().uuid().describe("Unique identifier for the submission"),
    formId: z.string().uuid().nullable().describe("Parent form identifier"),
    values: z
      .array(formSubmissionValueOutputModel)
      .nullable()
      .describe("Submitted values for this form response"),
    createdAt: z.date().nullable().describe("Creation timestamp"),
    updatedAt: z.date().nullable().describe("Last updated timestamp"),
  }),
);
