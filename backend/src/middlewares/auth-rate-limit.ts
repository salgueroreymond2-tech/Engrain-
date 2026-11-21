import type { RequestHandler } from "express";

import { env } from "../config/env";
import { AppError } from "../shared/errors/app-error";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** In-memory protection for the MVP. Replace with a shared store before horizontal scaling. */
export const authRateLimit: RequestHandler = (request, response, next) => {
  const now = Date.now();
  const key = `${request.ip}:${request.path}`;
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + env.AUTH_RATE_LIMIT_WINDOW_MS } : current;

  bucket.count += 1;
  buckets.set(key, bucket);
  response.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1_000));

  if (bucket.count > env.AUTH_RATE_LIMIT_MAX) {
    next(new AppError(429, "RATE_LIMITED", "Too many authentication attempts. Please try again later."));
    return;
  }

  next();
};

export const resetAuthRateLimitForTests = (): void => buckets.clear();
