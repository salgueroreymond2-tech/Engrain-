import type { RequestHandler } from "express";

import { AppError } from "../../shared/errors/app-error";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60 * 60 * 1_000;
const MAX_QUERIES = 20;

/** Conservative in-memory MVP limit. Use a shared store before horizontal scaling. */
export const externalQueryRateLimit: RequestHandler = (request, response, next) => {
  const now = Date.now();
  const actorId = response.locals.auth?.id ?? request.ip ?? "unknown";
  const current = buckets.get(actorId);
  const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + WINDOW_MS } : current;
  bucket.count += 1;
  buckets.set(actorId, bucket);
  response.setHeader("RateLimit-Limit", MAX_QUERIES);
  response.setHeader("RateLimit-Remaining", Math.max(0, MAX_QUERIES - bucket.count));
  response.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1_000));
  if (bucket.count > MAX_QUERIES) {
    next(new AppError(429, "RATE_LIMITED", "Too many external vehicle queries. Please try again later."));
    return;
  }
  next();
};

export const resetExternalQueryRateLimitForTests = (): void => buckets.clear();
