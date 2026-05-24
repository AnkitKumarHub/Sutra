import { formFieldService, formService, formSubmissionService } from "../../services";
import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import {
  createFieldInputModel,
  createFieldOutputModel,
  createFormInputModel,
  createFormOutputModel,
  deleteFieldInputModel,
  deleteFieldOutputModel,
  deleteFormInputModel,
  deleteFormOutputModel,
  getFieldsByFormIdInputModel,
  getFieldsByFormIdOutputModel,
  getFormByIdInputModel,
  getFormByIdOutputModel,
  getFormSubmissionsInputModel,
  getFormSubmissionsOutputModel,
  getPublishedFormByIdInputModel,
  getPublishedFormByIdOutputModel,
  listFormsInputModel,
  listFormsOutputModel,
  publishFormInputModel,
  publishFormOutputModel,
  submitPublicFormInputModel,
  submitPublicFormOutputModel,
  unpublishFormInputModel,
  unpublishFormOutputModel,
  updateFieldInputModel,
  updateFieldOutputModel,
  updateFormInputModel,
  updateFormOutputModel,
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
      const { title, description } = input;

      const { id } = await formService.createForm({
        title,
        description,
        createdBy: ctx.user.id,
      });

      return { id };
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
      const { formId, label, description, placeholder, isRequired, type, options } = input;

      const result = await formFieldService.createField({
        formId,
        userId: ctx.user.id,
        label,
        description,
        placeholder,
        isRequired,
        type,
        options,
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
  getPublishedFormById: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getById"), tags: TAGS },
    })
    .input(getPublishedFormByIdInputModel)
    .output(getPublishedFormByIdOutputModel)
    .query(async ({ input }) => {
      const result = await formService.getPublishedFormById({ formId: input.formId });
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
      return result;
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
});
