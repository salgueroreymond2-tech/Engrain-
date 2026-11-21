-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'WORKSHOP_ADMIN', 'MECHANIC', 'VEHICLE_OWNER', 'DEALERSHIP_ADMIN', 'SALES_AGENT');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('WORKSHOP', 'DEALERSHIP', 'PLATFORM');

-- CreateEnum
CREATE TYPE "OrganizationMemberStatus" AS ENUM ('ACTIVE', 'INVITED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'TRANSFER_PENDING');

-- CreateEnum
CREATE TYPE "VehicleDataSource" AS ENUM ('MANUAL', 'OBD2', 'WORKSHOP', 'DEALERSHIP', 'IMPORTED');

-- CreateEnum
CREATE TYPE "OwnershipKind" AS ENUM ('USER', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "VehicleAccessPermission" AS ENUM ('VIEW', 'SERVICE', 'MANAGE');

-- CreateEnum
CREATE TYPE "VehicleAccessGrantStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('OBD2_GENERIC', 'OBD2_BLUETOOTH', 'OEM');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVE', 'OFFLINE', 'REVOKED');

-- CreateEnum
CREATE TYPE "DiagnosticSource" AS ENUM ('OBD2', 'MANUAL', 'WORKSHOP');

-- CreateEnum
CREATE TYPE "DiagnosticScanStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "DiagnosticTroubleCodeStatus" AS ENUM ('ACTIVE', 'PENDING', 'CLEARED');

-- CreateEnum
CREATE TYPE "DiagnosticTroubleCodeSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('IMAGE', 'VIDEO', 'PDF', 'INVOICE', 'OBD_REPORT');

-- CreateEnum
CREATE TYPE "RecordSource" AS ENUM ('OBD2_DEVICE', 'WORKSHOP_RECORDED', 'EVIDENCE_BACKED', 'OWNER_DECLARED', 'SIMULATED');

-- CreateEnum
CREATE TYPE "IdentityVerificationStatus" AS ENUM ('UNKNOWN', 'DECLARED', 'ORGANIZATION_IDENTIFIED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "EvidenceVerificationStatus" AS ENUM ('NONE', 'AVAILABLE', 'HASH_VERIFIED');

-- CreateEnum
CREATE TYPE "RecordIntegrityStatus" AS ENUM ('DRAFT', 'FINALIZED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "VehicleEventType" AS ENUM ('VEHICLE_REGISTERED', 'OWNERSHIP_RECORDED', 'ACCESS_GRANTED', 'MILEAGE_RECORDED', 'MILEAGE_INCONSISTENCY_DETECTED', 'MAINTENANCE_RECORDED', 'MAINTENANCE_FINALIZED', 'MAINTENANCE_CORRECTED', 'DIAGNOSTIC_RECORDED');

-- CreateEnum
CREATE TYPE "MaintenanceScheduleStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MileageSource" AS ENUM ('MANUAL', 'OBD2', 'WORKSHOP', 'IMPORTED');

-- CreateEnum
CREATE TYPE "VehicleTransferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PassportVisibility" AS ENUM ('PRIVATE', 'SHAREABLE');

-- CreateEnum
CREATE TYPE "PassportStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS_GRANTED', 'ACCESS_REVOKED', 'PASSPORT_SHARED', 'PASSPORT_VIEWED', 'TRANSFER_INITIATED', 'TRANSFER_COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MAINTENANCE_DUE', 'WORK_ORDER_UPDATE', 'DIAGNOSTIC_READY', 'PASSPORT_SHARED', 'VEHICLE_ACCESS_GRANTED', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VEHICLE_OWNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" VARCHAR(64) NOT NULL,
    "userAgent" VARCHAR(512),
    "ipAddress" VARCHAR(64),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "taxId" VARCHAR(64),
    "email" VARCHAR(254),
    "phone" VARCHAR(40),
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "OrganizationMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vin" VARCHAR(17) NOT NULL,
    "plate" VARCHAR(20),
    "make" VARCHAR(80) NOT NULL,
    "model" VARCHAR(80) NOT NULL,
    "year" INTEGER NOT NULL,
    "mileageKm" INTEGER NOT NULL DEFAULT 0,
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "dataSource" "VehicleDataSource" NOT NULL DEFAULT 'MANUAL',
    "registeredOrganizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_ownerships" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT,
    "organizationId" TEXT,
    "ownerKind" "OwnershipKind" NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "releasedAt" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_ownerships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_access_grants" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "targetKey" VARCHAR(220) NOT NULL,
    "granteeUserId" TEXT,
    "organizationId" TEXT,
    "workshopId" TEXT,
    "grantedById" TEXT NOT NULL,
    "permission" "VehicleAccessPermission" NOT NULL,
    "status" "VehicleAccessGrantStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "phone" VARCHAR(40),
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "serialNumber" VARCHAR(128) NOT NULL,
    "type" "DeviceType" NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "vehicleId" TEXT NOT NULL,
    "organizationId" TEXT,
    "registeredByUserId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_scans" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "deviceId" TEXT,
    "organizationId" TEXT,
    "performedByUserId" TEXT NOT NULL,
    "source" "DiagnosticSource" NOT NULL,
    "recordSource" "RecordSource" NOT NULL DEFAULT 'OBD2_DEVICE',
    "identityStatus" "IdentityVerificationStatus" NOT NULL DEFAULT 'UNKNOWN',
    "evidenceStatus" "EvidenceVerificationStatus" NOT NULL DEFAULT 'NONE',
    "integrityStatus" "RecordIntegrityStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "contentHash" VARCHAR(64),
    "finalizedHash" VARCHAR(64),
    "finalizedAt" TIMESTAMP(3),
    "status" "DiagnosticScanStatus" NOT NULL DEFAULT 'PENDING',
    "mileageKm" INTEGER,
    "rawPayload" JSONB,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_trouble_codes" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "status" "DiagnosticTroubleCodeStatus" NOT NULL DEFAULT 'ACTIVE',
    "severity" "DiagnosticTroubleCodeSeverity" NOT NULL DEFAULT 'INFO',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_trouble_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(48) NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "assignedMechanicId" TEXT,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "workOrderId" TEXT,
    "workshopId" TEXT,
    "organizationId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "recordSource" "RecordSource" NOT NULL DEFAULT 'OWNER_DECLARED',
    "identityStatus" "IdentityVerificationStatus" NOT NULL DEFAULT 'DECLARED',
    "evidenceStatus" "EvidenceVerificationStatus" NOT NULL DEFAULT 'NONE',
    "integrityStatus" "RecordIntegrityStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "supersedesId" TEXT,
    "correctionReason" TEXT,
    "contentHash" VARCHAR(64),
    "finalizedHash" VARCHAR(64),
    "finalizedAt" TIMESTAMP(3),
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "performedAt" TIMESTAMP(3),
    "mileageKm" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_procedures" (
    "id" TEXT NOT NULL,
    "maintenanceRecordId" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT,
    "laborMinutes" INTEGER,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_procedures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_parts" (
    "id" TEXT NOT NULL,
    "maintenanceRecordId" TEXT NOT NULL,
    "partNumber" VARCHAR(120),
    "name" VARCHAR(160) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitCostCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_evidence" (
    "id" TEXT NOT NULL,
    "maintenanceRecordId" TEXT,
    "workOrderId" TEXT,
    "diagnosticScanId" TEXT,
    "vehicleEventId" TEXT,
    "uploadedByUserId" TEXT NOT NULL,
    "type" "EvidenceType" NOT NULL,
    "storageKey" VARCHAR(255) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(127) NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_schedules" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "intervalKm" INTEGER,
    "intervalDays" INTEGER,
    "nextDueMileageKm" INTEGER,
    "nextDueAt" TIMESTAMP(3),
    "status" "MaintenanceScheduleStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_mileage_logs" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "organizationId" TEXT,
    "mileageKm" INTEGER NOT NULL,
    "recordSource" "RecordSource" NOT NULL DEFAULT 'OWNER_DECLARED',
    "identityStatus" "IdentityVerificationStatus" NOT NULL DEFAULT 'DECLARED',
    "evidenceStatus" "EvidenceVerificationStatus" NOT NULL DEFAULT 'NONE',
    "inconsistencyDetected" BOOLEAN NOT NULL DEFAULT false,
    "inconsistencyReason" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_mileage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_events" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" "VehicleEventType" NOT NULL,
    "source" "RecordSource" NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "organizationId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" VARCHAR(240) NOT NULL,
    "identityStatus" "IdentityVerificationStatus" NOT NULL DEFAULT 'DECLARED',
    "evidenceStatus" "EvidenceVerificationStatus" NOT NULL DEFAULT 'NONE',
    "integrityStatus" "RecordIntegrityStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "supersedesId" TEXT,
    "correctionReason" TEXT,
    "contentHash" VARCHAR(64),
    "finalizedHash" VARCHAR(64),
    "finalizedAt" TIMESTAMP(3),
    "maintenanceRecordId" TEXT,
    "diagnosticScanId" TEXT,
    "mileageLogId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_transfers" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "initiatedByUserId" TEXT NOT NULL,
    "fromUserId" TEXT,
    "toUserId" TEXT,
    "recipientEmail" VARCHAR(254),
    "status" "VehicleTransferStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_passports" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "publicToken" VARCHAR(64) NOT NULL,
    "visibility" "PassportVisibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "PassportStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "snapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_passports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "organizationId" TEXT,
    "vehicleId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" VARCHAR(80) NOT NULL,
    "entityId" VARCHAR(64) NOT NULL,
    "requestId" VARCHAR(64),
    "ipAddress" VARCHAR(64),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "vehicleId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "auth_sessions_userId_revokedAt_expiresAt_idx" ON "auth_sessions"("userId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_taxId_key" ON "organizations"("taxId");

-- CreateIndex
CREATE INDEX "organizations_type_isActive_idx" ON "organizations"("type", "isActive");

-- CreateIndex
CREATE INDEX "organization_members_userId_status_idx" ON "organization_members"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organizationId_userId_key" ON "organization_members"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- CreateIndex
CREATE INDEX "vehicles_plate_idx" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_registeredOrganizationId_status_idx" ON "vehicles"("registeredOrganizationId", "status");

-- CreateIndex
CREATE INDEX "vehicle_ownerships_vehicleId_isCurrent_idx" ON "vehicle_ownerships"("vehicleId", "isCurrent");

-- CreateIndex
CREATE INDEX "vehicle_ownerships_userId_isCurrent_idx" ON "vehicle_ownerships"("userId", "isCurrent");

-- CreateIndex
CREATE INDEX "vehicle_ownerships_organizationId_isCurrent_idx" ON "vehicle_ownerships"("organizationId", "isCurrent");

-- CreateIndex
CREATE INDEX "vehicle_access_grants_granteeUserId_status_expiresAt_idx" ON "vehicle_access_grants"("granteeUserId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "vehicle_access_grants_organizationId_status_expiresAt_idx" ON "vehicle_access_grants"("organizationId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "vehicle_access_grants_workshopId_status_expiresAt_idx" ON "vehicle_access_grants"("workshopId", "status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_access_grants_vehicleId_targetKey_key" ON "vehicle_access_grants"("vehicleId", "targetKey");

-- CreateIndex
CREATE UNIQUE INDEX "workshops_organizationId_key" ON "workshops"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serialNumber_key" ON "devices"("serialNumber");

-- CreateIndex
CREATE INDEX "devices_vehicleId_status_idx" ON "devices"("vehicleId", "status");

-- CreateIndex
CREATE INDEX "devices_organizationId_status_idx" ON "devices"("organizationId", "status");

-- CreateIndex
CREATE INDEX "diagnostic_scans_vehicleId_scannedAt_idx" ON "diagnostic_scans"("vehicleId", "scannedAt");

-- CreateIndex
CREATE INDEX "diagnostic_scans_organizationId_scannedAt_idx" ON "diagnostic_scans"("organizationId", "scannedAt");

-- CreateIndex
CREATE INDEX "diagnostic_trouble_codes_code_status_idx" ON "diagnostic_trouble_codes"("code", "status");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_trouble_codes_scanId_code_key" ON "diagnostic_trouble_codes"("scanId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_reference_key" ON "work_orders"("reference");

-- CreateIndex
CREATE INDEX "work_orders_vehicleId_status_idx" ON "work_orders"("vehicleId", "status");

-- CreateIndex
CREATE INDEX "work_orders_workshopId_status_idx" ON "work_orders"("workshopId", "status");

-- CreateIndex
CREATE INDEX "work_orders_organizationId_status_idx" ON "work_orders"("organizationId", "status");

-- CreateIndex
CREATE INDEX "maintenance_records_vehicleId_performedAt_idx" ON "maintenance_records"("vehicleId", "performedAt");

-- CreateIndex
CREATE INDEX "maintenance_records_workOrderId_idx" ON "maintenance_records"("workOrderId");

-- CreateIndex
CREATE INDEX "maintenance_records_organizationId_status_idx" ON "maintenance_records"("organizationId", "status");

-- CreateIndex
CREATE INDEX "maintenance_records_supersedesId_idx" ON "maintenance_records"("supersedesId");

-- CreateIndex
CREATE INDEX "service_procedures_maintenanceRecordId_idx" ON "service_procedures"("maintenanceRecordId");

-- CreateIndex
CREATE INDEX "service_parts_maintenanceRecordId_idx" ON "service_parts"("maintenanceRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "service_evidence_storageKey_key" ON "service_evidence"("storageKey");

-- CreateIndex
CREATE INDEX "service_evidence_maintenanceRecordId_idx" ON "service_evidence"("maintenanceRecordId");

-- CreateIndex
CREATE INDEX "service_evidence_workOrderId_idx" ON "service_evidence"("workOrderId");

-- CreateIndex
CREATE INDEX "service_evidence_diagnosticScanId_idx" ON "service_evidence"("diagnosticScanId");

-- CreateIndex
CREATE INDEX "service_evidence_vehicleEventId_idx" ON "service_evidence"("vehicleEventId");

-- CreateIndex
CREATE INDEX "maintenance_schedules_vehicleId_status_nextDueAt_idx" ON "maintenance_schedules"("vehicleId", "status", "nextDueAt");

-- CreateIndex
CREATE INDEX "vehicle_mileage_logs_vehicleId_recordedAt_idx" ON "vehicle_mileage_logs"("vehicleId", "recordedAt");

-- CreateIndex
CREATE INDEX "vehicle_mileage_logs_organizationId_recordedAt_idx" ON "vehicle_mileage_logs"("organizationId", "recordedAt");

-- CreateIndex
CREATE INDEX "vehicle_events_vehicleId_occurredAt_idx" ON "vehicle_events"("vehicleId", "occurredAt");

-- CreateIndex
CREATE INDEX "vehicle_events_organizationId_occurredAt_idx" ON "vehicle_events"("organizationId", "occurredAt");

-- CreateIndex
CREATE INDEX "vehicle_events_supersedesId_idx" ON "vehicle_events"("supersedesId");

-- CreateIndex
CREATE INDEX "vehicle_transfers_vehicleId_status_idx" ON "vehicle_transfers"("vehicleId", "status");

-- CreateIndex
CREATE INDEX "vehicle_transfers_recipientEmail_status_idx" ON "vehicle_transfers"("recipientEmail", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_passports_publicToken_key" ON "vehicle_passports"("publicToken");

-- CreateIndex
CREATE INDEX "vehicle_passports_vehicleId_status_visibility_idx" ON "vehicle_passports"("vehicleId", "status", "visibility");

-- CreateIndex
CREATE INDEX "audit_logs_organizationId_createdAt_idx" ON "audit_logs"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_vehicleId_createdAt_idx" ON "audit_logs"("vehicleId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_organizationId_createdAt_idx" ON "notifications"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_registeredOrganizationId_fkey" FOREIGN KEY ("registeredOrganizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_ownerships" ADD CONSTRAINT "vehicle_ownerships_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_ownerships" ADD CONSTRAINT "vehicle_ownerships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_ownerships" ADD CONSTRAINT "vehicle_ownerships_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_access_grants" ADD CONSTRAINT "vehicle_access_grants_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_access_grants" ADD CONSTRAINT "vehicle_access_grants_granteeUserId_fkey" FOREIGN KEY ("granteeUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_access_grants" ADD CONSTRAINT "vehicle_access_grants_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_access_grants" ADD CONSTRAINT "vehicle_access_grants_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_access_grants" ADD CONSTRAINT "vehicle_access_grants_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_registeredByUserId_fkey" FOREIGN KEY ("registeredByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_scans" ADD CONSTRAINT "diagnostic_scans_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_scans" ADD CONSTRAINT "diagnostic_scans_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_scans" ADD CONSTRAINT "diagnostic_scans_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_scans" ADD CONSTRAINT "diagnostic_scans_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_trouble_codes" ADD CONSTRAINT "diagnostic_trouble_codes_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "diagnostic_scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assignedMechanicId_fkey" FOREIGN KEY ("assignedMechanicId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "maintenance_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_procedures" ADD CONSTRAINT "service_procedures_maintenanceRecordId_fkey" FOREIGN KEY ("maintenanceRecordId") REFERENCES "maintenance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_parts" ADD CONSTRAINT "service_parts_maintenanceRecordId_fkey" FOREIGN KEY ("maintenanceRecordId") REFERENCES "maintenance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_evidence" ADD CONSTRAINT "service_evidence_maintenanceRecordId_fkey" FOREIGN KEY ("maintenanceRecordId") REFERENCES "maintenance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_evidence" ADD CONSTRAINT "service_evidence_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_evidence" ADD CONSTRAINT "service_evidence_diagnosticScanId_fkey" FOREIGN KEY ("diagnosticScanId") REFERENCES "diagnostic_scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_evidence" ADD CONSTRAINT "service_evidence_vehicleEventId_fkey" FOREIGN KEY ("vehicleEventId") REFERENCES "vehicle_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_evidence" ADD CONSTRAINT "service_evidence_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_schedules" ADD CONSTRAINT "maintenance_schedules_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_mileage_logs" ADD CONSTRAINT "vehicle_mileage_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_mileage_logs" ADD CONSTRAINT "vehicle_mileage_logs_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_mileage_logs" ADD CONSTRAINT "vehicle_mileage_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_maintenanceRecordId_fkey" FOREIGN KEY ("maintenanceRecordId") REFERENCES "maintenance_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_diagnosticScanId_fkey" FOREIGN KEY ("diagnosticScanId") REFERENCES "diagnostic_scans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_mileageLogId_fkey" FOREIGN KEY ("mileageLogId") REFERENCES "vehicle_mileage_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_events" ADD CONSTRAINT "vehicle_events_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "vehicle_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_transfers" ADD CONSTRAINT "vehicle_transfers_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_transfers" ADD CONSTRAINT "vehicle_transfers_initiatedByUserId_fkey" FOREIGN KEY ("initiatedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_transfers" ADD CONSTRAINT "vehicle_transfers_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_transfers" ADD CONSTRAINT "vehicle_transfers_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_passports" ADD CONSTRAINT "vehicle_passports_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_passports" ADD CONSTRAINT "vehicle_passports_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
