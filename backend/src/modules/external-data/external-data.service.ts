import type { Prisma, UserRole } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { writeAudit } from "../../shared/services/audit.service";
import { mayManageVehicle } from "../vehicles/vehicle-access.policy";
import { vehicleService } from "../vehicles/vehicle.service";
import { normalizePlate } from "./plate";
import { vehicleInformationProvider, vehicleInformationProviders } from "./providers/registry";
import type { NormalizedPlate, ProviderCode, ProviderRecord } from "./providers/types";

type Actor = { id: string; role: UserRole };
type QueryInput = { providers?: ProviderCode[]; mode: "MANUAL" | "SIMULATED" };
type ManualDocumentInput = { institution: ProviderCode; type: string; fileName: string; mimeType: string; sizeBytes: number; sha256: string; sourceReference?: string; observedAt?: Date; notes?: string };
type Transaction = Prisma.TransactionClient;

const officialProviderCodes: ProviderCode[] = ["HACIENDA", "INS", "DEKRA", "COSEVI", "REGISTRO_NACIONAL"];

const asNumber = (value: unknown): number | undefined => typeof value === "number" && Number.isFinite(value) ? value : undefined;
const asString = (value: unknown): string | undefined => typeof value === "string" ? value : undefined;
const asDate = (value: unknown): Date | undefined => {
  if (typeof value !== "string") return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const providerRows = () => vehicleInformationProviders().map((provider) => ({
  code: provider.definition.code,
  name: provider.definition.name,
  status: provider.definition.status,
  supportsPlateLookup: provider.definition.supportsPlateLookup,
  allowsAutomation: provider.definition.allowsAutomation,
  requiresCredentials: provider.definition.requiresCredentials,
  requiresAgreement: provider.definition.requiresAgreement,
  documentationUrl: provider.definition.documentationUrl,
  manualPortalUrl: provider.definition.manualPortalUrl,
  dataClassification: provider.definition.dataClassification,
  termsSummary: provider.definition.termsSummary
}));

const ensureProviders = async () => {
  await Promise.all(providerRows().map((provider) => prisma.externalDataProvider.upsert({ where: { code: provider.code }, create: provider, update: provider })));
  return prisma.externalDataProvider.findMany({ orderBy: { name: "asc" } });
};

const requireManagedVehicle = async (vehicleId: string, actor: Actor) => {
  const access = await vehicleService.accessFor(vehicleId, actor);
  if (!mayManageVehicle(access)) throw new AppError(403, "FORBIDDEN", "Manage access is required for external vehicle information.");
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true, plate: true } });
  if (!vehicle) throw new AppError(404, "VEHICLE_NOT_FOUND", "The requested vehicle does not exist.");
  return vehicle;
};

const queryVisibleTo = async (queryId: string, actor: Actor) => {
  const query = await prisma.vehicleExternalQuery.findUnique({
    where: { id: queryId },
    include: { records: { include: { provider: true }, orderBy: { retrievedAt: "desc" } }, verificationLogs: { orderBy: { createdAt: "desc" } } }
  });
  if (!query) throw new AppError(404, "EXTERNAL_QUERY_NOT_FOUND", "The requested external query does not exist.");
  if (query.vehicleId) {
    const access = await vehicleService.accessFor(query.vehicleId, actor);
    if (!mayManageVehicle(access)) throw new AppError(404, "EXTERNAL_QUERY_NOT_FOUND", "The requested external query does not exist.");
  } else if (actor.role !== "SUPER_ADMIN" && query.requestedByUserId !== actor.id) {
    throw new AppError(404, "EXTERNAL_QUERY_NOT_FOUND", "The requested external query does not exist.");
  }
  return query;
};

const persistSpecializedRecord = async (transaction: Transaction, recordId: string, vehicleId: string | undefined, record: ProviderRecord) => {
  const data = record.data;
  if (record.type === "TAX") await transaction.vehicleTaxRecord.create({ data: { externalRecordId: recordId, vehicleId, fiscalValue: asNumber(data.fiscalValue), propertyTax: asNumber(data.propertyTax), currency: asString(data.currency), taxPeriod: asString(data.taxPeriod), data: data as Prisma.InputJsonValue } });
  if (record.type === "INSURANCE") await transaction.vehicleInsuranceRecord.create({ data: { externalRecordId: recordId, vehicleId, marchamoStatus: asString(data.marchamoStatus), paymentStatus: asString(data.paymentStatus), period: asString(data.period), quotedAmount: asNumber(data.quotedAmount), currency: asString(data.currency), data: data as Prisma.InputJsonValue } });
  if (record.type === "INSPECTION") await transaction.vehicleInspectionRecord.create({ data: { externalRecordId: recordId, vehicleId, inspectedAt: asDate(data.inspectedAt), result: asString(data.result), expiresAt: asDate(data.expiresAt), defects: (data.defects ?? []) as Prisma.InputJsonValue, data: data as Prisma.InputJsonValue } });
  if (record.type === "TRAFFIC") await transaction.vehicleTrafficRecord.create({ data: { externalRecordId: recordId, vehicleId, infractionCount: asNumber(data.infractionCount), outstandingAmount: asNumber(data.outstandingAmount), currency: asString(data.currency), data: data as Prisma.InputJsonValue } });
  if (record.type === "REGISTRY") await transaction.vehicleRegistryRecord.create({ data: { externalRecordId: recordId, vehicleId, vin: asString(data.vin), registryStatus: asString(data.registryStatus), characteristics: (data.characteristics ?? {}) as Prisma.InputJsonValue, encumbrances: (data.encumbrances ?? []) as Prisma.InputJsonValue, ownershipDisclosed: false, data: data as Prisma.InputJsonValue } });
  if (record.type === "LEGAL") await transaction.vehicleLegalRecord.create({ data: { externalRecordId: recordId, vehicleId, legalStatus: asString(data.legalStatus), encumbrances: (data.encumbrances ?? []) as Prisma.InputJsonValue, annotations: (data.annotations ?? []) as Prisma.InputJsonValue, data: data as Prisma.InputJsonValue } });
};

