import type { AuditAction, PrismaClient } from "@prisma/client";

import { prisma } from "../../lib/prisma";

export type AuditInput = {
  actorUserId?: string;
  organizationId?: string;
  vehicleId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  requestId?: string;
  ipAddress?: string;
  metadata?: object;
};

type AuditWriter = Pick<PrismaClient, "auditLog">;

export const writeAudit = (input: AuditInput, client: AuditWriter = prisma): Promise<unknown> =>
  client.auditLog.create({ data: input });
