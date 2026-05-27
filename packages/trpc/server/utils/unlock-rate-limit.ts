import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstashConfig = Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);

const redis = hasUpstashConfig
  ? new Redis({
      url: UPSTASH_REDIS_REST_URL!,
      token: UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const perIpLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 m"),
      prefix: "chaiforms:unlock:per-ip",
    })
  : null;

const perAccountLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "60 m"),
      prefix: "chaiforms:unlock:per-account",
    })
  : null;

type UnlockThrottleInput = {
  ip: string;
  slug: string;
  accountId: string;
};

export async function assertUnlockRateLimit({
  ip,
  slug,
  accountId,
}: UnlockThrottleInput): Promise<void> {
  if (!perIpLimiter || !perAccountLimiter) {
    return;
  }

  const [ipResult, accountResult] = await Promise.all([
    perIpLimiter.limit(`${ip}:${slug}`),
    perAccountLimiter.limit(accountId),
  ]);

  if (ipResult.success && accountResult.success) {
    return;
  }

  const now = Date.now();
  const resetAt = Math.max(ipResult.reset, accountResult.reset);
  const retryAfterMinutes = Math.max(1, Math.ceil((resetAt - now) / 60000));

  throw new TRPCError({
    code: "TOO_MANY_REQUESTS",
    message: `Too many unlock attempts. Try again in ${retryAfterMinutes} minute(s).`,
  });
}
