import { asc, db, eq } from "@repo/database";
import { formTables } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";

import {
  type CreateFormInputType,
  type GetFormByIdInputType,
  type ListFormByUserIdInputType,
  createFormInput,
  getFormByIdInput,
  listFormByUserIdInput,
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
        createdAt: formTables.createdAt,
        updatedAt: formTables.updatedAt,
      })
      .from(formTables)
      .where(eq(formTables.createdBy, userId));

    return forms;
  }

  public async getFormById(payload: GetFormByIdInputType) {
    const { formId } = await getFormByIdInput.parseAsync(payload);

    const result = await db
      .select({
        formId: formTables.id,
        formTitle: formTables.title,
        formDescription: formTables.description,
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
      .where(eq(formTables.id, formId))
      .orderBy(asc(formFieldsTable.index));

    if (!result || result.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist`);
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
      createdAt: first.formCreatedAt,
      updatedAt: first.formUpdatedAt,
      fields,
    };
  }
}

export default FormService;
