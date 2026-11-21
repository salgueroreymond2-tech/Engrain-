import { z } from "zod";

export const createWorkshopSchema = z.object({
  organizationId: z.string().cuid(),
  name: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(5).max(40).optional(),
  address: z.string().trim().min(5).max(2_000).optional()
});

export const workshopIdSchema = z.object({ id: z.string().cuid() });
