import type { UserRole } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { hashRecord } from "../../shared/security/integrity";
import { writeAudit } from "../../shared/services/audit.service";
import { vehicleService } from "../vehicles/vehicle.service";

type Actor = { id: string; role: UserRole };
type CreateTransferInput = { recipientEmail: string; expiresAt?: Date };
const DEFAULT_TRANSFER_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
const LEGAL_NOTICE = "La transferencia digital de Engrain registra el cambio de control dentro de la plataforma; no sustituye el traspaso legal, registral, notarial ni contractual del vehículo.";

const requireCurrentOwner = async (vehicleId: string, actor: Actor) => {
  const access = await vehicleService.accessFor(vehicleId, actor);
  if (actor.role !== "SUPER_ADMIN" && access !== "OWNER") {
    throw new AppError(403, "FORBIDDEN", "Only the current vehicle owner may initiate a digital ownership transfer.");
  }
};

export const transferService = {
  async initiate(vehicleId: string, actor: Actor, input: CreateTransferInput, requestId?: string) {
    await requireCurrentOwner(vehicleId, actor);
    const recipientEmail = input.recipientEmail.toLowerCase();
    const recipient = await prisma.user.findUnique({ where: { email: recipientEmail }, select: { id: true } });
    if (recipient?.id === actor.id) throw new AppError(422, "VALIDATION_ERROR", "The recipient must be a different account.");
    const expiresAt = input.expiresAt ?? new Date(Date.now() + DEFAULT_TRANSFER_TTL_MS);

    return prisma.$transaction(async (transaction) => {
      await transaction.vehicleTransfer.updateMany({ where: { vehicleId, status: "PENDING" }, data: { status: "CANCELLED" } });
      const transfer = await transaction.vehicleTransfer.create({
        data: { vehicleId, initiatedByUserId: actor.id, fromUserId: actor.id, toUserId: recipient?.id, recipientEmail, expiresAt }
      });
      await writeAudit({ actorUserId: actor.id, vehicleId, action: "TRANSFER_INITIATED", entityType: "VehicleTransfer", entityId: transfer.id, requestId, metadata: { expiresAt } }, transaction);
      return { transfer, legalNotice: LEGAL_NOTICE };
    });
  },

  async accept(transferId: string, actor: Actor, requestId?: string) {
    const transfer = await prisma.vehicleTransfer.findUnique({ where: { id: transferId } });
    if (!transfer) throw new AppError(404, "TRANSFER_NOT_FOUND", "The requested transfer does not exist.");
    const recipient = await prisma.user.findUnique({ where: { id: actor.id }, select: { email: true, isActive: true } });
    if (!recipient?.isActive || recipient.email.toLowerCase() !== transfer.recipientEmail?.toLowerCase() || (transfer.toUserId && transfer.toUserId !== actor.id)) {
      throw new AppError(404, "TRANSFER_NOT_FOUND", "The requested transfer does not exist.");
    }
    if (transfer.status !== "PENDING") throw new AppError(409, "TRANSFER_NOT_PENDING", "This transfer is no longer pending.");
    if (transfer.expiresAt <= new Date()) {
      await prisma.vehicleTransfer.update({ where: { id: transferId }, data: { status: "EXPIRED" } });
      throw new AppError(409, "TRANSFER_EXPIRED", "This transfer has expired.");
    }

    const acceptedAt = new Date();
    return prisma.$transaction(async (transaction) => {
      await transaction.vehicleOwnership.updateMany({ where: { vehicleId: transfer.vehicleId, isCurrent: true }, data: { isCurrent: false, releasedAt: acceptedAt } });
      await transaction.vehicleOwnership.create({ data: { vehicleId: transfer.vehicleId, userId: actor.id, ownerKind: "USER", acquiredAt: acceptedAt, isCurrent: true } });
      const accepted = await transaction.vehicleTransfer.update({ where: { id: transferId }, data: { status: "ACCEPTED", toUserId: actor.id, acceptedAt } });
      await transaction.vehicleAccessGrant.updateMany({ where: { vehicleId: transfer.vehicleId, status: "ACTIVE" }, data: { status: "REVOKED", revokedAt: acceptedAt } });
      await transaction.vehiclePassport.updateMany({ where: { vehicleId: transfer.vehicleId, status: "ACTIVE" }, data: { status: "REVOKED", revokedAt: acceptedAt, revokedByUserId: actor.id } });
      const contentHash = hashRecord({ transferId, vehicleId: transfer.vehicleId, acceptedAt, newOwnerUserId: actor.id });
      await transaction.vehicleEvent.create({
        data: {
          vehicleId: transfer.vehicleId,
          type: "OWNERSHIP_RECORDED",
          source: "OWNER_DECLARED",
          authorUserId: actor.id,
          occurredAt: acceptedAt,
          summary: "Digital ownership transfer accepted",
          identityStatus: "DECLARED",
          integrityStatus: "FINALIZED",
          contentHash,
          finalizedHash: hashRecord({ contentHash, version: 1 }),
          finalizedAt: acceptedAt,
          metadata: { transferId, legalNotice: LEGAL_NOTICE }
        }
      });
      await writeAudit({ actorUserId: actor.id, vehicleId: transfer.vehicleId, action: "TRANSFER_COMPLETED", entityType: "VehicleTransfer", entityId: transferId, requestId, metadata: { acceptedAt, passportsRevoked: true, accessGrantsRevoked: true } }, transaction);
      return { transfer: accepted, legalNotice: LEGAL_NOTICE };
    });
  }
};
