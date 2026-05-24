import { z } from "zod";

export const createFormInput = z.object({
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
  createdBy: z.uuid().describe("The unique identifier of the user creating the form"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormByUserIdInput = z.object({
  userId: z.uuid().describe("The unique identifier of the user"),
});

export type ListFormByUserIdInputType = z.infer<typeof listFormByUserIdInput>;

export const getFormByIdInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
});

export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;

// Authenticated creator view — fetches form by ID regardless of status (for builder page)
export const getFormByIdAuthenticatedInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the requesting user (must be the owner)"),
});

export type GetFormByIdAuthenticatedInputType = z.infer<typeof getFormByIdAuthenticatedInput>;

// Update form title/description
export const updateFormInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the requesting user (must be the owner)"),
  title: z.string().min(1).max(55).optional().describe("New title for the form"),
  description: z.string().max(255).optional().nullable().describe("New description for the form"),
});

export type UpdateFormInputType = z.infer<typeof updateFormInput>;

// Publish form
export const publishFormInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the requesting user (must be the owner)"),
});

export type PublishFormInputType = z.infer<typeof publishFormInput>;

// Unpublish form (back to DRAFT)
export const unpublishFormInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the requesting user (must be the owner)"),
});

export type UnpublishFormInputType = z.infer<typeof unpublishFormInput>;

// Soft delete form
export const deleteFormInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the requesting user (must be the owner)"),
});

export type DeleteFormInputType = z.infer<typeof deleteFormInput>;
