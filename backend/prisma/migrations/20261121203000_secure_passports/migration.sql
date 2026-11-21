-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'PASSPORT_REVOKED';

-- Existing MVP links receive a bounded lifetime before the column is enforced.
UPDATE "vehicle_passports"
SET "expiresAt" = "createdAt" + INTERVAL '7 days'
WHERE "expiresAt" IS NULL;

-- AlterTable
ALTER TABLE "vehicle_passports" ALTER COLUMN "publicToken" DROP DEFAULT,
ALTER COLUMN "expiresAt" SET NOT NULL,
ADD COLUMN "revokedAt" TIMESTAMP(3),
ADD COLUMN "revokedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "vehicle_passports_expiresAt_status_idx" ON "vehicle_passports"("expiresAt", "status");

-- AddForeignKey
ALTER TABLE "vehicle_passports" ADD CONSTRAINT "vehicle_passports_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
