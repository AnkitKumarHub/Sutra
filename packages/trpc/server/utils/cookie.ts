import type { CookieOptions, Response, Request } from "express";
import { TRPCContext } from "../context";

const ONE_MINUTE = 60 * 1000; //milliseconds
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_MONTH = 30 * ONE_DAY;
const ONE_YEAR = 12 * ONE_MONTH;

const isProduction = process.env.NODE_ENV === "production";

/** Cross-site frontend (e.g. Vercel) → API (e.g. Render) requires SameSite=None + Secure. */
function getAuthCookieOptions(maxAge: number): CookieOptions {
  return {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "strict",
    maxAge,
  };
}

const defaultCookieOptions: CookieOptions = getAuthCookieOptions(ONE_YEAR);

// ye function aisa function return karega jis se procedure cookies ko create kar skte hai
// aapne ek factory bnayi hai jo basically enable krega how to create cookie
export function createCookieFactory(res: Response) {
  return function createCookie(
    name: string,
    value: string,
    opts: CookieOptions = defaultCookieOptions,
  ) {
    res.cookie(name, value, opts);
  };
}

export function getCookieFactory(req: Request) {
  return function getCookie(name: string) {
    return req.cookies?.[name];
  };
}

export function clearCookieFactory(res: Response) {
  return function clearCookie(name: string, opts?: CookieOptions) {
    res.clearCookie(name, opts);
  };
}

const AUTHENTICATION_COOKIE_NAME = "authentication-token";
const REFRESH_COOKIE_NAME = "refresh-token";

export function setAuthenticationCookie(ctx: TRPCContext, accessToken: string) {
  ctx.createCookie(AUTHENTICATION_COOKIE_NAME, accessToken, getAuthCookieOptions(ONE_HOUR));
}

export function getAuthenticationCookie(ctx: TRPCContext) {
  return ctx.getCookie(AUTHENTICATION_COOKIE_NAME);
}

export function clearAuthenticationCookie(ctx: TRPCContext) {
  const { path, secure, sameSite } = getAuthCookieOptions(0);
  ctx.clearCookie(AUTHENTICATION_COOKIE_NAME, { path, secure, sameSite });
}

export function setRefreshTokenCookie(ctx: TRPCContext, refreshToken: string) {
  ctx.createCookie(REFRESH_COOKIE_NAME, refreshToken, getAuthCookieOptions(ONE_MONTH));
}

export function getRefreshTokenCookie(ctx: TRPCContext) {
  return ctx.getCookie(REFRESH_COOKIE_NAME);
}

export function clearRefreshTokenCookie(ctx: TRPCContext) {
  const { path, secure, sameSite } = getAuthCookieOptions(0);
  ctx.clearCookie(REFRESH_COOKIE_NAME, { path, secure, sameSite });
}
