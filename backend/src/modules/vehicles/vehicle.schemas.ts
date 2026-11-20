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
  dataSource: z.enum(["MANUAL", "OBD2", "WORKSHOP", "AGENCY", "IMPORTED"]).default("MANUAL")
});

export const updateVehicleSchema = createVehicleSchema
  .omit({ vin: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");
