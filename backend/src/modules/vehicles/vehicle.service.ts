import type { UserRole, VehicleAccessPermission, VehicleDataSource } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { hashRecord } from "../../shared/security/integrity";
import { writeAudit } from "../../shared/services/audit.service";
import {
  mayManageVehicle,
  resolveVehicleAccess,
  type ResolvedVehicleAccess
} from "./vehicle-access.policy";

type Actor = { id: string; role: UserRole };

type CreateVehicleInput = {
  vin: string;
  plate?: string;
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  dataSource: VehicleDataSource;
  registeredOrganizationId?: string;
};

type UpdateVehicleInput = Partial<Omit<CreateVehicleInput, "vin" | "registeredOrganizationId">>;
type GrantInput = {
  granteeUserId?: string;
  organizationId?: string;
  workshopId?: string;
  permission: VehicleAccessPermission;
  expiresAt?: Date;
};

const sourceForVehicleData = (source: VehicleDataSource) => {
  if (source === "OBD2") return "OBD2_DEVICE" as const;
  if (source === "WORKSHOP" || source === "DEALERSHIP") return "WORKSHOP_RECORDED" as const;
  return "OWNER_DECLARED" as const;
};

const targetFromGrantInput = (input: GrantInput): { targetKey: string; data: GrantInput } => {
  const targets = [
    input.granteeUserId ? `user:${input.granteeUserId}` : undefined,
    input.organizationId ? `organization:${input.organizationId}` : undefined,
    input.workshopId ? `workshop:${input.workshopId}` : undefined
  ].filter((target): target is string => Boolean(target));

  if (targets.length !== 1) {
    throw new AppError(422, "VALIDATION_ERROR", "Exactly one vehicle access target is required.");
  }
  return { targetKey: targets[0], data: input };
};

const authorizedVehicle = async (id: string, actor: Actor) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      ownerships: { where: { isCurrent: true }, select: { userId: true, organizationId: true } },
      accessGrants: {
        select: {
          granteeUserId: true,
          organizationId: true,
          workshopId: true,
          permission: true,
          status: true,
          expiresAt: true,
          workshop: { select: { id: true, organizationId: true } }
        }
      }
    }
  });
  if (!vehicle) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "The requested vehicle does not exist.");
  }

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: actor.id },
    select: { organizationId: true, status: true }
  });
  const access = resolveVehicleAccess({
    actorId: actor.id,
    actorRole: actor.role,
    currentOwnerUserIds: vehicle.ownerships.flatMap((ownership) => ownership.userId ? [ownership.userId] : []),
    currentOwnerOrganizationIds: vehicle.ownerships.flatMap((ownership) => ownership.organizationId ? [ownership.organizationId] : []),
    memberships,
    grants: vehicle.accessGrants.map((grant) => ({
      ...grant,
      workshopId: grant.workshopId,
      status: grant.status
    })),
    workshops: vehicle.accessGrants.flatMap((grant) => grant.workshop ? [grant.workshop] : [])
  });

  if (!access) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "The requested vehicle does not exist.");
  }

  return { vehicle, access };
};

const serializeVehicle = <T extends { ownerships?: unknown; accessGrants?: unknown }>(vehicle: T) => {
  const { ownerships: _ownerships, accessGrants: _accessGrants, ...publicVehicle } = vehicle;
  return publicVehicle;
};

