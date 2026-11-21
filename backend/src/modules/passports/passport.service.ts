import { randomBytes } from "node:crypto";

import { Prisma, type UserRole } from "@prisma/client";
import QRCode from "qrcode";

import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { writeAudit } from "../../shared/services/audit.service";
import { mayManageVehicle } from "../vehicles/vehicle-access.policy";
import { vehicleService } from "../vehicles/vehicle.service";

type Actor = { id: string; role: UserRole };
type CreatePassportInput = { vehicleId: string; expiresAt?: Date; snapshot?: Record<string, unknown> };

const PASSPORT_DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
const INFORMATION_GAP_DAYS = 180;
const generatePublicToken = (): string => randomBytes(32).toString("base64url");
const publicUrlFor = (token: string): string => `${env.PUBLIC_PASSPORT_URL.replace(/\/$/, "")}/${token}`;

const externalVehicle = (vehicle: { vin: string; make: string; model: string; year: number; mileageKm: number }) => ({
  vinMasked: `${vehicle.vin.slice(0, 3)}***********${vehicle.vin.slice(-3)}`,
  make: vehicle.make,
  model: vehicle.model,
  year: vehicle.year,
  mileageKm: vehicle.mileageKm
});

const publicEvidence = (evidence: { id: string; type: string; fileName: string; mimeType: string; sizeBytes: number; sha256: string; createdAt: Date }) => ({
  id: evidence.id,
  type: evidence.type,
  fileName: evidence.fileName,
  mimeType: evidence.mimeType,
  sizeBytes: evidence.sizeBytes,
  sha256: evidence.sha256,
  createdAt: evidence.createdAt,
  contentAvailable: false
});

const informationGaps = (vehicleCreatedAt: Date, technicalDates: Date[], now = new Date()) => {
  const dates = [vehicleCreatedAt, ...technicalDates].sort((left, right) => left.getTime() - right.getTime());
  const gaps: Array<{ startAt: Date; endAt: Date; daysWithoutInformation: number; reason: "NO_TECHNICAL_RECORDS" | "NO_RECENT_TECHNICAL_RECORDS" }> = [];
  for (let index = 1; index < dates.length; index += 1) {
    const previous = dates[index - 1];
    const current = dates[index];
    const days = Math.floor((current.getTime() - previous.getTime()) / 86_400_000);
    if (days > INFORMATION_GAP_DAYS) gaps.push({ startAt: previous, endAt: current, daysWithoutInformation: days, reason: "NO_TECHNICAL_RECORDS" });
  }
  const mostRecent = dates[dates.length - 1];
  const daysSinceLastRecord = Math.floor((now.getTime() - mostRecent.getTime()) / 86_400_000);
  if (daysSinceLastRecord > INFORMATION_GAP_DAYS) {
    gaps.push({ startAt: mostRecent, endAt: now, daysWithoutInformation: daysSinceLastRecord, reason: "NO_RECENT_TECHNICAL_RECORDS" });
  }
  return gaps.slice(-12);
};

const passportInclude = {
  vehicle: {
    include: {
      maintenanceRecords: {
        where: { status: "COMPLETED" as const },
        include: {
          workshop: { select: { name: true } },
          procedures: { select: { name: true, description: true, completedAt: true } },
          parts: { select: { partNumber: true, name: true, quantity: true } },
          evidences: { select: { id: true, type: true, fileName: true, mimeType: true, sizeBytes: true, sha256: true, createdAt: true } }
        },
        orderBy: { performedAt: "desc" as const }
      },
      diagnosticScans: {
        where: { status: { in: ["SUCCESS", "PARTIAL"] } },
        include: {
          troubleCodes: { select: { code: true, status: true, severity: true, description: true } },
          measurements: { select: { metric: true, label: true, rawValue: true, normalizedValue: true, unit: true, capturedAt: true, recordSource: true } },
          evidences: { select: { id: true, type: true, fileName: true, mimeType: true, sizeBytes: true, sha256: true, createdAt: true } }
        },
        orderBy: { scannedAt: "desc" as const }
      },
      mileageLogs: { orderBy: { recordedAt: "asc" as const } }
    }
  }
} satisfies Prisma.VehiclePassportInclude;

