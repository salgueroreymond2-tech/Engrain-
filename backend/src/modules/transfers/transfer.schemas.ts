import { z } from "zod";

const cuid = z.string().cuid();

export const vehicleIdSchema = z.object({ id: cuid });
export const transferIdSchema = z.object({ id: cuid });

export const createTransferSchema = z.object({
  recipientEmail: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  expiresAt: z.coerce.date().optional()
}).superRefine((value, context) => {
  const now = new Date();
  const max = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1_000);
  if (value.expiresAt && value.expiresAt <= now) context.addIssue({ code: "custom", path: ["expiresAt"], message: "expiresAt must be in the future." });
  if (value.expiresAt && value.expiresAt > max) context.addIssue({ code: "custom", path: ["expiresAt"], message: "expiresAt cannot exceed 30 days." });
});
