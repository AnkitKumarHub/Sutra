import * as bcrypt from "bcryptjs";
import * as JWT from "jsonwebtoken";
import { and, asc, db, eq, isNull } from "@repo/database";
import { formTables } from "@repo/database/models/form";
import { formFieldsTable } from "@repo/database/models/form-field";
import { formPagesTable } from "@repo/database/models/form-page";

import {
  type CreateFormInputType,
  type DeleteFormInputType,
  type GetFormByIdAuthenticatedInputType,
  type GetPublishedFormBySlugInputType,
  type ListFormByUserIdInputType,
  type PublishFormInputType,
  type SetFormPasswordInputType,
  type UnlockFormInputType,
  type UnpublishFormInputType,
  type UpdateFormInputType,
  type CloneFormInputType,
  createFormInput,
  deleteFormInput,
  getFormByIdAuthenticatedInput,
  getPublishedFormBySlugInput,
  listFormByUserIdInput,
  publishFormInput,
  setFormPasswordInput,
  unlockFormInput,
  unpublishFormInput,
  updateFormInput,
  cloneFormInput,
} from "./model";
import { env } from "../env";

class FormService {
  private generateBaseSlug(title: string) {
    return (
      title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "form"
    );
  }

  private async generateUniqueSlug(baseSlug: string, excludeFormId?: string): Promise<string> {
    let currentSlug = baseSlug;
    let attempt = 1;

    while (true) {
      const existing = await db
        .select({ id: formTables.id })
        .from(formTables)
        .where(eq(formTables.slug, currentSlug));

      if (!existing || existing.length === 0 || (excludeFormId && existing[0]?.id === excludeFormId)) {
        return currentSlug;
      }

      currentSlug = `${baseSlug}-${Math.floor(Math.random() * 10000)}`;
      attempt++;
      if (attempt > 10) {
        currentSlug = `${baseSlug}-${Date.now()}`;
      }
    }
  }

  public async createForm(payload: CreateFormInputType) {
    const { title, description, slug, createdBy } = await createFormInput.parseAsync(payload);

    const baseSlug = slug ? this.generateBaseSlug(slug) : this.generateBaseSlug(title);
    const uniqueSlug = await this.generateUniqueSlug(baseSlug);

    const formInsertResult = await db
      .insert(formTables)
      .values({
        title,
        description,
        slug: uniqueSlug,
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
      slug: uniqueSlug,
    };
  }

  public async listFormByUserId(payload: ListFormByUserIdInputType) {
    const { userId } = await listFormByUserIdInput.parseAsync(payload);

    const forms = await db
      .select({
        id: formTables.id,
        title: formTables.title,
        description: formTables.description,
        slug: formTables.slug,
        status: formTables.status,
        passwordHash: formTables.passwordHash,
        unlockDurationMinutes: formTables.unlockDurationMinutes,
        createdAt: formTables.createdAt,
        updatedAt: formTables.updatedAt,
      })
      .from(formTables)
      .where(
        and(
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt),
        ),
      );

    return forms.map((f) => ({
      ...f,
      isPasswordProtected: !!f.passwordHash,
      passwordHash: undefined, // never expose hash to client
    }));
  }

