import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("User's email address"),
  password: z.string().min(6).describe("User's password"),
  fullName: z.string().min(2).describe("User's full name"),
});
export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("Unique identifier for the user"),
});
