import { z } from "zod";

const vin = z.string().trim().toUpperCase().regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN must contain 17 valid characters.");
const currentYear = new Date().getUTCFullYear();

export const vehicleIdSchema = z.object({ id: z.string().cuid() });

export const createVehicleSchema = z.object({
  vin,
  plate: z.string().trim().min(1).max(20).optional(),
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.coerce.number().int().min(1886).max(currentYear + 1),
  mileageKm: z.coerce.number().int().min(0).max(5_000_000).default(0),
  dataSource: z.enum(["MANUAL", "OBD2", "WORKSHOP", "DEALERSHIP", "IMPORTED"]).default("MANUAL"),
  registeredOrganizationId: z.string().cuid().optional()
});

export const updateVehicleSchema = createVehicleSchema
  .omit({ vin: true, registeredOrganizationId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

export const vehicleAccessGrantSchema = z
  .object({
    granteeUserId: z.string().cuid().optional(),
    organizationId: z.string().cuid().optional(),
    workshopId: z.string().cuid().optional(),
    permission: z.enum(["VIEW", "SERVICE", "MANAGE"]),
    expiresAt: z.coerce.date().optional()
  })
  .superRefine((value, context) => {
    const targetCount = [value.granteeUserId, value.organizationId, value.workshopId].filter(Boolean).length;
    if (targetCount !== 1) {
      context.addIssue({ code: "custom", message: "Exactly one granteeUserId, organizationId or workshopId is required." });
    }
    if (value.expiresAt && value.expiresAt <= new Date()) {
      context.addIssue({ code: "custom", path: ["expiresAt"], message: "expiresAt must be in the future." });
    }
  });
