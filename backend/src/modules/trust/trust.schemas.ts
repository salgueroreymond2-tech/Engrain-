import { z } from "zod";

const source = z.enum(["OBD2_DEVICE", "WORKSHOP_RECORDED", "EVIDENCE_BACKED", "OWNER_DECLARED", "SIMULATED"]);
const identityStatus = z.enum(["UNKNOWN", "DECLARED", "ORGANIZATION_IDENTIFIED", "VERIFIED"]);
const evidence = z.object({
  storageKey: z.string().trim().min(3).max(255),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(3).max(127),
  sizeBytes: z.coerce.number().int().positive().max(50_000_000),
  sha256: z.string().trim().toLowerCase().regex(/^[a-f0-9]{64}$/, "sha256 must be a 64-character hexadecimal digest."),
  type: z.enum(["IMAGE", "VIDEO", "PDF", "INVOICE", "OBD_REPORT"])
});

export const vehicleIdSchema = z.object({ id: z.string().cuid() });
export const recordIdSchema = z.object({ id: z.string().cuid() });

export const createMileageLogSchema = z.object({
  mileageKm: z.coerce.number().int().min(0).max(5_000_000),
  recordedAt: z.coerce.date().optional(),
  recordSource: source.default("OWNER_DECLARED"),
  identityStatus: identityStatus.default("DECLARED"),
  organizationId: z.string().cuid().optional()
});

const maintenanceFields = {
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(3).max(10_000).optional(),
  performedAt: z.coerce.date().optional(),
  mileageKm: z.coerce.number().int().min(0).max(5_000_000).optional(),
  workOrderId: z.string().cuid().optional(),
  workshopId: z.string().cuid().optional(),
  organizationId: z.string().cuid().optional(),
  recordSource: source.default("OWNER_DECLARED"),
  identityStatus: identityStatus.default("DECLARED"),
  evidences: z.array(evidence).max(12).default([])
};

export const createMaintenanceSchema = z.object(maintenanceFields).superRefine((value, context) => {
  if (value.recordSource === "EVIDENCE_BACKED" && value.evidences.length === 0) {
    context.addIssue({ code: "custom", path: ["evidences"], message: "EVIDENCE_BACKED records require at least one evidence item." });
  }
  if (value.recordSource === "WORKSHOP_RECORDED" && (!value.workshopId || !value.organizationId)) {
    context.addIssue({ code: "custom", message: "WORKSHOP_RECORDED records require workshopId and organizationId." });
  }
});

export const correctionSchema = z.object({
  correctionReason: z.string().trim().min(10).max(2_000),
  title: maintenanceFields.title.optional(),
  description: maintenanceFields.description,
  performedAt: maintenanceFields.performedAt,
  mileageKm: maintenanceFields.mileageKm,
  recordSource: source.optional(),
  identityStatus: identityStatus.optional(),
  evidences: z.array(evidence).max(12).default([])
});
