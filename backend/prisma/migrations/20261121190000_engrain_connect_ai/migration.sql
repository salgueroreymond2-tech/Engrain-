-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'AI_ANALYSIS_REQUESTED';

-- AlterTable
ALTER TABLE "diagnostic_scans" ADD COLUMN "isSimulated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "physicalConnectionVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "providerKey" VARCHAR(80) NOT NULL DEFAULT 'unknown',
ADD COLUMN "providerMetadata" JSONB;

-- CreateTable
CREATE TABLE "diagnostic_measurements" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "metric" VARCHAR(80) NOT NULL,
    "label" VARCHAR(120),
    "rawValue" TEXT,
    "normalizedValue" DECIMAL(14,4),
    "unit" VARCHAR(32),
    "recordSource" "RecordSource" NOT NULL DEFAULT 'OBD2_DEVICE',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "diagnostic_measurements_scanId_metric_capturedAt_idx" ON "diagnostic_measurements"("scanId", "metric", "capturedAt");

-- CreateIndex
CREATE INDEX "diagnostic_measurements_metric_capturedAt_idx" ON "diagnostic_measurements"("metric", "capturedAt");

-- AddForeignKey
ALTER TABLE "diagnostic_measurements" ADD CONSTRAINT "diagnostic_measurements_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "diagnostic_scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
