import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().min(1).default("mysql://engrain:engrain@localhost:3306/engrain"),
  CORS_ORIGIN: z.string().min(1).default("http://localhost:5173"),
  ENABLE_SWAGGER: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  JWT_ACCESS_SECRET: z.string().min(32).default("development-access-secret-change-before-production"),
  JWT_REFRESH_SECRET: z.string().min(32).default("development-refresh-secret-change-before-production"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d")
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

export const env = {
  ...parsed.data,
  CORS_ORIGINS: parsed.data.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
};