  // Public — returns form. If password-protected and no valid unlockToken, returns
  // isPasswordProtected:true + empty fields. Otherwise returns full form + fields.
  public async getPublishedFormBySlug(payload: GetPublishedFormBySlugInputType) {
    const { slug, unlockToken } = await getPublishedFormBySlugInput.parseAsync(payload);

    // Step 1: fetch form metadata (including passwordHash) without fields
    const [formRow] = await db
      .select({
        formId: formTables.id,
        formTitle: formTables.title,
        formDescription: formTables.description,
        formStatus: formTables.status,
        formSlug: formTables.slug,
        formPasswordHash: formTables.passwordHash,
        unlockDurationMinutes: formTables.unlockDurationMinutes,
        formCreatedAt: formTables.createdAt,
        formUpdatedAt: formTables.updatedAt,
      })
      .from(formTables)
      .where(
        and(
          eq(formTables.slug, slug),
          eq(formTables.status, "PUBLISHED"),
          isNull(formTables.deletedAt),
        ),
      );

    if (!formRow) {
      throw new Error(`Form with slug '${slug}' does not exist or is not published`);
    }

    const isPasswordProtected = !!formRow.formPasswordHash;

    // Step 2: if password-protected, validate the unlock token
    if (isPasswordProtected) {
      if (!unlockToken) {
        // No token — return metadata only, no fields
        return {
          id: formRow.formId,
          title: formRow.formTitle,
          description: formRow.formDescription,
          slug: formRow.formSlug,
          status: formRow.formStatus,
          isPasswordProtected: true as const,
          unlockDurationMinutes: formRow.unlockDurationMinutes ?? 30,
          createdAt: formRow.formCreatedAt,
          updatedAt: formRow.formUpdatedAt,
          fields: [] as Array<{
            id: string; label: string; labelKey: string;
            description: string | null; placeholder: string | null;
            isRequired: boolean; index: string;
            type: "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE";
            options: string | null; pageId: string | null;
            createdAt: Date | null; updatedAt: Date | null;
          }>,
        };
      }

      // Verify token
      try {
        const decoded = JWT.verify(unlockToken, env.JWT_SECRET) as {
          formId: string; type: string;
        };
        if (decoded.type !== "unlock" || decoded.formId !== formRow.formId) {
          throw new Error("Invalid unlock token");
        }
      } catch {
        throw new Error("Unlock token is invalid or expired");
      }
    }

    // Step 3: fetch fields (only reached if not protected OR token is valid)
    const fieldRows = await db
      .select({
        fieldId: formFieldsTable.id,
        fieldLabel: formFieldsTable.label,
        fieldLabelKey: formFieldsTable.labelKey,
        fieldDescription: formFieldsTable.description,
        fieldPlaceholder: formFieldsTable.placeholder,
        fieldIsRequired: formFieldsTable.isRequired,
        fieldIndex: formFieldsTable.index,
        fieldType: formFieldsTable.type,
        fieldOptions: formFieldsTable.options,
        fieldPageId: formFieldsTable.pageId,
        fieldCreatedAt: formFieldsTable.createdAt,
        fieldUpdatedAt: formFieldsTable.updatedAt,
      })
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formRow.formId))
      .orderBy(asc(formFieldsTable.index));

    const fields = fieldRows
      .filter((row) => row.fieldId)
      .map((row) => ({
        id: row.fieldId!,
        label: row.fieldLabel!,
        labelKey: row.fieldLabelKey!,
        description: row.fieldDescription,
        placeholder: row.fieldPlaceholder,
        isRequired: row.fieldIsRequired!,
        index: String(row.fieldIndex!),
        type: row.fieldType! as "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE",
        options: row.fieldOptions,
        pageId: row.fieldPageId,
        createdAt: row.fieldCreatedAt,
        updatedAt: row.fieldUpdatedAt,
      }));

    return {
      id: formRow.formId,
      title: formRow.formTitle,
      description: formRow.formDescription,
      slug: formRow.formSlug,
      status: formRow.formStatus,
      isPasswordProtected,
      unlockDurationMinutes: formRow.unlockDurationMinutes ?? 30,
      createdAt: formRow.formCreatedAt,
      updatedAt: formRow.formUpdatedAt,
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
        formSlug: formTables.slug,
        formPasswordHash: formTables.passwordHash,
        unlockDurationMinutes: formTables.unlockDurationMinutes,
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
        fieldPageId: formFieldsTable.pageId,
        fieldCreatedAt: formFieldsTable.createdAt,
        fieldUpdatedAt: formFieldsTable.updatedAt,
      })
      .from(formTables)
      .leftJoin(formFieldsTable, eq(formFieldsTable.formId, formTables.id))
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt),
        ),
      )
      .orderBy(asc(formFieldsTable.index));

    if (!result || result.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    const first = result[0]!;
    const fields = result
      .filter((row) => row.fieldId)
      .map((row) => ({
        id: row.fieldId!,
        label: row.fieldLabel!,
        labelKey: row.fieldLabelKey!,
        description: row.fieldDescription,
        placeholder: row.fieldPlaceholder,
        isRequired: row.fieldIsRequired!,
        index: String(row.fieldIndex!),
        type: row.fieldType! as "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE",
        options: row.fieldOptions,
        pageId: row.fieldPageId,
        createdAt: row.fieldCreatedAt,
        updatedAt: row.fieldUpdatedAt,
      }));

    return {
      id: first.formId,
      title: first.formTitle,
      description: first.formDescription,
      slug: first.formSlug,
      status: first.formStatus,
      isPasswordProtected: !!first.formPasswordHash,
      unlockDurationMinutes: first.unlockDurationMinutes ?? 30,
      createdAt: first.formCreatedAt,
      updatedAt: first.formUpdatedAt,
      fields,
    };
  }

  // Update form title/description/slug — owner only
  public async updateForm(payload: UpdateFormInputType) {
    const { formId, userId, title, description, slug } = await updateFormInput.parseAsync(payload);

    if (title === undefined && description === undefined && slug === undefined) {
      throw new Error("No fields provided for update");
    }

    const patch: Partial<typeof formTables.$inferInsert> = {};
    if (title !== undefined) patch.title = title;
    
    if (slug !== undefined) {
      const baseSlug = this.generateBaseSlug(slug);
      patch.slug = await this.generateUniqueSlug(baseSlug, formId);
    }
    
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
  
  // ── Clone form ────────────────────────────────────────────────────────
  public async cloneForm(payload: CloneFormInputType) {
    const { formId, userId } = await cloneFormInput.parseAsync(payload);

    // 1. Fetch original form
    const originalFormResult = await db
      .select()
      .from(formTables)
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt)
        )
      );

    if (!originalFormResult || originalFormResult.length === 0) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    const originalForm = originalFormResult[0]!;

    // 2. Create new form (carry over password settings)
    const newTitle = `${originalForm.title} (Copy)`;
    const newSlug = await this.generateUniqueSlug(this.generateBaseSlug(newTitle));

    const newFormResult = await db
      .insert(formTables)
      .values({
        title: newTitle,
        description: originalForm.description,
        slug: newSlug,
        status: "DRAFT",
        createdBy: userId,
        passwordHash: originalForm.passwordHash,
        unlockDurationMinutes: originalForm.unlockDurationMinutes,
      })
      .returning({ id: formTables.id });

    const newFormId = newFormResult[0]!.id;

    // 3. Clone pages and build old→new page ID map
    const originalPages = await db
      .select()
      .from(formPagesTable)
      .where(eq(formPagesTable.formId, formId))
      .orderBy(asc(formPagesTable.order));

    const pageIdMap = new Map<string, string>(); // oldId → newId
    if (originalPages.length > 0) {
      const newPageRows = await db
        .insert(formPagesTable)
        .values(
          originalPages.map((p) => ({
            formId: newFormId,
            title: p.title,
            order: p.order,
          }))
        )
        .returning({ id: formPagesTable.id });

      originalPages.forEach((p, i) => {
        pageIdMap.set(p.id, newPageRows[i]!.id);
      });
    }

    // 4. Clone fields with remapped pageId
    const originalFields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.index));

    if (originalFields.length > 0) {
      await db.insert(formFieldsTable).values(
        originalFields.map((field) => ({
          formId: newFormId,
          label: field.label,
          labelKey: field.labelKey,
          description: field.description,
          placeholder: field.placeholder,
          isRequired: field.isRequired,
          index: field.index,
          type: field.type,
          options: field.options,
          pageId: field.pageId ? (pageIdMap.get(field.pageId) ?? null) : null,
        }))
      );
    }

    return { id: newFormId, slug: newSlug };
  }

  // ── Password Protection ───────────────────────────────────────────────

  /**
   * Set or clear a password on a form.
   * Hashes with bcrypt (cost=10). Pass password=null to clear.
   */
  public async setFormPassword(payload: SetFormPasswordInputType) {
    const { formId, userId, password, unlockDurationMinutes } =
      await setFormPasswordInput.parseAsync(payload);

    let passwordHash: string | null = null;
    if (password !== null) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const patch: Record<string, unknown> = { passwordHash };
    if (unlockDurationMinutes !== undefined) {
      patch.unlockDurationMinutes = unlockDurationMinutes;
    } else if (password !== null) {
      // Keep existing duration if already set, else default to 30
      patch.unlockDurationMinutes = undefined; // don't overwrite
    }

    const [updated] = await db
      .update(formTables)
      .set(patch)
      .where(
        and(
          eq(formTables.id, formId),
          eq(formTables.createdBy, userId),
          isNull(formTables.deletedAt)
        )
      )
      .returning({
        id: formTables.id,
        passwordHash: formTables.passwordHash,
        unlockDurationMinutes: formTables.unlockDurationMinutes,
      });

    if (!updated) {
      throw new Error(`Form with ID ${formId} does not exist or you do not have access`);
    }

    return {
      id: updated.id,
      isPasswordProtected: updated.passwordHash !== null,
      unlockDurationMinutes: updated.unlockDurationMinutes ?? 30,
    };
  }

  /**
   * Verify a password against a form's hash and return a short-lived unlock token.
   * The token expiry is set by the form owner via unlockDurationMinutes.
   */
  public async unlockForm(payload: UnlockFormInputType) {
    const { slug, password } = await unlockFormInput.parseAsync(payload);

    const [form] = await db
      .select({
        id: formTables.id,
        passwordHash: formTables.passwordHash,
        unlockDurationMinutes: formTables.unlockDurationMinutes,
        status: formTables.status,
        deletedAt: formTables.deletedAt,
      })
      .from(formTables)
      .where(
        and(
          eq(formTables.slug, slug),
          eq(formTables.status, "PUBLISHED"),
          isNull(formTables.deletedAt)
        )
      );

    if (!form) {
      throw new Error("Form not found or not published");
    }

    if (!form.passwordHash) {
      throw new Error("This form is not password protected");
    }

    const isCorrect = await bcrypt.compare(password, form.passwordHash);
    if (!isCorrect) {
      throw new Error("Incorrect password");
    }

    const durationMinutes = form.unlockDurationMinutes ?? 30;
    const unlockToken = JWT.sign(
      { formId: form.id, type: "unlock" },
      env.JWT_SECRET,
      { expiresIn: `${durationMinutes}m` }
    );

    return { unlockToken, expiresInMinutes: durationMinutes };
  }
}

export default FormService;
