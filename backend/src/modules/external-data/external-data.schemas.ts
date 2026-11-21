import { z } from "zod";

const cuid = z.string().cuid();
const providerCode = z.enum(["HACIENDA", "INS", "DEKRA", "COSEVI", "REGISTRO_NACIONAL", "MANUAL_DOCUMENT", "MOCK"]);

const plate = z.object({
  category: z.string().trim().min(1).max(24).optional(),
  code: z.string().trim().min(1).max(24).optional(),
  number: z.string().trim().min(1).max(64).regex(/^[A-Za-z0-9 -]+$/, "plate number may only include letters, digits, spaces and hyphens")
});

const requestInput = z.object({
  providers: z.array(providerCode).min(1).max(7).optional(),
  mode: z.enum(["MANUAL", "SIMULATED"]).default("MANUAL")
});

export const vehicleIdSchema = z.object({ id: cuid });
export const externalQueryIdSchema = z.object({ id: cuid });
export const vehicleExternalQuerySchema = requestInput;
export const plateExternalQuerySchema = requestInput.extend({ plate });

export const manualDocumentSchema = z.object({
  institution: providerCode.default("MANUAL_DOCUMENT"),
  type: z.enum(["PDF", "IMAGE", "INVOICE", "CERTIFICATE", "REPORT"]),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(3).max(127),
  sizeBytes: z.coerce.number().int().positive().max(25_000_000),
  sha256: z.string().regex(/^[a-fA-F0-9]{64}$/, "sha256 must be a 64-character hexadecimal digest"),
  sourceReference: z.string().trim().min(1).max(160).optional(),
  observedAt: z.coerce.date().optional(),
  notes: z.string().trim().max(2_000).optional()
});
