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
  getFieldsByFormIdInputModel,
  getFieldsByFormIdOutputModel,
  getFormSubmissionsInputModel,
  getFormSubmissionsOutputModel,
  getPublicFormByIdInputModel,
  getPublicFormByIdOutputModel,
  listFormsInputModel,
  listFormsOutputModel,
  submitPublicFormInputModel,
  submitPublicFormOutputModel,
  updateFieldInputModel,
  updateFieldOutputModel,
} from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  createForm: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createForm"), tags: TAGS, protect: true }, // protect: true indicates that this route requires authentication
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
  createField: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createField"), tags: TAGS, protect: true },
    })
    .input(createFieldInputModel)
    .output(createFieldOutputModel)
    .mutation(async ({ input }) => {
      const { formId, label, description, placeholder, isRequired, type, options } = input;

      const result = await formFieldService.createField({
        formId,
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
    .mutation(async ({ input }) => {
      const result = await formFieldService.updateField(input);
      return result;
    }),
  deleteField: authenticatedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/deleteField"), tags: TAGS, protect: true },
    })
    .input(deleteFieldInputModel)
    .output(deleteFieldOutputModel)
    .mutation(async ({ input }) => {
      const result = await formFieldService.deleteField(input);
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
  getPublicFormById: publicProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getById"), tags: TAGS },
    })
    .input(getPublicFormByIdInputModel)
    .output(getPublicFormByIdOutputModel)
    .query(async ({ input }) => {
      const result = await formService.getFormById({ formId: input.formId });
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
