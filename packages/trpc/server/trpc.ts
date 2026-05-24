import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-to-openapi";

import { createContext } from "./context";
import { getAuthenticationCookie } from "./utils/cookie";
import { userService } from "./services";

export const tRPCContext = initTRPC.meta<OpenApiMeta>().context<typeof createContext>().create({});

export const router = tRPCContext.router;

export const publicProcedure = tRPCContext.procedure;

// You can create other types of procedures like protectedProcedure, adminProcedure, etc. based on your authentication and authorization needs.
export const authenticatedProcedure = tRPCContext.procedure.use(async (options) => {
  const { ctx } = options;

  const userToken = getAuthenticationCookie(ctx);
  if (!userToken) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No authentication token found" });
  }

  const { id } =
    await userService.verifyAndDecodeUserToken(userToken);

  const user = await userService.getUserInfoById(id);
  if (user.isBlocked) {
    throw new TRPCError({ code: "FORBIDDEN", message: "User is blocked" });
  }

  return options.next({
    ctx: {
      ...ctx,
      user: { id },
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
