import type { UserRole, VehicleAccessPermission } from "@prisma/client";

export type AccessGrantView = {
  granteeUserId: string | null;
  organizationId: string | null;
  workshopId: string | null;
  permission: VehicleAccessPermission;
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  expiresAt: Date | null;
};

export type OrganizationMembershipView = {
  organizationId: string;
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
};

export type WorkshopView = { id: string; organizationId: string };

export type VehicleAccessInput = {
  actorId: string;
  actorRole: UserRole;
  currentOwnerUserIds: string[];
  currentOwnerOrganizationIds: string[];
  memberships: OrganizationMembershipView[];
  grants: AccessGrantView[];
  workshops: WorkshopView[];
  now?: Date;
};

export type ResolvedVehicleAccess = "OWNER" | VehicleAccessPermission | null;

const permissionRank: Record<"OWNER" | VehicleAccessPermission, number> = {
  VIEW: 1,
  SERVICE: 2,
  MANAGE: 3,
  OWNER: 4
};

const strongest = (current: ResolvedVehicleAccess, candidate: ResolvedVehicleAccess): ResolvedVehicleAccess => {
  if (!candidate) return current;
  if (!current || permissionRank[candidate] > permissionRank[current]) return candidate;
  return current;
};

/** Resolves ownership and grants without exposing a vehicle when no relationship exists. */
export const resolveVehicleAccess = (input: VehicleAccessInput): ResolvedVehicleAccess => {
  if (input.actorRole === "SUPER_ADMIN") return "MANAGE";

  const activeOrganizationIds = new Set(
    input.memberships.filter((membership) => membership.status === "ACTIVE").map((membership) => membership.organizationId)
  );

  if (input.currentOwnerUserIds.includes(input.actorId)) return "OWNER";
  if (input.currentOwnerOrganizationIds.some((organizationId) => activeOrganizationIds.has(organizationId))) {
    return "OWNER";
  }

  const workshopOrganizationById = new Map(input.workshops.map((workshop) => [workshop.id, workshop.organizationId]));
  const now = input.now ?? new Date();

  return input.grants.reduce<ResolvedVehicleAccess>((resolved, grant) => {
    if (grant.status !== "ACTIVE" || (grant.expiresAt && grant.expiresAt <= now)) return resolved;

    const matchesUser = grant.granteeUserId === input.actorId;
    const matchesOrganization = grant.organizationId !== null && activeOrganizationIds.has(grant.organizationId);
    const workshopOrganization = grant.workshopId ? workshopOrganizationById.get(grant.workshopId) : undefined;
    const matchesWorkshop = workshopOrganization !== undefined && activeOrganizationIds.has(workshopOrganization);

    return matchesUser || matchesOrganization || matchesWorkshop ? strongest(resolved, grant.permission) : resolved;
  }, null);
};

export const mayManageVehicle = (access: ResolvedVehicleAccess): boolean => access === "OWNER" || access === "MANAGE";

export const mayServiceVehicle = (access: ResolvedVehicleAccess): boolean =>
  access === "OWNER" || access === "MANAGE" || access === "SERVICE";
