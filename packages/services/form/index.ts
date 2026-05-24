import { and, asc, db, eq, isNull } from "@repo/database";
import { formTables } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";

import {
  type CreateFormInputType,
  type DeleteFormInputType,
  type GetFormByIdAuthenticatedInputType,
  type GetFormByIdInputType,
  type ListFormByUserIdInputType,
  type PublishFormInputType,
  type UnpublishFormInputType,
  type UpdateFormInputType,
  createFormInput,
  deleteFormInput,
  getFormByIdAuthenticatedInput,
  getFormByIdInput,
  listFormByUserIdInput,
  publishFormInput,
  unpublishFormInput,
  updateFormInput,
} from "./model";

class FormService {
  public async createForm(payload: CreateFormInputType) {
    const { title, description, createdBy } = await createFormInput.parseAsync(payload);

    const formInsertResult = await db
      .insert(formTables)
      .values({
        title,
        description,
        createdBy,
      })
      .returning({
        id: formTables.id,
      });

    if (!formInsertResult || formInsertResult.length === 0 || !formInsertResult[0]?.id) {
      throw new Error("Something went wrong while creating the form");
    }

    return {
      id: formInsertResult[0].id,
    };
  }

  public async listFormByUserId(payload: ListFormByUserIdInputType) {
    const { userId } = await listFormByUserIdInput.parseAsync(payload);

    const forms = await db
      .select({
        id: formTables.id,
        title: formTables.title,
        description: formTables.description,
        status: formTables.status,
        createdAt: formTables.createdAt,
        updatedAt: formTables.updatedAt,
      })
      .from(formTables)
      .where(
        and(
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt), // exclude soft-deleted forms
        ),
      );