export const vehicleService = {
  async list(actor: Actor) {
    const [vehicles, memberships] = await Promise.all([
      prisma.vehicle.findMany({
        where: { status: { not: "ARCHIVED" } },
        include: {
          ownerships: { where: { isCurrent: true }, select: { userId: true, organizationId: true } },
          accessGrants: {
            select: {
              granteeUserId: true,
              organizationId: true,
              workshopId: true,
              permission: true,
              status: true,
              expiresAt: true,
              workshop: { select: { id: true, organizationId: true } }
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      }),
      prisma.organizationMember.findMany({ where: { userId: actor.id }, select: { organizationId: true, status: true } })
    ]);

    return vehicles
      .filter((vehicle) => resolveVehicleAccess({
        actorId: actor.id,
        actorRole: actor.role,
        currentOwnerUserIds: vehicle.ownerships.flatMap((ownership) => ownership.userId ? [ownership.userId] : []),
        currentOwnerOrganizationIds: vehicle.ownerships.flatMap((ownership) => ownership.organizationId ? [ownership.organizationId] : []),
        memberships,
        grants: vehicle.accessGrants,
        workshops: vehicle.accessGrants.flatMap((grant) => grant.workshop ? [grant.workshop] : [])
      }))
      .map(serializeVehicle);
  },

  async getById(id: string, actor: Actor) {
    const { vehicle } = await authorizedVehicle(id, actor);
    return serializeVehicle(vehicle);
  },

  async create(actor: Actor, input: CreateVehicleInput, requestId?: string) {
    return prisma.$transaction(async (transaction) => {
      const vehicle = await transaction.vehicle.create({ data: input });
      await transaction.vehicleOwnership.create({
        data: { vehicleId: vehicle.id, userId: actor.id, ownerKind: "USER", isCurrent: true }
      });
      const source = sourceForVehicleData(vehicle.dataSource);
      const contentHash = hashRecord({ vin: vehicle.vin, make: vehicle.make, model: vehicle.model, year: vehicle.year, mileageKm: vehicle.mileageKm, source });
      await transaction.vehicleEvent.create({
        data: {
          vehicleId: vehicle.id,
          type: "VEHICLE_REGISTERED",
          source,
          authorUserId: actor.id,
          organizationId: vehicle.registeredOrganizationId,
          summary: `Vehicle registered with VIN ${vehicle.vin}`,
          identityStatus: "DECLARED",
          integrityStatus: "FINALIZED",
          contentHash,
          finalizedHash: hashRecord({ contentHash, version: 1 }),
          finalizedAt: new Date()
        }
      });
      await writeAudit(
        {
          actorUserId: actor.id,
          vehicleId: vehicle.id,
          action: "CREATE",
          entityType: "Vehicle",
          entityId: vehicle.id,
          requestId,
          metadata: { vin: vehicle.vin, dataSource: vehicle.dataSource }
        },
        transaction
      );
      return vehicle;
    });
  },

  async update(id: string, actor: Actor, input: UpdateVehicleInput, requestId?: string) {
    const { access } = await authorizedVehicle(id, actor);
    if (!mayManageVehicle(access)) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to update this vehicle.");
    }
    const vehicle = await prisma.vehicle.update({ where: { id }, data: input });
    await writeAudit({ actorUserId: actor.id, vehicleId: id, action: "UPDATE", entityType: "Vehicle", entityId: id, requestId });
    return vehicle;
  },

  async archive(id: string, actor: Actor, requestId?: string) {
    const { access } = await authorizedVehicle(id, actor);
    if (!mayManageVehicle(access)) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to archive this vehicle.");
    }
    await prisma.vehicle.update({ where: { id }, data: { status: "ARCHIVED" } });
    await writeAudit({ actorUserId: actor.id, vehicleId: id, action: "UPDATE", entityType: "Vehicle", entityId: id, requestId, metadata: { status: "ARCHIVED" } });
  },

  async grantAccess(id: string, actor: Actor, input: GrantInput, requestId?: string) {
    const { access } = await authorizedVehicle(id, actor);
    if (!mayManageVehicle(access)) {
      throw new AppError(403, "FORBIDDEN", "You do not have permission to grant vehicle access.");
    }
    const { targetKey, data } = targetFromGrantInput(input);
    const grant = await prisma.vehicleAccessGrant.upsert({
      where: { vehicleId_targetKey: { vehicleId: id, targetKey } },
      create: {
        vehicleId: id,
        targetKey,
        ...data,
        grantedById: actor.id,
        status: "ACTIVE"
      },
      update: {
        ...data,
        grantedById: actor.id,
        status: "ACTIVE",
        revokedAt: null
      }
    });
    await writeAudit({
      actorUserId: actor.id,
      vehicleId: id,
      action: "ACCESS_GRANTED",
      entityType: "VehicleAccessGrant",
      entityId: grant.id,
      requestId,
      metadata: { targetKey, permission: grant.permission }
    });
    await prisma.vehicleEvent.create({
      data: {
        vehicleId: id,
        type: "ACCESS_GRANTED",
        source: "OWNER_DECLARED",
        authorUserId: actor.id,
        summary: `Vehicle access granted with ${grant.permission} permission`,
        identityStatus: "DECLARED",
        integrityStatus: "FINALIZED",
        contentHash: hashRecord({ grantId: grant.id, targetKey, permission: grant.permission, expiresAt: grant.expiresAt }),
        finalizedHash: hashRecord({ grantId: grant.id, targetKey, permission: grant.permission, status: grant.status }),
        finalizedAt: new Date(),
        metadata: { targetKey, permission: grant.permission }
      }
    });
    return grant;
  },

  async timeline(id: string, actor: Actor) {
    await authorizedVehicle(id, actor);
    const [maintenanceRecords, diagnosticScans, mileageLogs] = await Promise.all([
      prisma.maintenanceRecord.findMany({
        where: { vehicleId: id },
        include: { procedures: true, parts: true },
        orderBy: { performedAt: "desc" }
      }),
      prisma.diagnosticScan.findMany({
        where: { vehicleId: id },
        include: { troubleCodes: true },
        orderBy: { scannedAt: "desc" }
      }),
      prisma.vehicleMileageLog.findMany({ where: { vehicleId: id }, orderBy: { recordedAt: "desc" } })
    ]);
    return { maintenanceRecords, diagnosticScans, mileageLogs };
  },

  async accessFor(id: string, actor: Actor): Promise<ResolvedVehicleAccess> {
    const { access } = await authorizedVehicle(id, actor);
    return access;
  }
};
