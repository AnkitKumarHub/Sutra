import { db, eq } from "@repo/database";
import { formTables } from "@repo/database/models/form";

import {
  type CreateFormInputType,
  type ListFormByUserIdInputType,
  createFormInput,
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
}

export default FormService;
