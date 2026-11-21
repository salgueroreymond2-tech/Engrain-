-- External vehicle-data providers are intentionally modeled separately from ENGRAIN's
-- internal technical history. This migration does not grant access to any provider.

CREATE TYPE "ExternalProviderCode" AS ENUM ('HACIENDA', 'INS', 'DEKRA', 'COSEVI', 'REGISTRO_NACIONAL', 'MANUAL_DOCUMENT', 'MOCK');
CREATE TYPE "ExternalProviderStatus" AS ENUM ('AVAILABLE', 'REQUIRES_CREDENTIALS', 'REQUIRES_AGREEMENT', 'MANUAL_ONLY', 'UNAVAILABLE', 'NOT_IMPLEMENTED');
CREATE TYPE "ExternalQueryStatus" AS ENUM ('PENDING', 'COMPLETED', 'PARTIAL', 'FAILED', 'MANUAL_REQUIRED');
CREATE TYPE "ExternalDataMethod" AS ENUM ('AUTHORIZED_API', 'MANUAL_PORTAL', 'MANUAL_DOCUMENT', 'MOCK');
CREATE TYPE "ExternalRecordType" AS ENUM ('VEHICLE_PROFILE', 'TAX', 'INSURANCE', 'INSPECTION', 'TRAFFIC', 'REGISTRY', 'LEGAL', 'DOCUMENT');

