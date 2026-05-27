import { z } from "zod";

// ── Create Page ──────────────────────────────────────────────────────────────
export const createPageInput = z.object({
  formId: z.uuid().describe("The unique identifier of the parent form"),
  userId: z.uuid().describe("The unique identifier of the form owner"),
  title: z.string().min(1).max(255).describe("Page title"),
});

export type CreatePageInputType = z.infer<typeof createPageInput>;

// ── Update Page ──────────────────────────────────────────────────────────────
export const updatePageInput = z.object({
  pageId: z.uuid().describe("The unique identifier of the page"),
  userId: z.uuid().describe("The unique identifier of the form owner"),
  title: z.string().min(1).max(255).optional().describe("New page title"),
});

export type UpdatePageInputType = z.infer<typeof updatePageInput>;

// ── Delete Page ──────────────────────────────────────────────────────────────
export const deletePageInput = z.object({
  pageId: z.uuid().describe("The unique identifier of the page"),
  userId: z.uuid().describe("The unique identifier of the form owner"),
});

export type DeletePageInputType = z.infer<typeof deletePageInput>;

// ── Get Pages ────────────────────────────────────────────────────────────────
export const getPagesByFormIdInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the form owner"),
});

export type GetPagesByFormIdInputType = z.infer<typeof getPagesByFormIdInput>;

export const getPublishedPagesBySlugInput = z.object({
  slug: z.string().describe("The slug of a published form"),
});

export type GetPublishedPagesBySlugInputType = z.infer<typeof getPublishedPagesBySlugInput>;

// ── Reorder Pages ────────────────────────────────────────────────────────────
export const reorderPagesInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
  userId: z.uuid().describe("The unique identifier of the form owner"),
  /** Ordered array of page IDs. Server assigns order = array index. */
  pageIds: z.array(z.uuid()).min(1).describe("Page IDs in desired display order"),
});

export type ReorderPagesInputType = z.infer<typeof reorderPagesInput>;

// ── Assign Field to Page ─────────────────────────────────────────────────────
export const assignFieldToPageInput = z.object({
  fieldId: z.uuid().describe("The unique identifier of the field"),
  userId: z.uuid().describe("The unique identifier of the form owner"),
  /** pageId=null unassigns the field (single-page / unassigned bucket) */
  pageId: z.uuid().nullable().describe("Target page ID, or null to unassign"),
});

export type AssignFieldToPageInputType = z.infer<typeof assignFieldToPageInput>;
