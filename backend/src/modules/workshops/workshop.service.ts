import type { UserRole } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { writeAudit } from "../../shared/services/audit.service";

type Actor = { id: string; role: UserRole };
type CreateWorkshopInput = { organizationId: string; name: string; phone?: string; address?: string };

const requireWorkshopAdmin = async (organizationId: string, actor: Actor) => {
  if (actor.role === "SUPER_ADMIN") return;
  const member = await prisma.organizationMember.findFirst({
    where: {
      organizationId,
      userId: actor.id,
      status: "ACTIVE",
      role: "WORKSHOP_ADMIN"
    },
    select: { id: true }
  });
  if (!member) {
    throw new AppError(403, "FORBIDDEN", "A workshop administrator membership is required.");
  }
};

export const workshopService = {
  async create(actor: Actor, input: CreateWorkshopInput, requestId?: string) {
    const organization = await prisma.organization.findFirst({
      where: { id: input.organizationId, type: "WORKSHOP", isActive: true },
      select: { id: true }
    });
    if (!organization) {
      throw new AppError(404, "ORGANIZATION_NOT_FOUND", "The requested workshop organization does not exist.");
    }
    await requireWorkshopAdmin(input.organizationId, actor);

    const workshop = await prisma.workshop.create({ data: input });
    await writeAudit({
      actorUserId: actor.id,
      organizationId: input.organizationId,
      action: "CREATE",
      entityType: "Workshop",
      entityId: workshop.id,
      requestId
    });
    return workshop;
  },

  async authorizedVehicles(workshopId: string, actor: Actor) {
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
      select: { id: true, organizationId: true, isActive: true }
    });
    if (!workshop || !workshop.isActive) {
      throw new AppError(404, "WORKSHOP_NOT_FOUND", "The requested workshop does not exist.");
    }

    if (actor.role !== "SUPER_ADMIN") {
      const membership = await prisma.organizationMember.findFirst({
        where: { organizationId: workshop.organizationId, userId: actor.id, status: "ACTIVE" },
        select: { id: true }
      });
      if (!membership) {
        throw new AppError(404, "WORKSHOP_NOT_FOUND", "The requested workshop does not exist.");
      }
    }

    const grants = await prisma.vehicleAccessGrant.findMany({
      where: {
        workshopId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      },
      include: { vehicle: true },
      orderBy: { updatedAt: "desc" }
    });

    return grants.map((grant) => ({ permission: grant.permission, expiresAt: grant.expiresAt, vehicle: grant.vehicle }));
  }
};
