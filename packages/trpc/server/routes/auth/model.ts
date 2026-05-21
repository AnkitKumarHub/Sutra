import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("User's email address"),
  password: z.string().min(6).describe("User's password"),
  fullName: z.string().min(2).describe("User's full name"),
});
export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("Unique identifier for the user"),
});

export const signInUserWithEmailAndPaswordInputModel = z.object({
  email: z.email().describe("The email address of the user"),
  password: z.string().min(8).describe("The password for the user, must be at least 8 characters"),
});

export const signInUserWithEmailAndPaswordOutputModel = z.object({
  id: z.string().describe("Unique identifier for the user"),
});
