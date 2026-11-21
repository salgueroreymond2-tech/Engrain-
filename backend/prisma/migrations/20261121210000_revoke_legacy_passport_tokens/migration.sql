-- Legacy CUID passport links predate the 256-bit token policy.
-- Revoke rather than silently preserve them; owners can issue a new random, expiring link.
UPDATE "vehicle_passports"
SET "status" = 'REVOKED',
    "revokedAt" = CURRENT_TIMESTAMP
WHERE "status" = 'ACTIVE'
  AND LENGTH("publicToken") < 32;
