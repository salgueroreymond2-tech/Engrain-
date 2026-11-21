import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128)
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20).max(4_096)
});

export const sessionIdSchema = z.object({
  id: z.string().cuid()
});
