import { z } from "zod";

export const passportIdSchema = z.object({
  id: z.string().cuid(),
});

export const publicTokenSchema = z.object({
  publicToken: z.string().min(1),
});

export const createPassportSchema = z.object({
  vehicleId: z.string().cuid(),
  visibility: z.enum(["PRIVATE", "SHAREABLE", "PUBLIC"]).optional(),
});

export const updatePassportSchema = z.object({
  visibility: z.enum(["PRIVATE", "SHAREABLE", "PUBLIC"]).optional(),
  status: z.enum(["ACTIVE", "REVOKED"]).optional(),
}).strict();