const publicPassportView = (passport: Prisma.VehiclePassportGetPayload<{ include: typeof passportInclude }>) => {
  const vehicle = passport.vehicle;
  const maintenances = vehicle.maintenanceRecords.map((record) => ({
    id: record.id,
    title: record.title,
    description: record.description,
    status: record.status,
    performedAt: record.performedAt,
    mileageKm: record.mileageKm,
    recordSource: record.recordSource,
    identityStatus: record.identityStatus,
    evidenceStatus: record.evidenceStatus,
    integrityStatus: record.integrityStatus,
    finalizedAt: record.finalizedAt,
    workshop: record.workshop ? { name: record.workshop.name } : null,
    procedures: record.procedures,
    parts: record.parts,
    evidences: record.evidences.map(publicEvidence)
  }));
  const diagnostics = vehicle.diagnosticScans.map((scan) => ({
    id: scan.id,
    scannedAt: scan.scannedAt,
    status: scan.status,
    source: scan.source,
    recordSource: scan.recordSource,
    isSimulated: scan.isSimulated,
    physicalConnectionVerified: scan.physicalConnectionVerified,
    providerKey: scan.providerKey,
    mileageKm: scan.mileageKm,
    integrityStatus: scan.integrityStatus,
    finalizedAt: scan.finalizedAt,
    troubleCodes: scan.troubleCodes,
    measurements: scan.measurements,
    evidences: scan.evidences.map(publicEvidence)
  }));
  const mileageHistory = vehicle.mileageLogs.map((record) => ({
    id: record.id,
    mileageKm: record.mileageKm,
    recordedAt: record.recordedAt,
    recordSource: record.recordSource,
    identityStatus: record.identityStatus,
    evidenceStatus: record.evidenceStatus,
    inconsistencyDetected: record.inconsistencyDetected,
    inconsistencyReason: record.inconsistencyReason
  }));
  const evidences = [...maintenances.flatMap((record) => record.evidences), ...diagnostics.flatMap((scan) => scan.evidences)];
  const workshopNames = [...new Set(maintenances.flatMap((record) => record.workshop ? [record.workshop.name] : []))];
  const alerts = [
    ...mileageHistory.filter((record) => record.inconsistencyDetected).map((record) => ({ type: "MILEAGE_REVIEW", severity: "WARNING", recordId: record.id, occurredAt: record.recordedAt, message: record.inconsistencyReason ?? "Mileage record requires review." })),
    ...diagnostics.flatMap((scan) => scan.troubleCodes.filter((code) => code.severity !== "INFO").map((code) => ({ type: "DIAGNOSTIC_TROUBLE_CODE", severity: code.severity, recordId: scan.id, occurredAt: scan.scannedAt, message: `${code.code}: ${code.description ?? "Diagnostic trouble code recorded."}` }))),
    ...diagnostics.filter((scan) => scan.isSimulated).map((scan) => ({ type: "SIMULATED_DIAGNOSTIC", severity: "INFO", recordId: scan.id, occurredAt: scan.scannedAt, message: "This diagnostic was generated for demonstration purposes." }))
  ];
  const technicalDates = [
    ...maintenances.map((record) => record.performedAt ?? vehicle.createdAt),
    ...diagnostics.map((scan) => scan.scannedAt),
    ...mileageHistory.map((record) => record.recordedAt)
  ];
  const finalizedRecords = maintenances.filter((record) => record.integrityStatus === "FINALIZED").length + diagnostics.filter((scan) => scan.integrityStatus === "FINALIZED").length;
  const evidenceBackedRecords = maintenances.filter((record) => record.evidences.length > 0).length + diagnostics.filter((scan) => scan.evidences.length > 0).length;

  return {
    passport: {
      publicToken: passport.publicToken,
      publicUrl: publicUrlFor(passport.publicToken),
      expiresAt: passport.expiresAt,
      vehicle: externalVehicle(vehicle),
      maintenanceRecords: maintenances,
      repairsDocumented: maintenances,
      diagnostics,
      mileageHistory,
      responsibleWorkshops: workshopNames.map((name) => ({ name })),
      evidenceCatalog: evidences,
      alerts,
      coverage: {
        technicalRecordCount: maintenances.length + diagnostics.length + mileageHistory.length,
        finalizedRecordCount: finalizedRecords,
        evidenceBackedRecordCount: evidenceBackedRecords,
        evidenceCount: evidences.length,
        periodStartsAt: vehicle.createdAt,
        periodEndsAt: technicalDates.length > 0 ? new Date(Math.max(...technicalDates.map((date) => date.getTime()))) : null,
        informationGapThresholdDays: INFORMATION_GAP_DAYS,
        informationGaps: informationGaps(vehicle.createdAt, technicalDates)
      },
      limitations: [
        "This passport excludes owner identities, contact details, access grants and private evidence files.",
        "Evidence metadata and hashes support traceability; they do not prove that a procedure occurred.",
        "A diagnostic record, including a simulated record, does not guarantee the current mechanical condition of the vehicle."
      ]
    }
  };
};

