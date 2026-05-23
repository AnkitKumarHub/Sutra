import { z } from "zod";

export const createFormInputModel = z.object({
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
});

export const createFormOutputModel = z.object({
  id: z.string().describe("Unique identifier for the form"),
});
