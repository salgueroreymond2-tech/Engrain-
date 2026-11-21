import type { RequestHandler } from "express";

import { env } from "../../config/env";
import { AppError } from "../../shared/errors/app-error";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** In-memory brute-force protection for unauthenticated passport links in the MVP. */
export const passportPublicRateLimit: RequestHandler = (request, response, next) => {
  const now = Date.now();
  const key = request.ip ?? "unknown";
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + env.PASSPORT_PUBLIC_RATE_LIMIT_WINDOW_MS }
    : current;
  bucket.count += 1;
  buckets.set(key, bucket);
  response.setHeader("RateLimit-Limit", env.PASSPORT_PUBLIC_RATE_LIMIT_MAX);
  response.setHeader("RateLimit-Remaining", Math.max(0, env.PASSPORT_PUBLIC_RATE_LIMIT_MAX - bucket.count));
  response.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1_000));
  if (bucket.count > env.PASSPORT_PUBLIC_RATE_LIMIT_MAX) {
    next(new AppError(429, "RATE_LIMITED", "Too many public passport requests. Please try again later."));
    return;
  }
  next();
};

export const resetPassportPublicRateLimitForTests = (): void => buckets.clear();
