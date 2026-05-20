import { userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { setAuthenticationCookie } from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
} from "./model";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  // getSupportedAuthenticationProviders: publicProcedure
  //   .meta({ openapi: { method: "GET", path: getPath("/supported-providers"), tags: TAGS } })
  //   .input(zodUndefinedModel)
  //   .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
  //   .query(async () => {
  //     const supportedMethods = await userService.getAuthenticationMethods();
  //     return supportedMethods;
  //   }),

  //* Now will write the procedures for authentication like login, logout, register, etc. For example:

  // login: publicProcedure
  createUserWithEmailAndPassowrd: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/createUserWithEmailAndPassowrd"), tags: TAGS },
    })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      //mutation means it will change the state of the server, in this case it will create a new user in the database. You can implement the logic to create a user in your database here and return the created user's id or any other relevant information.
      const { email, password, fullName } = input;

      // Here you would typically call a service function to create the user in your database, for example:
      const { id, token } = await userService.createUserWithEmailAndPassword({
        email,
        password,
        fullName,
      });

      setAuthenticationCookie(ctx, token); // Set the authentication cookie with the generated token
      return { id };
    }),
});
