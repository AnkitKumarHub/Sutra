import { and, asc, db, eq, isNull, max } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formPagesTable } from "@repo/database/models/form-page";
import { formTables } from "@repo/database/models/form";

import {
  type AssignFieldToPageInputType,
  type CreatePageInputType,
  type DeletePageInputType,
  type GetPagesByFormIdInputType,
  type ReorderPagesInputType,
  type UpdatePageInputType,
  assignFieldToPageInput,
  createPageInput,
  deletePageInput,
  getPagesByFormIdInput,
  reorderPagesInput,
  updatePageInput,
} from "./model";

class FormPageService {
  // ── Private helpers ──────────────────────────────────────────────────────

  /** Verify that the given page belongs to a form owned by userId. Returns the page + formId. */
  private async assertOwnership(pageId: string, userId: string) {
    const [row] = await db
      .select({
        pageId: formPagesTable.id,
        formId: formPagesTable.formId,
        createdBy: formTables.createdBy,
      })
      .from(formPagesTable)
      .innerJoin(formTables, eq(formPagesTable.formId, formTables.id))
      .where(
        and(
          eq(formPagesTable.id, pageId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt)
        )
      );

    if (!row) {
      throw new Error(`Page not found or you do not have permission to modify it`);
    }
    return row;
  }

  /** Get the next order value for a new page in the given form. */
  private async getNextOrder(formId: string): Promise<number> {
    const [result] = await db
      .select({ maxOrder: max(formPagesTable.order) })
      .from(formPagesTable)
      .where(eq(formPagesTable.formId, formId));

    const current = result?.maxOrder;
    return current !== null && current !== undefined ? Number(current) + 1 : 0;
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Create a new page on a form the user owns. */
  public async createPage(payload: CreatePageInputType) {
    const { formId, userId, title } = await createPageInput.parseAsync(payload);

    // Verify form ownership
    const [form] = await db
      .select({ id: formTables.id })
      .from(formTables)
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt)
        )
      );

    if (!form) {
      throw new Error(`Form not found or you do not have permission`);
    }

    const order = await this.getNextOrder(formId);

    const [page] = await db
      .insert(formPagesTable)
      .values({ formId, title, order })
      .returning({ id: formPagesTable.id, order: formPagesTable.order });

    if (!page) throw new Error("Failed to create page");

    return { id: page.id, order: page.order };
  }

  /** Rename a page. */
  public async updatePage(payload: UpdatePageInputType) {
    const { pageId, userId, title } = await updatePageInput.parseAsync(payload);

    if (!title) throw new Error("No fields provided for update");

    await this.assertOwnership(pageId, userId);

    const [updated] = await db
      .update(formPagesTable)
      .set({ title })
      .where(eq(formPagesTable.id, pageId))
      .returning({ id: formPagesTable.id });

    if (!updated) throw new Error("Failed to update page");

    return { id: updated.id };
  }

  /**
   * Delete a page.
   * Fields assigned to this page have their pageId set to null (unassigned).
   */
  public async deletePage(payload: DeletePageInputType) {
    const { pageId, userId } = await deletePageInput.parseAsync(payload);

    await this.assertOwnership(pageId, userId);

    // Unassign fields that belong to this page
    await db
      .update(formFieldsTable)
      .set({ pageId: null })
      .where(eq(formFieldsTable.pageId, pageId));

    // Delete the page
    const [deleted] = await db
      .delete(formPagesTable)
      .where(eq(formPagesTable.id, pageId))
      .returning({ id: formPagesTable.id });

    if (!deleted) throw new Error("Failed to delete page");

    return { id: deleted.id };
  }

  /**
   * List pages for a form, ordered by `order` ascending.
   * No auth check — used by the public form renderer too.
   */
  public async getPagesByFormId(payload: GetPagesByFormIdInputType) {
    const { formId } = await getPagesByFormIdInput.parseAsync(payload);

    const pages = await db
      .select({
        id: formPagesTable.id,
        title: formPagesTable.title,
        order: formPagesTable.order,
      })
      .from(formPagesTable)
      .where(eq(formPagesTable.formId, formId))
      .orderBy(asc(formPagesTable.order));

    return pages;
  }

  /**
   * Reorder pages. Accepts the desired order as an array of page IDs.
   * Each page's `order` column is set to its index in the array.
   */
  public async reorderPages(payload: ReorderPagesInputType) {
    const { formId, userId, pageIds } = await reorderPagesInput.parseAsync(payload);

    // Verify ownership of the form
    const [form] = await db
      .select({ id: formTables.id })
      .from(formTables)
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt)
        )
      );

    if (!form) throw new Error(`Form not found or you do not have permission`);

    // Update each page's order in sequence
    await Promise.all(
      pageIds.map((pageId, index) =>
        db
          .update(formPagesTable)
          .set({ order: index })
          .where(
            and(eq(formPagesTable.id, pageId), eq(formPagesTable.formId, formId))
          )
      )
    );

    return { success: true };
  }

  /**
   * Assign a field to a page (or unassign by passing pageId=null).
   * Verifies the user owns the parent form.
   */
  public async assignFieldToPage(payload: AssignFieldToPageInputType) {
    const { fieldId, userId, pageId } = await assignFieldToPageInput.parseAsync(payload);

    // Verify the user owns the form that contains this field
    const [fieldRow] = await db
      .select({ id: formFieldsTable.id })
      .from(formFieldsTable)
      .innerJoin(formTables, eq(formFieldsTable.formId, formTables.id))
      .where(
        and(
          eq(formFieldsTable.id, fieldId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt)
        )
      );

    if (!fieldRow) throw new Error("Field not found or you do not have permission");

    const [updated] = await db
      .update(formFieldsTable)
      .set({ pageId })
      .where(eq(formFieldsTable.id, fieldId))
      .returning({ id: formFieldsTable.id });

    if (!updated) throw new Error("Failed to assign field to page");

    return { id: updated.id };
  }
}

export default FormPageService;
