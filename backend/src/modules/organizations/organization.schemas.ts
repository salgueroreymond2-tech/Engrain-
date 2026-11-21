import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  type: z.enum(["WORKSHOP", "DEALERSHIP"]),
  taxId: z.string().trim().min(3).max(64).optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().min(5).max(40).optional(),
  address: z.string().trim().min(5).max(2_000).optional()
});
