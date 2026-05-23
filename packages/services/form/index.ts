import { db } from "@repo/database";
import { formTables } from "@repo/database/models/form";

import { type CreateFormInputType, createFormInput } from "./model";

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
}

export default FormService;
