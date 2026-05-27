import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import {
  clearAuthenticationCookie,
  clearRefreshTokenCookie,
  getAuthenticationCookie,
  getRefreshTokenCookie,
  setAuthenticationCookie,
  setRefreshTokenCookie,
} from "./utils/cookie";
import { userService } from "./services";

export const tRPCContext = initTRPC.meta<OpenApiMeta>().context<typeof createContext>().create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

// You can create other types of procedures like protectedProcedure, adminProcedure, etc. based on your authentication and authorization needs.
export const authenticatedProcedure = tRPCContext.procedure.use(async (options) => {
  const { ctx } = options;

  let id: string | null = null;
  const userToken = getAuthenticationCookie(ctx);

  if (userToken) {
    try {
      const decoded = await userService.verifyAndDecodeUserToken(userToken);
      id = decoded.id;
    } catch {
      // Fall through to refresh flow below.
    }
  }

  if (!id) {
    const refreshToken = getRefreshTokenCookie(ctx);
    if (!refreshToken) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No authentication token found" });
    }

    try {
      const refreshed = await userService.refreshAuthTokens(refreshToken);
      setAuthenticationCookie(ctx, refreshed.accessToken);
      setRefreshTokenCookie(ctx, refreshed.refreshToken);
      id = refreshed.id;
    } catch {
      clearAuthenticationCookie(ctx);
      clearRefreshTokenCookie(ctx);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired, please sign in again" });
    }
  }

  if (!id) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No valid session found" });
  }

  const user = await userService.getUserInfoById(id);
  if (user.isBlocked) {
    throw new TRPCError({ code: "FORBIDDEN", message: "User is blocked" });
  }

  return options.next({
    ctx: {
      ...ctx,
      user: { id: user.id },
    },
  });
});

export const adminProcedure = authenticatedProcedure.use(async (options) => {
  const { ctx } = options;

  const user = await userService.getUserInfoById(ctx.user.id);
  if (user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }

  return options.next();
});
