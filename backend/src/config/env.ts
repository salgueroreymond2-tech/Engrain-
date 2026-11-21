import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().min(1).default("postgresql://engrain:engrain@localhost:5432/engrain"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  ENABLE_SWAGGER: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  JWT_ACCESS_SECRET: z.string().min(32).default("development-access-secret-change-before-production"),
  JWT_REFRESH_SECRET: z.string().min(32).default("development-refresh-secret-change-before-production"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1_000).default(15 * 60 * 1_000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(100).default(10),
  AI_PROVIDER: z.enum(["local", "openai-compatible"]).default("local"),
  AI_API_BASE_URL: z.string().url().optional(),
  AI_API_KEY: z.string().min(1).optional(),
  AI_MODEL: z.string().trim().min(1).max(160).default("gpt-4.1-mini"),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(8_000),
  PUBLIC_PASSPORT_URL: z.string().url().default("http://localhost:5173/passports"),
  PASSPORT_PUBLIC_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1_000).default(15 * 60 * 1_000),
  PASSPORT_PUBLIC_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(1_000).default(60)
  , EXTERNAL_CREDENTIAL_ENCRYPTION_KEY: z.string().trim().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

if (
  parsed.data.NODE_ENV === "production" &&
  (parsed.data.JWT_ACCESS_SECRET.startsWith("development-") ||
    parsed.data.JWT_REFRESH_SECRET.startsWith("development-") ||
    parsed.data.JWT_ACCESS_SECRET.startsWith("change-me") ||
    parsed.data.JWT_REFRESH_SECRET.startsWith("change-me"))
) {
  throw new Error("JWT secrets must be replaced before running ENGRAIN in production.");
}

if (parsed.data.NODE_ENV === "production" && new URL(parsed.data.PUBLIC_PASSPORT_URL).hostname === "localhost") {
  throw new Error("PUBLIC_PASSPORT_URL must use the deployed frontend URL in production.");
}

export const env = {
  ...parsed.data,
  CORS_ORIGINS: parsed.data.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
};
