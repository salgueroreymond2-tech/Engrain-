import type { VehicleDataSource } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";

type CreateVehicleInput = {
  vin: string;
  plate?: string;
  make: string;
  model: string;
  year: number;
  mileageKm: number;
  dataSource: VehicleDataSource;
};

type UpdateVehicleInput = Partial<Omit<CreateVehicleInput, "vin">>;

const ensureOwnedVehicle = async (id: string, ownerId: string) => {
  const vehicle = await prisma.vehicle.findFirst({ where: { id, ownerId } });
  if (!vehicle) {
    throw new AppError(404, "VEHICLE_NOT_FOUND", "The requested vehicle does not exist.");
  }
  return vehicle;
};

export const vehicleService = {
  list(ownerId: string) {
    return prisma.vehicle.findMany({
      where: { ownerId, status: { not: "ARCHIVED" } },
      orderBy: { updatedAt: "desc" }
    });
  },

  async getById(id: string, ownerId: string) {
    return ensureOwnedVehicle(id, ownerId);
  },

  create(ownerId: string, input: CreateVehicleInput) {
    return prisma.vehicle.create({ data: { ...input, ownerId } });
  },

  async update(id: string, ownerId: string, input: UpdateVehicleInput) {
    await ensureOwnedVehicle(id, ownerId);
    return prisma.vehicle.update({ where: { id }, data: input });
  },

  async archive(id: string, ownerId: string) {
    await ensureOwnedVehicle(id, ownerId);
    return prisma.vehicle.update({ where: { id }, data: { status: "ARCHIVED" } });
  }
};
