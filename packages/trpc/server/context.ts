import { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createCookieFactory, getCookieFactory, clearCookieFactory } from "./utils/cookie";

type RequestLike = {
  ip?: string;
  headers: Record<string, string | string[] | undefined>;
};

export interface TRPCCtxUser {
  id: string
}

export interface TRPCContext {
  createCookie: ReturnType<typeof createCookieFactory>;
  getCookie: ReturnType<typeof getCookieFactory>;
  clearCookie: ReturnType<typeof clearCookieFactory>;
  req: RequestLike;

  user?: TRPCCtxUser;

}

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<TRPCContext> {
  const ctx: TRPCContext = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookieFactory(res),
    req: {
      ip: req.ip,
      headers: req.headers as Record<string, string | string[] | undefined>,
    },

    user: undefined, // You can implement logic to extract user information from the request (e.g., from a JWT token in the Authorization header) and populate this field accordingly.
  };
  return ctx;
}
export type Context = Awaited<ReturnType<typeof createContext>>;
