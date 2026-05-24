import { authenticatedProcedure, publicProcedure, router } from "../../trpc";
import { userService } from "../../services";
import {
  clearAuthenticationCookie,
  clearRefreshTokenCookie,
  getRefreshTokenCookie,
  setAuthenticationCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  getLoggedInUserInfoInputModel,
  getLoggedInUserInfoOutputModel,
  refreshTokenInputModel,
  refreshTokenOutputModel,
  signOutInputModel,
  signOutOutputModel,
  signInUserWithEmailAndPaswordInputModel,
  signInUserWithEmailAndPaswordOutputModel,
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

  // Now will write the procedures for authentication like login, logout, register, etc. For example:

  //* SignUp: publicProcedure
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
      const { id, accessToken, refreshToken } = await userService.createUserWithEmailAndPassword({
        email,
        password,
        fullName,
      });

      setAuthenticationCookie(ctx, accessToken);
      setRefreshTokenCookie(ctx, refreshToken);
      return { id };
    }),

  //* SignIn Procedure
  signInUserWithEmailAndPassword: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/signInUserWithEmailAndPassowrd"), tags: TAGS },
    })
    .input(signInUserWithEmailAndPaswordInputModel)
    .output(signInUserWithEmailAndPaswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      const { id, accessToken, refreshToken } = await userService.signInUserWithEmailAndPassword({
        email,
        password,
      });

      setAuthenticationCookie(ctx, accessToken);
      setRefreshTokenCookie(ctx, refreshToken);

      return {
        id,
      };
    }),

  refreshToken: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/refreshToken"), tags: TAGS },
    })
    .input(refreshTokenInputModel)
    .output(refreshTokenOutputModel)
    .mutation(async ({ ctx }) => {
      const refreshToken = getRefreshTokenCookie(ctx);
      if (!refreshToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Refresh token not found" });
      }

      const { id, accessToken, refreshToken: nextRefreshToken } =
        await userService.refreshAuthTokens(refreshToken);

      setAuthenticationCookie(ctx, accessToken);
      setRefreshTokenCookie(ctx, nextRefreshToken);

      return { id };
    }),

  signOut: authenticatedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/signOut"), tags: TAGS, protect: true },
    })
    .input(signOutInputModel)
    .output(signOutOutputModel)
    .mutation(async ({ ctx }) => {
      await userService.revokeAllRefreshTokensForUser(ctx.user.id);
      clearAuthenticationCookie(ctx);
      clearRefreshTokenCookie(ctx);
      return { success: true };
    }),

  //* Get Logged In User Info
  getLoggedInUserInfo: authenticatedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/getLoggedInUserInfo"), tags: TAGS, protect: true },
    })
    .input(getLoggedInUserInfoInputModel)
    .output(getLoggedInUserInfoOutputModel)
    .query(async ({ ctx }) => {
      const { id, email, fullName, profileImageUrl } = await userService.getUserInfoById(
        ctx.user.id,
      );
      return { id, email, fullName, profileImageUrl };
    }),
});
