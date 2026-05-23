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

export const listFormsInputModel = z.undefined();

export const listFormsOutputModel = z.array(
  z.object({
    id: z.string().describe("Unique identifier for the form"),
    title: z.string().describe("The title of the form"),
    description: z.string().nullable().describe("The optional description of the form"),
    createdAt: z.date().nullable().describe("Creation Timestamp"),
    updatedAt: z.date().nullable().describe("Last Updated Timestamp"),
  }),
);
