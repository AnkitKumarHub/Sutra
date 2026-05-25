import { and, asc, db, eq, isNull, max } from "@repo/database";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formTables } from "@repo/database/models/form";

import {
  type CreateFieldInputType,
  type DeleteFieldInputType,
  type GetFieldsByFormIdInputType,
  type UpdateFieldInputType,
  createFieldInput,
  deleteFieldInput,
  getFieldsByFormIdInput,
  updateFieldInput,
} from "./model";

class FormFieldService {
  private async getNextIndex(formId: string): Promise<string> {
    const result = await db
      .select({ maxIndex: max(formFieldsTable.index) })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));

    const current = result[0]?.maxIndex;
    const next = current ? parseFloat(String(current)) + 1 : 1;

    return next.toFixed(2);
  }

  private generateLabelKey(label: string) {
    const labelKey = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return labelKey || "field";
  }

  public async createField(payload: CreateFieldInputType) {
    const { formId, userId, label, description, placeholder, isRequired, type, options } =
      await createFieldInput.parseAsync(payload);

    // Verify form exists and user owns it
    const form = await db
      .select({ id: formTables.id })
      .from(formTables)
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt)
        )
      );

    if (!form || form.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    const labelKey = this.generateLabelKey(label);
    const index = await this.getNextIndex(formId);

    const fieldInsertResult = await db
      .insert(formFieldsTable)
      .values({
        formId,
        label,
        labelKey,
        description,
        placeholder,
        isRequired,
        index,
        type,
        options,
      })
      .returning({
        id: formFieldsTable.id,
      });

    if (!fieldInsertResult || fieldInsertResult.length === 0 || !fieldInsertResult[0]?.id) {
      throw new Error("Something went wrong while creating the field");
    }

    return {
      id: fieldInsertResult[0].id,
      labelKey,
      index,
    };
  }

  public async updateField(payload: UpdateFieldInputType) {
    const { fieldId, userId, ...values } = await updateFieldInput.parseAsync(payload);

    // Verify field exists and user owns the parent form
    const fieldCheck = await db
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

    if (!fieldCheck || fieldCheck.length === 0) {
      throw new Error(`Field with ID ${fieldId} does not exist or you do not have access`);
    }

    const patch: Partial<typeof formFieldsTable.$inferInsert> = {};

    if (values.label !== undefined) patch.label = values.label;
    if (values.type !== undefined) patch.type = values.type;
    if (values.isRequired !== undefined) patch.isRequired = values.isRequired;
    if (Object.prototype.hasOwnProperty.call(values, "description")) {
      patch.description = values.description ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(values, "placeholder")) {
      patch.placeholder = values.placeholder ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(values, "options")) {
      patch.options = values.options ?? null;
    }

    if (Object.keys(patch).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    const fieldUpdateResult = await db
      .update(formFieldsTable)
      .set(patch)
      .where(eq(formFieldsTable.id, fieldId))
      .returning({
        id: formFieldsTable.id,
      });

    if (!fieldUpdateResult || fieldUpdateResult.length === 0 || !fieldUpdateResult[0]?.id) {
      throw new Error(`Field with ID ${fieldId} could not be updated`);
    }

    return {
      id: fieldUpdateResult[0].id,
    };
  }

  public async deleteField(payload: DeleteFieldInputType) {
    const { fieldId, userId } = await deleteFieldInput.parseAsync(payload);

    // Verify field exists and user owns the parent form
    const fieldCheck = await db
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

    if (!fieldCheck || fieldCheck.length === 0) {
      throw new Error(`Field with ID ${fieldId} does not exist or you do not have access`);
    }

    const fieldDeleteResult = await db
      .delete(formFieldsTable)
      .where(eq(formFieldsTable.id, fieldId))
      .returning({
        id: formFieldsTable.id,
      });

    if (!fieldDeleteResult || fieldDeleteResult.length === 0 || !fieldDeleteResult[0]?.id) {
      throw new Error(`Field with ID ${fieldId} could not be deleted`);
    }

    return {
      id: fieldDeleteResult[0].id,
    };
  }

  public async getFieldsByFormId(payload: GetFieldsByFormIdInputType) {
    const { formId } = await getFieldsByFormIdInput.parseAsync(payload);

    const fields = await db
      .select({
        id: formFieldsTable.id,
        formId: formFieldsTable.formId,
        label: formFieldsTable.label,
        labelKey: formFieldsTable.labelKey,
        description: formFieldsTable.description,
        placeholder: formFieldsTable.placeholder,
        isRequired: formFieldsTable.isRequired,
        index: formFieldsTable.index,
        type: formFieldsTable.type,
        options: formFieldsTable.options,
        pageId: formFieldsTable.pageId,
        createdAt: formFieldsTable.createdAt,
        updatedAt: formFieldsTable.updatedAt,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.index));

    return fields;
  }
}

export default FormFieldService;
