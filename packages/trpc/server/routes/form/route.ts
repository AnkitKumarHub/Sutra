import { formFieldService, formPageService, formService, formSubmissionService, templateService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { submissionBus } from "../../utils/submission-bus";
import { assertUnlockRateLimit } from "../../utils/unlock-rate-limit";
import {
  assignFieldToPageInputModel,
  assignFieldToPageOutputModel,
  createFieldInputModel,
  createFieldOutputModel,
  createFormInputModel,
  createFormOutputModel,
  createPageInputModel,
  createPageOutputModel,
  deleteFieldInputModel,
  deleteFieldOutputModel,
  deleteFormInputModel,
  deleteFormOutputModel,
  deletePageInputModel,
  deletePageOutputModel,
  exportCsvInputModel,
  exportCsvOutputModel,
  getFieldsByFormIdInputModel,
  getFieldsByFormIdOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  getFormSubmissionsInputModel,
  getFormSubmissionsOutputModel,
  getPagesByFormIdInputModel,
  getPagesByFormIdOutputModel,
  getPublishedPagesBySlugInputModel,
  getPublishedPagesBySlugOutputModel,
  getPublishedFormBySlugInputModel,
  getPublishedFormBySlugOutputModel,
  listFormsInputModel,
  listFormsOutputModel,
  publishFormInputModel,
  publishFormOutputModel,
  reorderPagesInputModel,
  reorderPagesOutputModel,
  reorderFieldsInputModel,
  reorderFieldsOutputModel,
  setFormVisibilityInputModel,
  setFormVisibilityOutputModel,
  updateFormLimitsInputModel,
  updateFormLimitsOutputModel,
  updateFormNotificationSettingsInputModel,
  updateFormNotificationSettingsOutputModel,
  setFormPasswordInputModel,
  setFormPasswordOutputModel,
  submitPublicFormInputModel,
  submitPublicFormOutputModel,
  unlockFormInputModel,
  unlockFormOutputModel,
  unpublishFormInputModel,
  unpublishFormOutputModel,
  updateFieldInputModel,
  updateFieldOutputModel,
  updateFormInputModel,
  updateFormOutputModel,
  updatePageInputModel,
  updatePageOutputModel,
  cloneFormInputModel,
  cloneFormOutputModel,
  createFromTemplateInputModel,
  createFromTemplateOutputModel,
} from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createForm"), tags: TAGS, protect: true },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { title, description, slug } = input;

      const { id, slug: createdSlug } = await formService.createForm({
        title,
        description,
        slug,
        createdBy: ctx.user.id,
      });

      return { id, slug: createdSlug };
    }),
  listForms: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/listForms"), tags: TAGS, protect: true },
    })
    .input(listFormsInputModel)
    .output(listFormsOutputModel)
    .query(async ({ ctx }) => {
      const forms = await formService.listFormByUserId({
        userId: ctx.user.id,
      });

      return forms;
    }),
  updateForm: authenticatedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/updateForm"), tags: TAGS, protect: true },
    })
    .input(updateFormInputModel)
    .output(updateFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formService.updateForm({
        ...input,
        userId: ctx.user.id,
      });
      return result;
    }),
  publishForm: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/publishForm"), tags: TAGS, protect: true },
    })
    .input(publishFormInputModel)
    .output(publishFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formService.publishForm({
        ...input,
        userId: ctx.user.id,
      });
      return result;
    }),
  setFormVisibility: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/setVisibility"), tags: TAGS, protect: true },
    })
    .input(setFormVisibilityInputModel)
    .output(setFormVisibilityOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formService.setFormVisibility({
        formId: input.formId,
        userId: ctx.user.id,
        visibility: input.visibility,
      });
      return result;
    }),
  updateFormLimits: authenticatedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/updateLimits"), tags: TAGS, protect: true },
    })
    .input(updateFormLimitsInputModel)
    .output(updateFormLimitsOutputModel)
    .mutation(async ({ input, ctx }) => {
      return formService.updateFormLimits({ ...input, userId: ctx.user.id });
    }),
  updateFormNotificationSettings: authenticatedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/updateNotificationSettings"), tags: TAGS, protect: true },
    })
    .input(updateFormNotificationSettingsInputModel)
    .output(updateFormNotificationSettingsOutputModel)
    .mutation(async ({ input, ctx }) => {
      return formService.updateFormNotificationSettings({ ...input, userId: ctx.user.id });
    }),
  unpublishForm: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/unpublishForm"), tags: TAGS, protect: true },
    })
    .input(unpublishFormInputModel)
    .output(unpublishFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formService.unpublishForm({
        ...input,
        userId: ctx.user.id,
      });
      return result;
    }),
  deleteForm: authenticatedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/deleteForm"), tags: TAGS, protect: true },
    })
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formService.deleteForm({
        ...input,
        userId: ctx.user.id,
      });
      return result;
    }),
  createField: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createField"), tags: TAGS, protect: true },
    })
    .input(createFieldInputModel)
    .output(createFieldOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { formId, label, description, placeholder, isRequired, type, config } = input;

      const result = await formFieldService.createField({
        formId,
        userId: ctx.user.id,
        label,
        description,
        placeholder,
        isRequired,
        type,
        config,
      });

      return result;
    }),
  updateField: authenticatedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/updateField"), tags: TAGS, protect: true },
    })
    .input(updateFieldInputModel)
    .output(updateFieldOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formFieldService.updateField({
        ...input,
        userId: ctx.user.id,
      });
      return result;
    }),
  deleteField: authenticatedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/deleteField"), tags: TAGS, protect: true },
    })
    .input(deleteFieldInputModel)
    .output(deleteFieldOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formFieldService.deleteField({
        ...input,
        userId: ctx.user.id,
      });
      return result;
    }),
  reorderFields: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/reorderFields"), tags: TAGS, protect: true },
    })
    .input(reorderFieldsInputModel)
    .output(reorderFieldsOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formFieldService.reorderFields({
        formId: input.formId,
        pageId: input.pageId,
        fieldIds: input.fieldIds,
        userId: ctx.user.id,
      });
      return result;
    }),
  getFieldsByFormId: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getFieldsByFormId"), tags: TAGS, protect: true },
    })
    .input(getFieldsByFormIdInputModel)
    .output(getFieldsByFormIdOutputModel)
    .query(async ({ input }) => {
      const result = await formFieldService.getFieldsByFormId(input);
      return result;
    }),
  getFormById: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getByIdAuth"), tags: TAGS, protect: true },
    })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input, ctx }) => {
      const result = await formService.getFormByIdAuthenticated({
        formId: input.formId,
        userId: ctx.user.id,
      });
      return result;
    }),
  getPublishedFormBySlug: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getBySlug"), tags: TAGS },
    })
    .input(getPublishedFormBySlugInputModel)
    .output(getPublishedFormBySlugOutputModel)
    .query(async ({ input }) => {
      const result = await formService.getPublishedFormBySlug({
        slug: input.slug,
        unlockToken: input.unlockToken,
      });
      return result;
    }),
  submitPublicForm: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/submit"), tags: TAGS },
    })
    .input(submitPublicFormInputModel)
    .output(submitPublicFormOutputModel)
    .mutation(async ({ input }) => {
      const result = await formSubmissionService.createSubmission(input);

      // Fire-and-forget: broadcast real-time delta to any connected analytics clients
      submissionBus.emit("submission", {
        formId: input.formId,
        submissionId: result.id,
        submittedAt: result.submittedAt,
        values: result.values,
      });

      return { id: result.id };
    }),
  getFormSubmissions: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getSubmissions"), tags: TAGS, protect: true },
    })
    .input(getFormSubmissionsInputModel)
    .output(getFormSubmissionsOutputModel)
    .query(async ({ input, ctx }) => {
      const result = await formSubmissionService.getFormSubmissions({
        formId: input.formId,
        userId: ctx.user.id,
      });

      return result;
    }),
  cloneForm: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/cloneForm"), tags: TAGS, protect: true },
    })
    .input(cloneFormInputModel)
    .output(cloneFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formService.cloneForm({
        formId: input.formId,
        userId: ctx.user.id,
      });
      return result;
    }),
  exportCsv: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/exportCsv"), tags: TAGS, protect: true },
    })
    .input(exportCsvInputModel)
    .output(exportCsvOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formSubmissionService.exportCsv({
        formId: input.formId,
        userId: ctx.user.id,
        fieldIds: input.fieldIds,
      });
      return result;
    }),

  // ── PASSWORD PROTECTION ───────────────────────────────────────────────

  setFormPassword: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/setPassword"), tags: TAGS, protect: true },
    })
    .input(setFormPasswordInputModel)
    .output(setFormPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formService.setFormPassword({
        formId: input.formId,
        userId: ctx.user.id,
        password: input.password,
        unlockDurationMinutes: input.unlockDurationMinutes,
      });
      return result;
    }),

  unlockForm: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/unlock"), tags: TAGS },
    })
    .input(unlockFormInputModel)
    .output(unlockFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const forwardedFor = ctx.req.headers["x-forwarded-for"];
      const forwardedIp =
        typeof forwardedFor === "string"
          ? forwardedFor.split(",")[0]?.trim()
          : Array.isArray(forwardedFor)
            ? forwardedFor[0]?.trim()
            : undefined;
      const ip = (forwardedIp ?? ctx.req.ip ?? "unknown").trim() || "unknown";
      const unlockContext = await formService.getUnlockRateLimitContext(input.slug);
      const accountId = unlockContext?.accountId ?? `slug:${input.slug}`;

      await assertUnlockRateLimit({
        ip,
        slug: input.slug,
        accountId,
      });

      const result = await formService.unlockForm({
        slug: input.slug,
        password: input.password,
      });
      return result;
    }),

  // ── PAGES ─────────────────────────────────────────────────────────────

  createPage: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createPage"), tags: TAGS, protect: true },
    })
    .input(createPageInputModel)
    .output(createPageOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formPageService.createPage({
        formId: input.formId,
        userId: ctx.user.id,
        title: input.title,
      });
      return result;
    }),

  updatePage: authenticatedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/updatePage"), tags: TAGS, protect: true },
    })
    .input(updatePageInputModel)
    .output(updatePageOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formPageService.updatePage({
        pageId: input.pageId,
        userId: ctx.user.id,
        title: input.title,
      });
      return result;
    }),

  deletePage: authenticatedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/deletePage"), tags: TAGS, protect: true },
    })
    .input(deletePageInputModel)
    .output(deletePageOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formPageService.deletePage({
        pageId: input.pageId,
        userId: ctx.user.id,
      });
      return result;
    }),

  getPagesByFormId: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getPages"), tags: TAGS, protect: true },
    })
    .input(getPagesByFormIdInputModel)
    .output(getPagesByFormIdOutputModel)
    .query(async ({ input, ctx }) => {
      const result = await formPageService.getPagesByFormId({
        formId: input.formId,
        userId: ctx.user.id,
      });
      return result;
    }),

  getPublishedPagesBySlug: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getPublishedPagesBySlug"), tags: TAGS },
    })
    .input(getPublishedPagesBySlugInputModel)
    .output(getPublishedPagesBySlugOutputModel)
    .query(async ({ input }) => {
      const result = await formPageService.getPublishedPagesBySlug({ slug: input.slug });
      return result;
    }),

  reorderPages: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/reorderPages"), tags: TAGS, protect: true },
    })
    .input(reorderPagesInputModel)
    .output(reorderPagesOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formPageService.reorderPages({
        formId: input.formId,
        userId: ctx.user.id,
        pageIds: input.pageIds,
      });
      return result;
    }),

  assignFieldToPage: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/assignFieldToPage"), tags: TAGS, protect: true },
    })
    .input(assignFieldToPageInputModel)
    .output(assignFieldToPageOutputModel)
    .mutation(async ({ input, ctx }) => {
      const result = await formPageService.assignFieldToPage({
        fieldId: input.fieldId,
        userId: ctx.user.id,
        pageId: input.pageId,
      });
      return result;
    }),

  createFromTemplate: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createFromTemplate"), tags: TAGS, protect: true },
    })
    .input(createFromTemplateInputModel)
    .output(createFromTemplateOutputModel)
    .mutation(async ({ input, ctx }) => {
      const template = await templateService.getTemplateById(input.templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // Create the form with the template title
      const { id: formId, slug } = await formService.createForm({
        title: template.title,
        description: template.description ?? undefined,
        createdBy: ctx.user.id,
      });

      // Bulk-insert fields from template definition
      const fields = (template.fields as Array<{
        label: string;
        labelKey: string;
        type: "SHORT_TEXT" | "LONG_TEXT" | "EMAIL" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT" | "CHECKBOX" | "RATING" | "DATE";
        isRequired: boolean;
        placeholder?: string | null;
        description?: string | null;
        config?: {
          maxWords?: number;
          options?: string[];
          min?: number;
          max?: number;
          step?: number;
          mode?: "single" | "range";
        };
      }>);

      for (let i = 0; i < fields.length; i++) {
        const f = fields[i]!;
        await formFieldService.createField({
          formId,
          userId: ctx.user.id,
          label: f.label,
          type: f.type,
          isRequired: f.isRequired,
          placeholder: f.placeholder ?? undefined,
          description: f.description ?? undefined,
          config: f.config ?? {},
        });
      }

      // Fire-and-forget usage increment
      templateService.incrementUsageCount(input.templateId).catch(() => {});

      return { id: formId, slug };
    }),
});
