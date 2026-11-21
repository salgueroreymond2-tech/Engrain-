import type { Prisma, RecordSource, UserRole } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { hashRecord } from "../../shared/security/integrity";
import { writeAudit } from "../../shared/services/audit.service";
import { mayServiceVehicle } from "../vehicles/vehicle-access.policy";
import { vehicleService } from "../vehicles/vehicle.service";

type Actor = { id: string; role: UserRole };
type EvidenceInput = { storageKey: string; fileName: string; mimeType: string; sizeBytes: number; sha256: string; type: "IMAGE" | "VIDEO" | "PDF" | "INVOICE" | "OBD_REPORT" };
type MaintenanceInput = {
  title: string;
  description?: string;
  performedAt?: Date;
  mileageKm?: number;
  workOrderId?: string;
  workshopId?: string;
  organizationId?: string;
  recordSource: RecordSource;
  identityStatus: "UNKNOWN" | "DECLARED" | "ORGANIZATION_IDENTIFIED" | "VERIFIED";
  evidences: EvidenceInput[];
};
type CorrectionInput = Pick<MaintenanceInput, "title" | "description" | "performedAt" | "mileageKm" | "recordSource" | "identityStatus" | "evidences"> & { correctionReason: string };
type Transaction = Prisma.TransactionClient;

const requireServiceAccess = async (vehicleId: string, actor: Actor) => {
  const access = await vehicleService.accessFor(vehicleId, actor);
  if (!mayServiceVehicle(access)) {
    throw new AppError(403, "FORBIDDEN", "A service or manage grant is required for this vehicle action.");
  }
};

const validateSourceAuthority = async (source: RecordSource, organizationId: string | undefined, workshopId: string | undefined, actor: Actor, requireWorkshop = false) => {
  if (source === "SIMULATED" && actor.role !== "SUPER_ADMIN") {
    throw new AppError(403, "FORBIDDEN", "Only a super administrator may create simulated records.");
  }
  if (source !== "WORKSHOP_RECORDED") return;
  if (!organizationId || (requireWorkshop && !workshopId)) {
    throw new AppError(422, "VALIDATION_ERROR", "Workshop records require an organization context and, when applicable, a workshop.");
  }
  if (actor.role === "SUPER_ADMIN") return;
  const membership = await prisma.organizationMember.findFirst({
    where: { organizationId, userId: actor.id, status: "ACTIVE" },
    select: { id: true }
  });
  const workshop = workshopId ? await prisma.workshop.findFirst({ where: { id: workshopId, organizationId, isActive: true }, select: { id: true } }) : { id: "organization-context" };
  if (!membership || !workshop) {
    throw new AppError(403, "FORBIDDEN", "The workshop organization context is not authorized.");
  }
};

const createFinalizedEvent = async (transaction: Transaction, input: {
  vehicleId: string;
  type: "MILEAGE_RECORDED" | "MILEAGE_INCONSISTENCY_DETECTED" | "MAINTENANCE_FINALIZED" | "MAINTENANCE_CORRECTED";
  source: RecordSource;
  authorUserId: string;
  organizationId?: string;
  summary: string;
  identityStatus: "UNKNOWN" | "DECLARED" | "ORGANIZATION_IDENTIFIED" | "VERIFIED";
  evidenceStatus?: "NONE" | "AVAILABLE" | "HASH_VERIFIED";
  maintenanceRecordId?: string;
  mileageLogId?: string;
  metadata?: Prisma.InputJsonValue;
  occurredAt?: Date;
}) => {
  const contentHash = hashRecord({
    vehicleId: input.vehicleId, type: input.type, source: input.source, authorUserId: input.authorUserId,
    organizationId: input.organizationId, summary: input.summary, maintenanceRecordId: input.maintenanceRecordId,
    mileageLogId: input.mileageLogId, metadata: input.metadata as never
  });
  return transaction.vehicleEvent.create({
    data: {
      ...input,
      integrityStatus: "FINALIZED",
      evidenceStatus: input.evidenceStatus ?? "NONE",
      contentHash,
      finalizedHash: hashRecord({ contentHash, version: 1 }),
      finalizedAt: new Date(),
      occurredAt: input.occurredAt ?? new Date()
    }
  });
};

const evidenceStatusFor = (evidences: EvidenceInput[]) => evidences.length > 0 ? "AVAILABLE" as const : "NONE" as const;

export const evaluateMileageInconsistency = (previousMileageKm: number | undefined, reportedMileageKm: number) => {
  if (previousMileageKm === undefined || reportedMileageKm >= previousMileageKm) {
    return { detected: false, reason: undefined };
  }
  return {
    detected: true,
    reason: `Reported mileage (${reportedMileageKm} km) is lower than a prior vehicle record (${previousMileageKm} km); review is required.`
  };
};