const requirePassportManagement = async (passportId: string, actor: Actor) => {
  const passport = await prisma.vehiclePassport.findUnique({ where: { id: passportId } });
  if (!passport) throw new AppError(404, "PASSPORT_NOT_FOUND", "The requested passport does not exist.");
  const access = await vehicleService.accessFor(passport.vehicleId, actor);
  if (!mayManageVehicle(access)) throw new AppError(404, "PASSPORT_NOT_FOUND", "The requested passport does not exist.");
  return passport;
};

export const passportService = {
  async create(actor: Actor, input: CreatePassportInput, requestId?: string) {
    const access = await vehicleService.accessFor(input.vehicleId, actor);
    if (!mayManageVehicle(access)) throw new AppError(403, "FORBIDDEN", "You do not have permission to share this vehicle passport.");
    const expiresAt = input.expiresAt ?? new Date(Date.now() + PASSPORT_DEFAULT_TTL_MS);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const publicToken = generatePublicToken();
      try {
        const passport = await prisma.vehiclePassport.create({
          data: {
            vehicleId: input.vehicleId,
            createdByUserId: actor.id,
            publicToken,
            visibility: "SHAREABLE",
            expiresAt,
            snapshot: input.snapshot as Prisma.InputJsonValue | undefined
          }
        });
        await writeAudit({ actorUserId: actor.id, vehicleId: input.vehicleId, action: "PASSPORT_SHARED", entityType: "VehiclePassport", entityId: passport.id, requestId, metadata: { expiresAt } });
        return { ...passport, publicUrl: publicUrlFor(passport.publicToken) };
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002" || attempt === 2) throw error;
      }
    }
    throw new AppError(500, "PASSPORT_TOKEN_GENERATION_FAILED", "Unable to generate a passport link.");
  },

  async getPrivate(id: string, actor: Actor) {
    const passport = await requirePassportManagement(id, actor);
    return { ...passport, publicUrl: publicUrlFor(passport.publicToken) };
  },

  async revoke(id: string, actor: Actor, requestId?: string) {
    const passport = await requirePassportManagement(id, actor);
    if (passport.status === "REVOKED") return passport;
    const revokedAt = new Date();
    const revoked = await prisma.vehiclePassport.update({ where: { id }, data: { status: "REVOKED", revokedAt, revokedByUserId: actor.id } });
    await writeAudit({ actorUserId: actor.id, vehicleId: passport.vehicleId, action: "PASSPORT_REVOKED", entityType: "VehiclePassport", entityId: id, requestId, metadata: { revokedAt } });
    return revoked;
  },

  async qrCode(id: string, actor: Actor) {
    const passport = await requirePassportManagement(id, actor);
    if (passport.status !== "ACTIVE" || passport.visibility !== "SHAREABLE" || passport.expiresAt <= new Date()) {
      throw new AppError(409, "PASSPORT_NOT_SHAREABLE", "Only active, unexpired shared passports can be converted to a QR code.");
    }
    const publicUrl = publicUrlFor(passport.publicToken);
    const qrCodeDataUrl = await QRCode.toDataURL(publicUrl, { errorCorrectionLevel: "M", margin: 1, width: 360 });
    return { passportId: passport.id, publicUrl, expiresAt: passport.expiresAt, qrCodeDataUrl };
  },

  async getPublic(publicToken: string, requestId?: string, ipAddress?: string) {
    const passport = await prisma.vehiclePassport.findFirst({
      where: { publicToken, visibility: "SHAREABLE", status: "ACTIVE", expiresAt: { gt: new Date() } },
      include: passportInclude
    });
    if (!passport) throw new AppError(404, "PASSPORT_NOT_FOUND", "The shared passport is unavailable.");
    await writeAudit({ vehicleId: passport.vehicleId, action: "PASSPORT_VIEWED", entityType: "VehiclePassport", entityId: passport.id, requestId, ipAddress });
    return publicPassportView(passport);
  }
};
