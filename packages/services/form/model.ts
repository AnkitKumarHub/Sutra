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
  slug: z.string().max(255).optional().describe("Optional custom slug for the form"),
  createdBy: z.uuid().describe("The unique identifier of the user creating the form"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormByUserIdInput = z.object({
  userId: z.uuid().describe("The unique identifier of the user"),
});

export type ListFormByUserIdInputType = z.infer<typeof listFormByUserIdInput>;

// Public access — also accepts an optional unlock token for password-protected forms
export const getPublishedFormBySlugInput = z.object({
  slug: z.string().describe("The unique slug of the form"),
  unlockToken: z.string().optional().describe("JWT unlock token for password-protected forms"),
});

export type GetPublishedFormBySlugInputType = z.infer<typeof getPublishedFormBySlugInput>;

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
  slug: z.string().max(255).optional().describe("New custom slug for the form"),
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

// Clone form
export const cloneFormInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form to clone"),
  userId: z.uuid().describe("The unique identifier of the user cloning the form"),
});

export type CloneFormInputType = z.infer<typeof cloneFormInput>;

// ── PASSWORD PROTECTION ──────────────────────────────────────────────

/** Set or clear a form password. password=null clears it. */
export const setFormPasswordInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the form owner"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters")
    .max(100)
    .nullable()
    .describe("Plain-text password to set, or null to clear"),
  unlockDurationMinutes: z
    .number()
    .int()
    .min(5)
    .max(1440)
    .optional()
    .describe("How long the unlock token should last in minutes (default: 30)"),
});

export type SetFormPasswordInputType = z.infer<typeof setFormPasswordInput>;

/** Verify a password and issue a short-lived unlock token */
export const unlockFormInput = z.object({
  slug: z.string().describe("The slug of the password-protected form"),
  password: z.string().min(1).describe("The password to verify"),
});

export type UnlockFormInputType = z.infer<typeof unlockFormInput>;