    return forms;
  }

  // Public — only returns PUBLISHED + non-deleted forms (for respondents)
  public async getPublishedFormById(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const result = await db
      .select({
        formId: formTables.id,
        formTitle: formTables.title,
        formDescription: formTables.description,
        formStatus: formTables.status,
        formCreatedAt: formTables.createdAt,
        formUpdatedAt: formTables.updatedAt,
        fieldId: formFieldsTable.id,
        fieldLabel: formFieldsTable.label,
        fieldLabelKey: formFieldsTable.labelKey,
        fieldDescription: formFieldsTable.description,
        fieldPlaceholder: formFieldsTable.placeholder,
        fieldIsRequired: formFieldsTable.isRequired,
        fieldIndex: formFieldsTable.index,
        fieldType: formFieldsTable.type,
        fieldOptions: formFieldsTable.options,
        fieldCreatedAt: formFieldsTable.createdAt,
        fieldUpdatedAt: formFieldsTable.updatedAt,
      })
      .from(formTables)
      .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formTables.id))
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.status, "PUBLISHED"),  // only published forms are public
          isNull(formTables.deletedAt),        // exclude soft-deleted
        ),
      )
      .orderBy(asc(formFieldsTable.index));

    if (!result || result.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or is not published`);
    }

    const first = result[0]!;
    const fields = result
      .filter((row) => row.fieldId !== null)
      .map((row) => ({
        id: row.fieldId!,
        label: row.fieldLabel!,
        labelKey: row.fieldLabelKey!,
        description: row.fieldDescription,
        placeholder: row.fieldPlaceholder,
        isRequired: row.fieldIsRequired!,
        index: String(row.fieldIndex!),
        type: row.fieldType!,
        options: row.fieldOptions,
        createdAt: row.fieldCreatedAt,
        updatedAt: row.fieldUpdatedAt,
      }));

    return {
      id: first.formId,
      title: first.formTitle,
      description: first.formDescription,
      status: first.formStatus,
      createdAt: first.formCreatedAt,
      updatedAt: first.formUpdatedAt,
      fields,
    };
  }

  // Authenticated — returns form regardless of status, but only for the owner (for builder page)
  public async getFormByIdAuthenticated(payload: GetFormByIdAuthenticatedInputType) {
    const { formId, userId } = await getFormByIdAuthenticatedInput.parseAsync(payload);

    const result = await db
      .select({
        formId: formTables.id,
        formTitle: formTables.title,
        formDescription: formTables.description,
        formStatus: formTables.status,
        formCreatedAt: formTables.createdAt,
        formUpdatedAt: formTables.updatedAt,
        fieldId: formFieldsTable.id,
        fieldLabel: formFieldsTable.label,
        fieldLabelKey: formFieldsTable.labelKey,
        fieldDescription: formFieldsTable.description,
        fieldPlaceholder: formFieldsTable.placeholder,
        fieldIsRequired: formFieldsTable.isRequired,
        fieldIndex: formFieldsTable.index,
        fieldType: formFieldsTable.type,
        fieldOptions: formFieldsTable.options,
        fieldCreatedAt: formFieldsTable.createdAt,
        fieldUpdatedAt: formFieldsTable.updatedAt,
      })
      .from(formTables)
      .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formTables.id))
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId), // only owner can access
          isNull(formTables.deletedAt),
        ),
      )
      .orderBy(asc(formFieldsTable.index));

    if (!result || result.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    const first = result[0]!;
    const fields = result
      .filter((row) => row.fieldId !== null)
      .map((row) => ({
        id: row.fieldId!,
        label: row.fieldLabel!,
        labelKey: row.fieldLabelKey!,
        description: row.fieldDescription,
        placeholder: row.fieldPlaceholder,
        isRequired: row.fieldIsRequired!,
        index: String(row.fieldIndex!),
        type: row.fieldType!,
        options: row.fieldOptions,
        createdAt: row.fieldCreatedAt,
        updatedAt: row.fieldUpdatedAt,
      }));

    return {
      id: first.formId,
      title: first.formTitle,
      description: first.formDescription,
      status: first.formStatus,
      createdAt: first.formCreatedAt,
      updatedAt: first.formUpdatedAt,
      fields,
    };
  }

  // Update form title/description — owner only
  public async updateForm(payload: UpdateFormInputType) {
    const { formId, userId, title, description } = await updateFormInput.parseAsync(payload);

    if (title === undefined && description === undefined) {
      throw new Error("No fields provided for update");
    }

    const patch: Partial<typeof formTables.$inferInsert> = {};
    if (title !== undefined) patch.title = title;
    if (Object.prototype.hasOwnProperty.call(payload, "description")) {
      patch.description = description ?? null;
    }

    const updateResult = await db
      .update(formTables)
      .set(patch)
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt),
        ),
      )
      .returning({ id: formTables.id });

    if (!updateResult || updateResult.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    return { id: updateResult[0]!.id };
  }

  // Publish form — sets status to PUBLISHED
  public async publishForm(payload: PublishFormInputType) {
    const { formId, userId } = await publishFormInput.parseAsync(payload);

    const updateResult = await db
      .update(formTables)
      .set({ status: "PUBLISHED" })
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt),
        ),
      )
      .returning({ id: formTables.id, status: formTables.status });

    if (!updateResult || updateResult.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    return { id: updateResult[0]!.id, status: updateResult[0]!.status };
  }

  // Unpublish form — sets status back to DRAFT
  public async unpublishForm(payload: UnpublishFormInputType) {
    const { formId, userId } = await unpublishFormInput.parseAsync(payload);

    const updateResult = await db
      .update(formTables)
      .set({ status: "DRAFT" })
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt),
        ),
      )
      .returning({ id: formTables.id, status: formTables.status });

    if (!updateResult || updateResult.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    return { id: updateResult[0]!.id, status: updateResult[0]!.status };
  }

  // Soft delete form — sets deletedAt timestamp
  public async deleteForm(payload: DeleteFormInputType) {
    const { formId, userId } = await deleteFormInput.parseAsync(payload);

    const updateResult = await db
      .update(formTables)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt), // can't delete already deleted
        ),
      )
      .returning({ id: formTables.id });

    if (!updateResult || updateResult.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    return { id: updateResult[0]!.id };
  }
}

export default FormService;
