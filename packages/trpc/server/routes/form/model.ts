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
  slug: z.string().max(255).optional().describe("Optional custom slug for the form"),
});

export const createFormOutputModel = z.object({
  id: z.string().describe("Unique identifier for the form"),
  slug: z.string().describe("The unique slug of the form"),
});

export const listFormsInputModel = z.undefined();

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("Unique identifier for the form"),
    title: z.string().describe("The title of the form"),
    description: z.string().nullable().describe("The optional description of the form"),
    slug: z.string().nullable().describe("The slug of the form"),
    status: formStatusModel.describe("The current status of the form"),
    isPasswordProtected: z.boolean().optional().describe("Whether the form has a password"),
    unlockDurationMinutes: z.number().nullable().optional().describe("Unlock token duration"),
    createdAt: z.date().nullable().describe("Creation Timestamp"),
    updatedAt: z.date().nullable().describe("Last Updated Timestamp"),
  }),
);

export const updateFormInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
  title: z.string().min(1).max(55).optional().describe("New title for the form"),
  description: z.string().max(255).optional().nullable().describe("New description for the form"),
  slug: z.string().max(255).optional().describe("New custom slug for the form"),
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
    pageId: z.string().uuid().nullable().describe("Page this field belongs to"),
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
  pageId: z.string().uuid().nullable().describe("Page this field belongs to (null = unassigned)"),
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
  slug: z.string().nullable().describe("The unique slug of the form"),
  status: formStatusModel.describe("The current status of the form"),
  isPasswordProtected: z.boolean().describe("Whether the form requires a password"),
  unlockDurationMinutes: z.number().describe("Unlock token duration in minutes"),
  createdAt: z.date().nullable().describe("Creation timestamp"),
  updatedAt: z.date().nullable().describe("Last updated timestamp"),
  fields: z.array(publicFieldOutputModel).describe("Ordered fields for rendering"),
});

export const getPublishedFormBySlugInputModel = z.object({
  slug: z.string().describe("The unique slug of the form"),
  unlockToken: z.string().optional().describe("JWT unlock token for password-protected forms"),
});

export const getPublishedFormBySlugOutputModel = z.object({
  id: z.string().describe("Unique identifier for the form"),
  title: z.string().describe("The title of the form"),
  description: z.string().nullable().describe("The optional description of the form"),
  slug: z.string().nullable().describe("The unique slug of the form"),
  status: formStatusModel.describe("The current status of the form"),
  isPasswordProtected: z.boolean().describe("Whether the form requires a password to access"),
  unlockDurationMinutes: z.number().describe("Unlock token validity in minutes"),
  createdAt: z.date().nullable().describe("Creation timestamp"),
  updatedAt: z.date().nullable().describe("Last updated timestamp"),
  fields: z.array(publicFieldOutputModel).describe("Ordered fields (empty if password-protected and no valid token)"),
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
  /** ISO timestamp of when the respondent first opened the form — used for avg completion time */
  startedAt: z.string().datetime().optional().describe("When the respondent opened the form"),
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

export const cloneFormInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form to clone"),
});

export const cloneFormOutputModel = z.object({
  id: z.string().describe("Unique identifier for the new cloned form"),
  slug: z.string().describe("The unique slug of the new cloned form"),
});

export const exportCsvInputModel = z.object({
  formId: z.string().uuid().describe("Unique identifier for the form"),
  fieldIds: z.array(z.string().uuid()).optional().describe("Optional list of field IDs to export"),
});

export const exportCsvOutputModel = z.object({
  csvContent: z.string().describe("Raw CSV content"),
  filename: z.string().describe("Recommended filename for the CSV"),
});

// ── PASSWORD PROTECTION ───────────────────────────────────────────────────────

export const setFormPasswordInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
  password: z.string().min(4).max(100).nullable().describe("Password to set, or null to clear"),
  unlockDurationMinutes: z
    .number()
    .int()
    .min(5)
    .max(1440)
    .optional()
    .describe("Unlock token duration in minutes (default: 30)"),
});

export const setFormPasswordOutputModel = z.object({
  id: z.string().describe("Form ID"),
  isPasswordProtected: z.boolean().describe("Whether the form now has a password"),
  unlockDurationMinutes: z.number().describe("Configured unlock token duration in minutes"),
});

export const unlockFormInputModel = z.object({
  slug: z.string().describe("Slug of the password-protected form"),
  password: z.string().min(1).describe("Password to verify"),
});

export const unlockFormOutputModel = z.object({
  unlockToken: z.string().describe("Short-lived JWT unlock token"),
  expiresInMinutes: z.number().describe("Token expiry in minutes"),
});

// ── PAGES ─────────────────────────────────────────────────────────────────────

export const createPageInputModel = z.object({
  formId: z.string().uuid().describe("Parent form ID"),
  title: z.string().min(1).max(255).describe("Page title"),
});

export const createPageOutputModel = z.object({
  id: z.string().describe("New page ID"),
  order: z.number().describe("Assigned display order"),
});

export const updatePageInputModel = z.object({
  pageId: z.string().uuid().describe("Page ID"),
  title: z.string().min(1).max(255).optional().describe("New title"),
});

export const updatePageOutputModel = z.object({
  id: z.string().describe("Updated page ID"),
});

export const deletePageInputModel = z.object({
  pageId: z.string().uuid().describe("Page ID to delete"),
});

export const deletePageOutputModel = z.object({
  id: z.string().describe("Deleted page ID"),
});

export const getPagesByFormIdInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
});

export const getPagesByFormIdOutputModel = z.array(
  z.object({
    id: z.string().describe("Page ID"),
    title: z.string().describe("Page title"),
    order: z.number().describe("Display order"),
  })
);

export const reorderPagesInputModel = z.object({
  formId: z.string().uuid().describe("Form ID"),
  pageIds: z.array(z.string().uuid()).min(1).describe("Page IDs in desired order"),
});

export const reorderPagesOutputModel = z.object({
  success: z.boolean(),
});

export const assignFieldToPageInputModel = z.object({
  fieldId: z.string().uuid().describe("Field ID"),
  pageId: z.string().uuid().nullable().describe("Page ID, or null to unassign"),
});

export const assignFieldToPageOutputModel = z.object({
  id: z.string().describe("Updated field ID"),
});
