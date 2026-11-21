import type { Prisma, UserRole } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { hashRecord } from "../../shared/security/integrity";
import { writeAudit } from "../../shared/services/audit.service";
import { trustService } from "../trust/trust.service";
import { vehicleService } from "../vehicles/vehicle.service";
import type { ObdDiagnosticReading, ObdProvider } from "./obd.types";
import { SimulatedObdProvider, type SimulatedObdScenario } from "./simulated-obd.provider";

type Actor = { id: string; role: UserRole };

const scanInclude = {
  troubleCodes: { orderBy: { code: "asc" as const } },
  measurements: { orderBy: [{ capturedAt: "asc" as const }, { metric: "asc" as const }] },
  vehicle: { select: { id: true, vin: true, make: true, model: true, year: true } }
};

const requireVehicleVisibility = (vehicleId: string, actor: Actor) => vehicleService.accessFor(vehicleId, actor);

const readingHashInput = (vehicleId: string, reading: ObdDiagnosticReading) => ({
  vehicleId,
  providerKey: reading.providerKey,
  isSimulated: reading.isSimulated,
  physicalConnectionVerified: reading.physicalConnectionVerified,
  vin: reading.vin,
  capturedAt: reading.capturedAt,
  mileageKm: reading.mileageKm,
  status: reading.status,
  troubleCodes: reading.troubleCodes.map((item) => ({ code: item.code, status: item.status, severity: item.severity })),
  measurements: reading.measurements.map((item) => ({ metric: item.metric, rawValue: item.rawValue, normalizedValue: item.normalizedValue, unit: item.unit, capturedAt: item.capturedAt })),
  rawPayload: reading.rawPayload
});

export class DiagnosticService {
  async simulate(vehicleId: string, actor: Actor, scenario: SimulatedObdScenario, requestId?: string) {
    if (actor.role !== "SUPER_ADMIN") {
      throw new AppError(403, "FORBIDDEN", "Only a super administrator may create simulated diagnostic records.");
    }
    const vehicle = await vehicleService.getById(vehicleId, actor);
    const provider = new SimulatedObdProvider();
    const reading = await provider.read({ vehicleVin: vehicle.vin, scenario });
    return this.persistReading(vehicleId, actor, provider, reading, requestId);
  }

