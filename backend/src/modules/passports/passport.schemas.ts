import { z } from "zod";

export const createPassportSchema = z.object({
  vehicleId: z.string().cuid(),
  expiresAt: z.coerce.date().optional(),
  snapshot: z.record(z.string(), z.unknown()).optional()
}).superRefine((value, context) => {
  if (value.expiresAt && value.expiresAt <= new Date()) {
    context.addIssue({ code: "custom", path: ["expiresAt"], message: "expiresAt must be in the future." });
  }
});

export const passportIdSchema = z.object({ id: z.string().cuid() });
export const publicTokenSchema = z.object({ publicToken: z.union([z.string().cuid(), z.string().regex(/^[A-Za-z0-9_-]{32,64}$/)]) });