CREATE TABLE "external_data_providers" (
    "id" TEXT NOT NULL,
    "code" "ExternalProviderCode" NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "status" "ExternalProviderStatus" NOT NULL,
    "supportsPlateLookup" BOOLEAN NOT NULL DEFAULT false,
    "allowsAutomation" BOOLEAN NOT NULL DEFAULT false,
    "requiresCredentials" BOOLEAN NOT NULL DEFAULT false,
    "requiresAgreement" BOOLEAN NOT NULL DEFAULT false,
    "documentationUrl" VARCHAR(512),
    "manualPortalUrl" VARCHAR(512),
    "dataClassification" VARCHAR(80),
    "termsSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "external_data_providers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "external_provider_credentials" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "secretCiphertext" TEXT NOT NULL,
    "keyVersion" VARCHAR(32) NOT NULL,
    "scopes" JSONB,
    "expiresAt" TIMESTAMP(3),
    "lastValidatedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "external_provider_credentials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_external_queries" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT,
    "requestedByUserId" TEXT NOT NULL,
    "plateCategory" VARCHAR(24),
    "plateCode" VARCHAR(24),
    "plateNumber" VARCHAR(64) NOT NULL,
    "normalizedPlate" VARCHAR(128) NOT NULL,
    "requestedProviders" JSONB NOT NULL,
    "status" "ExternalQueryStatus" NOT NULL DEFAULT 'PENDING',
    "queryMethod" "ExternalDataMethod" NOT NULL,
    "source" VARCHAR(80) NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorCode" VARCHAR(80),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_external_queries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_external_records" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "providerId" TEXT NOT NULL,
    "recordType" "ExternalRecordType" NOT NULL,
    "method" "ExternalDataMethod" NOT NULL,
    "status" "ExternalQueryStatus" NOT NULL,
    "sourceUrl" VARCHAR(512),
    "sourceReference" VARCHAR(160),
    "evidenceType" VARCHAR(80),
    "data" JSONB,
    "retrievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "isSimulated" BOOLEAN NOT NULL DEFAULT false,
    "errorCode" VARCHAR(80),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_external_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_legal_records" (
    "id" TEXT NOT NULL,
    "externalRecordId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "legalStatus" VARCHAR(120),
    "encumbrances" JSONB,
    "annotations" JSONB,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_legal_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_tax_records" (
    "id" TEXT NOT NULL,
    "externalRecordId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "fiscalValue" DECIMAL(16,2),
    "propertyTax" DECIMAL(16,2),
    "currency" VARCHAR(8),
    "taxPeriod" VARCHAR(16),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_tax_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_insurance_records" (
    "id" TEXT NOT NULL,
    "externalRecordId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "marchamoStatus" VARCHAR(80),
    "paymentStatus" VARCHAR(80),
    "period" VARCHAR(16),
    "quotedAmount" DECIMAL(16,2),
    "currency" VARCHAR(8),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_insurance_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_inspection_records" (
    "id" TEXT NOT NULL,
    "externalRecordId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "inspectedAt" TIMESTAMP(3),
    "result" VARCHAR(80),
    "expiresAt" TIMESTAMP(3),
    "defects" JSONB,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_inspection_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_traffic_records" (
    "id" TEXT NOT NULL,
    "externalRecordId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "infractionCount" INTEGER,
    "outstandingAmount" DECIMAL(16,2),
    "currency" VARCHAR(8),
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_traffic_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_registry_records" (
    "id" TEXT NOT NULL,
    "externalRecordId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "vin" VARCHAR(32),
    "registryStatus" VARCHAR(120),
    "characteristics" JSONB,
    "encumbrances" JSONB,
    "ownershipDisclosed" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicle_registry_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "external_verification_logs" (
    "id" TEXT NOT NULL,
    "queryId" TEXT,
    "providerId" TEXT,
    "actorUserId" TEXT,
    "event" VARCHAR(120) NOT NULL,
    "status" "ExternalQueryStatus",
    "errorCode" VARCHAR(80),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "external_verification_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "external_data_providers_code_key" ON "external_data_providers"("code");
CREATE INDEX "external_provider_credentials_providerId_isActive_idx" ON "external_provider_credentials"("providerId", "isActive");
CREATE INDEX "vehicle_external_queries_vehicleId_requestedAt_idx" ON "vehicle_external_queries"("vehicleId", "requestedAt");
CREATE INDEX "vehicle_external_queries_normalizedPlate_requestedAt_idx" ON "vehicle_external_queries"("normalizedPlate", "requestedAt");
CREATE INDEX "vehicle_external_queries_requestedByUserId_requestedAt_idx" ON "vehicle_external_queries"("requestedByUserId", "requestedAt");
CREATE INDEX "vehicle_external_records_queryId_providerId_idx" ON "vehicle_external_records"("queryId", "providerId");
CREATE INDEX "vehicle_external_records_vehicleId_retrievedAt_idx" ON "vehicle_external_records"("vehicleId", "retrievedAt");
CREATE UNIQUE INDEX "vehicle_legal_records_externalRecordId_key" ON "vehicle_legal_records"("externalRecordId");
CREATE INDEX "vehicle_legal_records_vehicleId_createdAt_idx" ON "vehicle_legal_records"("vehicleId", "createdAt");
CREATE UNIQUE INDEX "vehicle_tax_records_externalRecordId_key" ON "vehicle_tax_records"("externalRecordId");
CREATE INDEX "vehicle_tax_records_vehicleId_taxPeriod_idx" ON "vehicle_tax_records"("vehicleId", "taxPeriod");
CREATE UNIQUE INDEX "vehicle_insurance_records_externalRecordId_key" ON "vehicle_insurance_records"("externalRecordId");
CREATE INDEX "vehicle_insurance_records_vehicleId_period_idx" ON "vehicle_insurance_records"("vehicleId", "period");
CREATE UNIQUE INDEX "vehicle_inspection_records_externalRecordId_key" ON "vehicle_inspection_records"("externalRecordId");
CREATE INDEX "vehicle_inspection_records_vehicleId_inspectedAt_idx" ON "vehicle_inspection_records"("vehicleId", "inspectedAt");
CREATE UNIQUE INDEX "vehicle_traffic_records_externalRecordId_key" ON "vehicle_traffic_records"("externalRecordId");
CREATE INDEX "vehicle_traffic_records_vehicleId_createdAt_idx" ON "vehicle_traffic_records"("vehicleId", "createdAt");
CREATE UNIQUE INDEX "vehicle_registry_records_externalRecordId_key" ON "vehicle_registry_records"("externalRecordId");
CREATE INDEX "vehicle_registry_records_vehicleId_createdAt_idx" ON "vehicle_registry_records"("vehicleId", "createdAt");
CREATE INDEX "external_verification_logs_queryId_createdAt_idx" ON "external_verification_logs"("queryId", "createdAt");
CREATE INDEX "external_verification_logs_providerId_createdAt_idx" ON "external_verification_logs"("providerId", "createdAt");

ALTER TABLE "external_provider_credentials" ADD CONSTRAINT "external_provider_credentials_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "external_data_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_external_queries" ADD CONSTRAINT "vehicle_external_queries_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicle_external_queries" ADD CONSTRAINT "vehicle_external_queries_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vehicle_external_records" ADD CONSTRAINT "vehicle_external_records_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "vehicle_external_queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_external_records" ADD CONSTRAINT "vehicle_external_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicle_external_records" ADD CONSTRAINT "vehicle_external_records_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "external_data_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vehicle_legal_records" ADD CONSTRAINT "vehicle_legal_records_externalRecordId_fkey" FOREIGN KEY ("externalRecordId") REFERENCES "vehicle_external_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_legal_records" ADD CONSTRAINT "vehicle_legal_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicle_tax_records" ADD CONSTRAINT "vehicle_tax_records_externalRecordId_fkey" FOREIGN KEY ("externalRecordId") REFERENCES "vehicle_external_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_tax_records" ADD CONSTRAINT "vehicle_tax_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicle_insurance_records" ADD CONSTRAINT "vehicle_insurance_records_externalRecordId_fkey" FOREIGN KEY ("externalRecordId") REFERENCES "vehicle_external_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_insurance_records" ADD CONSTRAINT "vehicle_insurance_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicle_inspection_records" ADD CONSTRAINT "vehicle_inspection_records_externalRecordId_fkey" FOREIGN KEY ("externalRecordId") REFERENCES "vehicle_external_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_inspection_records" ADD CONSTRAINT "vehicle_inspection_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicle_traffic_records" ADD CONSTRAINT "vehicle_traffic_records_externalRecordId_fkey" FOREIGN KEY ("externalRecordId") REFERENCES "vehicle_external_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_traffic_records" ADD CONSTRAINT "vehicle_traffic_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicle_registry_records" ADD CONSTRAINT "vehicle_registry_records_externalRecordId_fkey" FOREIGN KEY ("externalRecordId") REFERENCES "vehicle_external_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vehicle_registry_records" ADD CONSTRAINT "vehicle_registry_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "external_verification_logs" ADD CONSTRAINT "external_verification_logs_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "vehicle_external_queries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "external_verification_logs" ADD CONSTRAINT "external_verification_logs_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "external_data_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "external_verification_logs" ADD CONSTRAINT "external_verification_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
