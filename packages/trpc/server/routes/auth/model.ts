import { z } from "zod";

export const createUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("User's email address"),
  password: z.string().min(8).describe("User's password"),
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

// here i dont want to call token so i want to make some disconnect
//cookie is something which automatically comes with the request 
export const getLoggedInUserInfoInputModel = z.undefined(); 

export const getLoggedInUserInfoOutputModel = z.object({
  id: z.string().describe("Unique identifier for the user"),
  email: z.email().describe("The email address of the user"),
  fullName: z.string().describe("The full name of the user"),
  profileImageUrl: z.string().describe("The URL of the user's profile image").optional().nullable(),
});