const executeQuery = async (actor: Actor, plate: NormalizedPlate, input: QueryInput, vehicleId?: string, requestId?: string) => {
  const providers = input.providers ?? (input.mode === "SIMULATED" ? ["MOCK"] : officialProviderCodes);
  if (input.mode === "SIMULATED" && actor.role !== "SUPER_ADMIN") throw new AppError(403, "FORBIDDEN", "Only a super administrator may request simulated external data.");
  if (input.mode === "SIMULATED" && (providers.length !== 1 || providers[0] !== "MOCK")) {
    throw new AppError(422, "VALIDATION_ERROR", "SIMULATED mode may only use the MOCK provider.");
  }
  if (input.mode === "MANUAL" && providers.includes("MOCK")) throw new AppError(422, "VALIDATION_ERROR", "MOCK may only be used in SIMULATED mode.");
  if (providers.includes("MANUAL_DOCUMENT")) throw new AppError(422, "VALIDATION_ERROR", "Attach documents through the manual document endpoint.");
  const providerMap = new Map((await ensureProviders()).map((provider) => [provider.code, provider]));

  return prisma.$transaction(async (transaction) => {
    const query = await transaction.vehicleExternalQuery.create({
      data: {
        vehicleId, requestedByUserId: actor.id, plateCategory: plate.category, plateCode: plate.code, plateNumber: plate.number, normalizedPlate: plate.normalized,
        requestedProviders: providers, status: "PENDING", queryMethod: input.mode === "SIMULATED" ? "MOCK" : "MANUAL_PORTAL", source: input.mode === "SIMULATED" ? "ENGRAIN_SIMULATION" : "USER_REQUEST"
      }
    });
    await transaction.externalVerificationLog.create({ data: { queryId: query.id, actorUserId: actor.id, event: "QUERY_REQUESTED", status: "PENDING", metadata: { providers, mode: input.mode } } });

    let completed = 0;
    let manualRequired = 0;
    for (const code of providers) {
      const adapter = vehicleInformationProvider(code);
      const provider = providerMap.get(code);
      if (!adapter || !provider) throw new AppError(422, "PROVIDER_NOT_FOUND", `Provider ${code} is not configured.`);
      const result = await adapter.lookup(plate);
      if (result.status === "COMPLETED") completed += 1;
      if (result.status === "MANUAL_REQUIRED") manualRequired += 1;
      if (result.records.length === 0) {
        await transaction.vehicleExternalRecord.create({ data: { queryId: query.id, vehicleId, providerId: provider.id, recordType: "DOCUMENT", method: input.mode === "SIMULATED" ? "MOCK" : "MANUAL_PORTAL", status: result.status, sourceUrl: provider.manualPortalUrl ?? provider.documentationUrl, data: { instructions: result.instructions ?? provider.termsSummary } as Prisma.InputJsonValue, isSimulated: false, errorCode: result.errorCode, errorMessage: result.errorMessage } });
      }
      for (const item of result.records) {
        const externalRecord = await transaction.vehicleExternalRecord.create({ data: { queryId: query.id, vehicleId, providerId: provider.id, recordType: item.type, method: input.mode === "SIMULATED" ? "MOCK" : "AUTHORIZED_API", status: result.status, sourceUrl: item.sourceUrl ?? provider.documentationUrl, sourceReference: item.sourceReference, evidenceType: item.evidenceType, data: item.data as Prisma.InputJsonValue, validUntil: item.validUntil, isSimulated: item.isSimulated } });
        await persistSpecializedRecord(transaction, externalRecord.id, vehicleId, item);
      }
      await transaction.externalVerificationLog.create({ data: { queryId: query.id, providerId: provider.id, actorUserId: actor.id, event: "PROVIDER_QUERY_EVALUATED", status: result.status, errorCode: result.errorCode, metadata: { providerStatus: provider.status, automated: input.mode === "SIMULATED", recordCount: result.records.length } } });
    }
    const status = completed > 0 && manualRequired > 0 ? "PARTIAL" : completed > 0 ? "COMPLETED" : manualRequired > 0 ? "MANUAL_REQUIRED" : "FAILED";
    const completedQuery = await transaction.vehicleExternalQuery.update({ where: { id: query.id }, data: { status, completedAt: new Date() }, include: { records: { include: { provider: true } } } });
    await writeAudit({ actorUserId: actor.id, vehicleId, action: "CREATE", entityType: "VehicleExternalQuery", entityId: query.id, requestId, metadata: { providers, status, mode: input.mode, normalizedPlate: plate.normalized } }, transaction);
    return completedQuery;
  }, { maxWait: 10_000, timeout: 30_000 });
};

