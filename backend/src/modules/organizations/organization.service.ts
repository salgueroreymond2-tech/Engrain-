import type { UserRole } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { writeAudit } from "../../shared/services/audit.service";

type Actor = { id: string; role: UserRole };
type CreateOrganizationInput = {
  name: string;
  type: "WORKSHOP" | "DEALERSHIP";
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export const organizationService = {
  async create(actor: Actor, input: CreateOrganizationInput, requestId?: string) {
    const membershipRole: UserRole = input.type === "WORKSHOP" ? "WORKSHOP_ADMIN" : "DEALERSHIP_ADMIN";

    return prisma.$transaction(async (transaction) => {
      const organization = await transaction.organization.create({ data: input });
      await transaction.organizationMember.create({
        data: { organizationId: organization.id, userId: actor.id, role: membershipRole }
      });
      await writeAudit(
        {
          actorUserId: actor.id,
          organizationId: organization.id,
          action: "CREATE",
          entityType: "Organization",
          entityId: organization.id,
          requestId,
          metadata: { type: organization.type }
        },
        transaction
      );
      return organization;
    });
  },

  listForUser(userId: string) {
    return prisma.organizationMember.findMany({
      where: { userId, status: "ACTIVE" },
      include: { organization: true },
      orderBy: { joinedAt: "desc" }
    });
  }
};