  /** Internal extension point for a vetted, read-only provider. This is not an HTTP write endpoint. */
  async persistReading(vehicleId: string, actor: Actor, provider: ObdProvider, reading: ObdDiagnosticReading, requestId?: string) {
    await requireVehicleVisibility(vehicleId, actor);
    if (reading.isSimulated && actor.role !== "SUPER_ADMIN") {
      throw new AppError(403, "FORBIDDEN", "Only a super administrator may persist simulated diagnostic records.");
    }
    if (reading.vin && reading.vin !== (await vehicleService.getById(vehicleId, actor)).vin) {
      throw new AppError(422, "VIN_MISMATCH", "The diagnostic VIN does not match the selected vehicle.");
    }
    if (!provider.isSimulated && !reading.physicalConnectionVerified) {
      throw new AppError(503, "OBD_HARDWARE_UNVERIFIED", "Physical OBD2 readings require validated compatible hardware.");
    }

    const contentHash = hashRecord(readingHashInput(vehicleId, reading));
    const finalizedAt = new Date();
    const finalizedHash = hashRecord({ contentHash, finalizedAt, authorUserId: actor.id, providerKey: reading.providerKey });
    const recordSource = reading.isSimulated ? "SIMULATED" as const : "OBD2_DEVICE" as const;
    const scan = await prisma.$transaction(async (transaction) => {
      const created = await transaction.diagnosticScan.create({
        data: {
          vehicleId,
          performedByUserId: actor.id,
          source: "OBD2",
          recordSource,
          providerKey: reading.providerKey,
          providerMetadata: reading.providerMetadata as Prisma.InputJsonValue | undefined,
          isSimulated: reading.isSimulated,
          physicalConnectionVerified: reading.physicalConnectionVerified,
          identityStatus: reading.isSimulated ? "DECLARED" : "UNKNOWN",
          evidenceStatus: "NONE",
          integrityStatus: "FINALIZED",
          contentHash,
          finalizedHash,
          finalizedAt,
          status: reading.status,
          mileageKm: reading.mileageKm,
          rawPayload: reading.rawPayload as Prisma.InputJsonValue,
          scannedAt: reading.capturedAt,
          troubleCodes: {
            create: reading.troubleCodes.map((item) => ({
              code: item.code,
              status: item.status,
              severity: item.severity,
              description: item.description
            }))
          },
          measurements: {
            create: reading.measurements.map((item) => ({
              metric: item.metric,
              label: item.label,
              rawValue: item.rawValue,
              normalizedValue: item.normalizedValue,
              unit: item.unit,
              recordSource,
              capturedAt: item.capturedAt,
              metadata: item.metadata as Prisma.InputJsonValue | undefined
            }))
          }
        },
        include: scanInclude
      });
      await transaction.vehicleEvent.create({
        data: {
          vehicleId,
          type: "DIAGNOSTIC_RECORDED",
          source: recordSource,
          authorUserId: actor.id,
          occurredAt: reading.capturedAt,
          summary: reading.isSimulated
            ? `Simulated OBD2 diagnostic recorded (${reading.providerKey})`
            : `Read-only OBD2 diagnostic recorded (${reading.providerKey})`,
          identityStatus: reading.isSimulated ? "DECLARED" : "UNKNOWN",
          evidenceStatus: "NONE",
          integrityStatus: "FINALIZED",
          contentHash,
          finalizedHash,
          finalizedAt,
          diagnosticScanId: created.id,
          metadata: {
            providerKey: reading.providerKey,
            isSimulated: reading.isSimulated,
            physicalConnectionVerified: reading.physicalConnectionVerified,
            troubleCodeCount: reading.troubleCodes.length,
            measurementCount: reading.measurements.length
          }
        }
      });
      await writeAudit({
        actorUserId: actor.id,
        vehicleId,
        action: "CREATE",
        entityType: "DiagnosticScan",
        entityId: created.id,
        requestId,
        metadata: { providerKey: reading.providerKey, isSimulated: reading.isSimulated, physicalConnectionVerified: reading.physicalConnectionVerified }
      }, transaction);
      return created;
    });

    // Mileage remains a separate traceable event so its neutral inconsistency review can be reused.
    if (reading.mileageKm !== undefined) {
      await trustService.recordMileage(vehicleId, actor, {
        mileageKm: reading.mileageKm,
        recordedAt: reading.capturedAt,
        recordSource,
        identityStatus: reading.isSimulated ? "DECLARED" : "UNKNOWN"
      }, requestId);
    }
    return scan;
  }

  async list(vehicleId: string, actor: Actor) {
    await requireVehicleVisibility(vehicleId, actor);
    return prisma.diagnosticScan.findMany({
      where: { vehicleId },
      include: {
        troubleCodes: { orderBy: { code: "asc" } },
        _count: { select: { measurements: true } }
      },
      orderBy: { scannedAt: "desc" }
    });
  }

  async get(scanId: string, actor: Actor) {
    const scan = await prisma.diagnosticScan.findUnique({ where: { id: scanId }, include: scanInclude });
    if (!scan) throw new AppError(404, "DIAGNOSTIC_NOT_FOUND", "The diagnostic record does not exist.");
    await requireVehicleVisibility(scan.vehicleId, actor);
    return scan;
  }

  async measurements(scanId: string, actor: Actor) {
    const scan = await this.get(scanId, actor);
    return { scanId: scan.id, scannedAt: scan.scannedAt, isSimulated: scan.isSimulated, measurements: scan.measurements };
  }

  async series(vehicleId: string, actor: Actor, metric: string, from?: Date, to?: Date, limit = 250) {
    await requireVehicleVisibility(vehicleId, actor);
    return prisma.diagnosticMeasurement.findMany({
      where: {
        metric,
        capturedAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) },
        scan: { vehicleId }
      },
      select: {
        id: true,
        metric: true,
        label: true,
        rawValue: true,
        normalizedValue: true,
        unit: true,
        recordSource: true,
        capturedAt: true,
        scan: { select: { id: true, isSimulated: true, providerKey: true, scannedAt: true } }
      },
      orderBy: { capturedAt: "asc" },
      take: limit
    });
  }
}

export const diagnosticService = new DiagnosticService();
