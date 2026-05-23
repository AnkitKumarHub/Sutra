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