export const externalDataService = {
  providers: ensureProviders,

  async queryVehicle(vehicleId: string, actor: Actor, input: QueryInput, requestId?: string) {
    const vehicle = await requireManagedVehicle(vehicleId, actor);
    if (!vehicle.plate) throw new AppError(422, "VEHICLE_PLATE_REQUIRED", "The vehicle must have a plate before external data can be queried.");
    return executeQuery(actor, normalizePlate({ number: vehicle.plate }), input, vehicleId, requestId);
  },

  async queryPlate(plateInput: { category?: string; code?: string; number: string }, actor: Actor, input: QueryInput, requestId?: string) {
    if (actor.role !== "SUPER_ADMIN") throw new AppError(403, "FORBIDDEN", "A vehicle context is required for plate-only external queries.");
    return executeQuery(actor, normalizePlate(plateInput), input, undefined, requestId);
  },

  async listForVehicle(vehicleId: string, actor: Actor) {
    await requireManagedVehicle(vehicleId, actor);
    return prisma.vehicleExternalQuery.findMany({ where: { vehicleId }, include: { records: { include: { provider: true } } }, orderBy: { requestedAt: "desc" } });
  },

  getQuery: queryVisibleTo,

  async retry(queryId: string, actor: Actor, requestId?: string) {
    const previous = await queryVisibleTo(queryId, actor);
    const requestedProviders = Array.isArray(previous.requestedProviders) ? previous.requestedProviders.filter((item): item is ProviderCode => typeof item === "string" && vehicleInformationProvider(item as ProviderCode) !== undefined) : [];
    if (requestedProviders.length === 0) throw new AppError(409, "QUERY_NOT_RETRYABLE", "This query has no retryable provider configuration.");
    const mode: QueryInput["mode"] = requestedProviders.includes("MOCK") ? "SIMULATED" : "MANUAL";
    const plate = { category: previous.plateCategory ?? undefined, code: previous.plateCode ?? undefined, number: previous.plateNumber };
    if (previous.vehicleId) return this.queryVehicle(previous.vehicleId, actor, { providers: requestedProviders, mode }, requestId);
    return this.queryPlate(plate, actor, { providers: requestedProviders, mode }, requestId);
  },

  async attachManualDocument(queryId: string, actor: Actor, input: ManualDocumentInput, requestId?: string) {
    const query = await queryVisibleTo(queryId, actor);
    const providers = await ensureProviders();
    const provider = providers.find((item) => item.code === "MANUAL_DOCUMENT");
    if (!provider) throw new AppError(500, "PROVIDER_CONFIGURATION_ERROR", "Manual document provider is unavailable.");
    const record = await prisma.$transaction(async (transaction) => {
      const created = await transaction.vehicleExternalRecord.create({
        data: {
          queryId: query.id, vehicleId: query.vehicleId, providerId: provider.id, recordType: "DOCUMENT", method: "MANUAL_DOCUMENT", status: "COMPLETED",
          sourceReference: input.sourceReference, evidenceType: input.type,
          data: { institution: input.institution, fileName: input.fileName, mimeType: input.mimeType, sizeBytes: input.sizeBytes, sha256: input.sha256, observedAt: input.observedAt?.toISOString(), notes: input.notes } as Prisma.InputJsonValue,
          retrievedAt: input.observedAt ?? new Date(), isSimulated: false
        }
      });
      await transaction.externalVerificationLog.create({ data: { queryId: query.id, providerId: provider.id, actorUserId: actor.id, event: "MANUAL_DOCUMENT_ATTACHED", status: "COMPLETED", metadata: { institution: input.institution, sha256: input.sha256 } } });
      await writeAudit({ actorUserId: actor.id, vehicleId: query.vehicleId ?? undefined, action: "CREATE", entityType: "VehicleExternalRecord", entityId: created.id, requestId, metadata: { method: "MANUAL_DOCUMENT", queryId } }, transaction);
      return created;
    });
    return record;
  }
};
