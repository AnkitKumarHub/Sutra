import { z } from "zod";

export const createFormInput = z.object({
  title: z
    .string()
    .min(1)
    .max(55)
    .describe("The title of the form"),
  description: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .describe("The optional description of the form"),
  createdBy: z.uuid().describe("The unique identifier of the user creating the form"),
});

export type CreateFormInputType = z.infer<typeof createFormInput>;

export const listFormByUserIdInput = z.object({
  userId: z.uuid().describe("The unique identifier of the user"),
});

export type ListFormByUserIdInputType = z.infer<typeof listFormByUserIdInput>;

export const getFormByIdInput = z.object({
  formId: z.uuid().describe("The unique identifier of the form"),
});

export type GetFormByIdInputType = z.infer<typeof getFormByIdInput>;
