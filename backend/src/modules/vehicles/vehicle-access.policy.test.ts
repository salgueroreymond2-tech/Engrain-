import { describe, expect, it } from "vitest";

import { mayManageVehicle, resolveVehicleAccess } from "./vehicle-access.policy";

describe("vehicle access policy", () => {
  const workshop = { id: "workshop-a", organizationId: "organization-a" };

  it("grants a workshop member service access only when a vehicle grant names that workshop", () => {
    const access = resolveVehicleAccess({
      actorId: "mechanic-a",
      actorRole: "MECHANIC",
      currentOwnerUserIds: ["owner-a"],
      currentOwnerOrganizationIds: [],
      memberships: [{ organizationId: "organization-a", status: "ACTIVE" }],
      workshops: [workshop],
      grants: [{ granteeUserId: null, organizationId: null, workshopId: "workshop-a", permission: "SERVICE", status: "ACTIVE", expiresAt: null }]
    });

    expect(access).toBe("SERVICE");
    expect(mayManageVehicle(access)).toBe(false);
  });

  it("isolates a vehicle from an unrelated workshop even if that user has a valid membership elsewhere", () => {
    const access = resolveVehicleAccess({
      actorId: "mechanic-b",
      actorRole: "MECHANIC",
      currentOwnerUserIds: ["owner-a"],
      currentOwnerOrganizationIds: [],
      memberships: [{ organizationId: "organization-b", status: "ACTIVE" }],
      workshops: [workshop],
      grants: [{ granteeUserId: null, organizationId: null, workshopId: "workshop-a", permission: "SERVICE", status: "ACTIVE", expiresAt: null }]
    });

    expect(access).toBeNull();
  });

  it("keeps the technical vehicle relationship available to the current owner after ownership resolution", () => {
    const access = resolveVehicleAccess({
      actorId: "owner-a",
      actorRole: "VEHICLE_OWNER",
      currentOwnerUserIds: ["owner-a"],
      currentOwnerOrganizationIds: [],
      memberships: [],
      workshops: [],
      grants: []
    });

    expect(access).toBe("OWNER");
    expect(mayManageVehicle(access)).toBe(true);
  });
});