export const trustService = {
  async recordMileage(vehicleId: string, actor: Actor, input: { mileageKm: number; recordedAt?: Date; recordSource: RecordSource; identityStatus: "UNKNOWN" | "DECLARED" | "ORGANIZATION_IDENTIFIED" | "VERIFIED"; organizationId?: string }, requestId?: string) {
    await requireServiceAccess(vehicleId, actor);
    await validateSourceAuthority(input.recordSource, input.organizationId, undefined, actor);
    const recordedAt = input.recordedAt ?? new Date();
    const previous = await prisma.vehicleMileageLog.findFirst({
      where: { vehicleId, recordedAt: { lte: recordedAt } },
      orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }],
      select: { mileageKm: true }
    });
    const inconsistency = evaluateMileageInconsistency(previous?.mileageKm, input.mileageKm);

    return prisma.$transaction(async (transaction) => {
      const log = await transaction.vehicleMileageLog.create({
        data: { vehicleId, recordedByUserId: actor.id, organizationId: input.organizationId, mileageKm: input.mileageKm, recordSource: input.recordSource, identityStatus: input.identityStatus, inconsistencyDetected: inconsistency.detected, inconsistencyReason: inconsistency.reason, recordedAt }
      });
      await createFinalizedEvent(transaction, {
        vehicleId, type: "MILEAGE_RECORDED", source: input.recordSource, authorUserId: actor.id, organizationId: input.organizationId,
        summary: `Mileage recorded: ${input.mileageKm} km`, identityStatus: input.identityStatus, mileageLogId: log.id,
        metadata: { mileageKm: input.mileageKm, inconsistencyDetected: inconsistency.detected }, occurredAt: recordedAt
      });
      if (inconsistency.detected) {
        await createFinalizedEvent(transaction, {
          vehicleId, type: "MILEAGE_INCONSISTENCY_DETECTED", source: input.recordSource, authorUserId: actor.id, organizationId: input.organizationId,
          summary: "Mileage inconsistency requires review", identityStatus: input.identityStatus, mileageLogId: log.id,
          metadata: { reason: inconsistency.reason, previousMileageKm: previous?.mileageKm, reportedMileageKm: input.mileageKm }, occurredAt: recordedAt
        });
      }
      await writeAudit({ actorUserId: actor.id, organizationId: input.organizationId, vehicleId, action: "CREATE", entityType: "VehicleMileageLog", entityId: log.id, requestId, metadata: { inconsistencyDetected: inconsistency.detected } }, transaction);
      return { log, inconsistency };
    });
  },

  async createMaintenance(vehicleId: string, actor: Actor, input: MaintenanceInput, requestId?: string) {
    await requireServiceAccess(vehicleId, actor);
    await validateSourceAuthority(input.recordSource, input.organizationId, input.workshopId, actor, true);
    const evidenceStatus = evidenceStatusFor(input.evidences);
    const performedAt = input.performedAt ?? new Date();

    return prisma.$transaction(async (transaction) => {
      const record = await transaction.maintenanceRecord.create({
        data: {
          vehicleId, workOrderId: input.workOrderId, workshopId: input.workshopId, organizationId: input.organizationId,
          createdByUserId: actor.id, title: input.title, description: input.description, performedAt, mileageKm: input.mileageKm,
          recordSource: input.recordSource, identityStatus: input.identityStatus, evidenceStatus,
          contentHash: hashRecord({ vehicleId, title: input.title, description: input.description, performedAt, mileageKm: input.mileageKm, recordSource: input.recordSource, evidenceHashes: input.evidences.map((item) => item.sha256) })
        }
      });
      if (input.evidences.length > 0) {
        await transaction.serviceEvidence.createMany({ data: input.evidences.map((item) => ({ ...item, maintenanceRecordId: record.id, uploadedByUserId: actor.id })) });
      }
      await transaction.vehicleEvent.create({
        data: {
          vehicleId, type: "MAINTENANCE_RECORDED", source: input.recordSource, authorUserId: actor.id, organizationId: input.organizationId,
          summary: `Maintenance recorded: ${record.title}`, identityStatus: input.identityStatus, evidenceStatus,
          maintenanceRecordId: record.id, metadata: { version: record.version, evidenceCount: input.evidences.length }, occurredAt: performedAt
        }
      });
      await writeAudit({ actorUserId: actor.id, organizationId: input.organizationId, vehicleId, action: "CREATE", entityType: "MaintenanceRecord", entityId: record.id, requestId, metadata: { source: input.recordSource, version: 1 } }, transaction);
      return record;
    });
  },

  async finalizeMaintenance(recordId: string, actor: Actor, requestId?: string) {
    const record = await prisma.maintenanceRecord.findUnique({ where: { id: recordId }, include: { evidences: true } });
    if (!record) throw new AppError(404, "MAINTENANCE_NOT_FOUND", "The maintenance record does not exist.");
    await requireServiceAccess(record.vehicleId, actor);
    if (record.integrityStatus === "FINALIZED") {
      throw new AppError(409, "RECORD_FINALIZED", "Finalized records cannot be modified; create a correction version instead.");
    }
    const contentHash = hashRecord({ id: record.id, vehicleId: record.vehicleId, version: record.version, source: record.recordSource, title: record.title, description: record.description, performedAt: record.performedAt, mileageKm: record.mileageKm, evidenceHashes: record.evidences.map((evidence) => evidence.sha256).sort() });
    const finalizedAt = new Date();
    const finalizedHash = hashRecord({ contentHash, finalizedAt, authorUserId: record.createdByUserId, organizationId: record.organizationId });

    return prisma.$transaction(async (transaction) => {
      const finalized = await transaction.maintenanceRecord.update({ where: { id: recordId }, data: { status: "COMPLETED", integrityStatus: "FINALIZED", contentHash, finalizedHash, finalizedAt } });
      await createFinalizedEvent(transaction, {
        vehicleId: record.vehicleId, type: "MAINTENANCE_FINALIZED", source: record.recordSource, authorUserId: actor.id, organizationId: record.organizationId ?? undefined,
        summary: `Maintenance finalized: ${record.title}`, identityStatus: record.identityStatus, evidenceStatus: record.evidenceStatus,
        maintenanceRecordId: record.id, metadata: { contentHash, finalizedHash, version: record.version }, occurredAt: finalizedAt
      });
      await writeAudit({ actorUserId: actor.id, organizationId: record.organizationId ?? undefined, vehicleId: record.vehicleId, action: "UPDATE", entityType: "MaintenanceRecord", entityId: record.id, requestId, metadata: { integrityStatus: "FINALIZED", finalizedHash } }, transaction);
      return finalized;
    });
  },

  async correctMaintenance(recordId: string, actor: Actor, input: CorrectionInput, requestId?: string) {
    const original = await prisma.maintenanceRecord.findUnique({ where: { id: recordId }, include: { evidences: true } });
    if (!original) throw new AppError(404, "MAINTENANCE_NOT_FOUND", "The maintenance record does not exist.");
    await requireServiceAccess(original.vehicleId, actor);
    if (original.integrityStatus !== "FINALIZED") {
      throw new AppError(409, "RECORD_NOT_FINALIZED", "Use the draft record directly; correction versions are reserved for finalized records.");
    }
    const source = input.recordSource ?? original.recordSource;
    await validateSourceAuthority(source, original.organizationId ?? undefined, original.workshopId ?? undefined, actor, true);
    const evidences = input.evidences;
    const evidenceStatus = evidences.length > 0 ? evidenceStatusFor(evidences) : original.evidenceStatus;
    const performedAt = input.performedAt ?? original.performedAt ?? new Date();

    return prisma.$transaction(async (transaction) => {
      const correction = await transaction.maintenanceRecord.create({
        data: {
          vehicleId: original.vehicleId, workOrderId: original.workOrderId, workshopId: original.workshopId, organizationId: original.organizationId,
          createdByUserId: actor.id, title: input.title ?? original.title, description: input.description ?? original.description,
          performedAt, mileageKm: input.mileageKm ?? original.mileageKm, status: "IN_PROGRESS", recordSource: source,
          identityStatus: input.identityStatus ?? original.identityStatus, evidenceStatus, version: original.version + 1,
          supersedesId: original.id, correctionReason: input.correctionReason,
          contentHash: hashRecord({ supersedesId: original.id, version: original.version + 1, title: input.title ?? original.title, description: input.description ?? original.description, performedAt, mileageKm: input.mileageKm ?? original.mileageKm, source, evidenceHashes: evidences.map((item) => item.sha256) })
        }
      });
      if (evidences.length > 0) {
        await transaction.serviceEvidence.createMany({ data: evidences.map((item) => ({ ...item, maintenanceRecordId: correction.id, uploadedByUserId: actor.id })) });
      }
      await createFinalizedEvent(transaction, {
        vehicleId: original.vehicleId, type: "MAINTENANCE_CORRECTED", source, authorUserId: actor.id, organizationId: original.organizationId ?? undefined,
        summary: `Correction v${correction.version} created for maintenance ${original.id}`, identityStatus: correction.identityStatus, evidenceStatus,
        maintenanceRecordId: correction.id, metadata: { supersedesId: original.id, correctionReason: input.correctionReason, version: correction.version }, occurredAt: new Date()
      });
      await writeAudit({ actorUserId: actor.id, organizationId: original.organizationId ?? undefined, vehicleId: original.vehicleId, action: "CREATE", entityType: "MaintenanceCorrection", entityId: correction.id, requestId, metadata: { supersedesId: original.id, version: correction.version } }, transaction);
      return correction;
    });
  },

  async events(vehicleId: string, actor: Actor) {
    await vehicleService.accessFor(vehicleId, actor);
    return prisma.vehicleEvent.findMany({
      where: { vehicleId },
      include: { evidences: { select: { id: true, type: true, fileName: true, sha256: true, createdAt: true } } },
      orderBy: [{ occurredAt: "asc" }, { createdAt: "asc" }]
    });
  },

  async ownershipHistory(vehicleId: string, actor: Actor) {
    await vehicleService.accessFor(vehicleId, actor);
    return prisma.vehicleOwnership.findMany({
      where: { vehicleId },
      select: { id: true, ownerKind: true, acquiredAt: true, releasedAt: true, isCurrent: true, user: { select: { id: true, name: true } }, organization: { select: { id: true, name: true } } },
      orderBy: { acquiredAt: "asc" }
    });
  }
};
