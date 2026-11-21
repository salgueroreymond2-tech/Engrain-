import type { UserRole } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { writeAudit } from "../../shared/services/audit.service";
import { vehicleService } from "../vehicles/vehicle.service";
import { configuredAiProvider, LocalDiagnosticAIProvider, type AiAnalysisContext, type AiAnalysisKind, type AiNarrative } from "./ai.provider";

type Actor = { id: string; role: UserRole };

export type HistoryReference = {
  entityType: "DiagnosticScan" | "DiagnosticTroubleCode" | "MaintenanceRecord" | "MaintenanceSchedule" | "VehicleMileageLog";
  id: string;
  occurredAt: Date;
  label: string;
  isSimulated?: boolean;
};

const supportedRecordIds = (context: AiAnalysisContext): HistoryReference[] => [
  ...context.diagnostics.flatMap((scan) => [
    { entityType: "DiagnosticScan" as const, id: scan.id, occurredAt: scan.scannedAt, label: `Diagnóstico ${scan.id}`, isSimulated: scan.isSimulated },
    ...scan.troubleCodes.map((code) => ({ entityType: "DiagnosticTroubleCode" as const, id: `${scan.id}:${code.code}`, occurredAt: scan.scannedAt, label: `DTC ${code.code}`, isSimulated: scan.isSimulated }))
  ]),
  ...context.maintenances.map((record) => ({ entityType: "MaintenanceRecord" as const, id: record.id, occurredAt: record.performedAt ?? new Date(0), label: record.title })),
  ...context.schedules.map((schedule) => ({ entityType: "MaintenanceSchedule" as const, id: schedule.id, occurredAt: schedule.nextDueAt ?? new Date(0), label: schedule.title })),
  ...context.mileageLogs.map((log) => ({ entityType: "VehicleMileageLog" as const, id: log.id, occurredAt: log.recordedAt, label: `${log.mileageKm} km` }))
];

export class DiagnosticAIService {
  async analyze(vehicleId: string, actor: Actor, kind: AiAnalysisKind, options: { scanId?: string; question?: string }, requestId?: string) {
    await vehicleService.accessFor(vehicleId, actor);
    const [vehicle, diagnostics, maintenances, schedules, mileageLogs] = await Promise.all([
      prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true, make: true, model: true, year: true, mileageKm: true } }),
      prisma.diagnosticScan.findMany({
        where: { vehicleId, ...(options.scanId ? { id: options.scanId } : {}) },
        select: { id: true, scannedAt: true, mileageKm: true, isSimulated: true, troubleCodes: { select: { code: true, severity: true, description: true }, orderBy: { code: "asc" } } },
        orderBy: { scannedAt: "desc" },
        take: options.scanId ? 1 : 30
      }),
      prisma.maintenanceRecord.findMany({ where: { vehicleId }, select: { id: true, title: true, performedAt: true, mileageKm: true, status: true }, orderBy: { performedAt: "desc" }, take: 30 }),
      prisma.maintenanceSchedule.findMany({ where: { vehicleId, status: "ACTIVE" }, select: { id: true, title: true, intervalKm: true, intervalDays: true, nextDueMileageKm: true, nextDueAt: true }, orderBy: { createdAt: "desc" }, take: 30 }),
      prisma.vehicleMileageLog.findMany({ where: { vehicleId }, select: { id: true, mileageKm: true, recordedAt: true, inconsistencyDetected: true, inconsistencyReason: true }, orderBy: { recordedAt: "desc" }, take: 50 })
    ]);
    if (!vehicle) throw new AppError(404, "VEHICLE_NOT_FOUND", "The requested vehicle does not exist.");
    if (options.scanId && diagnostics.length === 0) throw new AppError(404, "DIAGNOSTIC_NOT_FOUND", "The diagnostic record does not belong to this vehicle.");

    const context: AiAnalysisContext = { kind, question: options.question, vehicle, diagnostics, maintenances, schedules, mileageLogs };
    const fallback = new LocalDiagnosticAIProvider();
    const configured = configuredAiProvider();
    let narrative: AiNarrative;
    let provider = fallback.key;
    let fallbackUsed = false;
    try {
      if (!configured) throw new Error("No remote AI provider is configured");
      narrative = await configured.analyze(context);
      provider = configured.key;
    } catch {
      narrative = await fallback.analyze(context);
      fallbackUsed = Boolean(configured);
    }

    const references = supportedRecordIds(context);
    await writeAudit({
      actorUserId: actor.id,
      vehicleId,
      action: "AI_ANALYSIS_REQUESTED",
      entityType: "DiagnosticAIAnalysis",
      entityId: vehicleId,
      requestId,
      metadata: { kind, provider, fallbackUsed, scanId: options.scanId }
    });
    return {
      provider,
      fallbackUsed,
      simulatedDataIncluded: diagnostics.some((scan) => scan.isSimulated),
      response: narrative,
      supportingRecords: references,
      limitations: [
        "La IA sólo interpreta los registros autorizados disponibles y no modifica ningún dato.",
        "Una evidencia o hash aporta trazabilidad e integridad, pero no certifica que un procedimiento haya ocurrido.",
        "La respuesta no certifica reparaciones ni garantiza el estado mecánico del vehículo."
      ]
    };
  }
}

export const diagnosticAIService = new DiagnosticAIService();
