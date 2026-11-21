import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { AuthenticatedUser } from "../../shared/types/auth";

function getAuth(req: Request): AuthenticatedUser {
  return req.res?.locals?.auth;
}

export const listMaintenances = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { vehicleId, status } = req.query as any;
    const where: any = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;

    if (auth.role === "OWNER") {
      const vehicles = await prisma.vehicle.findMany({ where: { ownerId: auth.id }, select: { id: true } });
      const vid = vehicles.map(v => v.id);
      where.vehicleId = { in: vid };
    } else if (auth.role === "TECHNICIAN" || auth.role === "WORKSHOP_ADMIN") {
      const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id } });
      if (!member) throw new AppError(403, "FORBIDDEN", "Not a workshop member");
      // No direct filter on workshop, maintenances are not tied to workshop directly, but ensure vehicle belongs to workshop via service?
    }

    const maints = await prisma.maintenance.findMany({ where });
    res.json({ success: true, data: maints });
  } catch (e) {
    next(e);
  }
};

export const createMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { vehicleId, title, description, dueDate, mileageKm, status } = req.body as any;
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new AppError(404, "NOT_FOUND", "Vehicle not found");
    if (auth.role === "OWNER" && vehicle.ownerId !== auth.id) {
      throw new AppError(403, "FORBIDDEN", "Vehicle not owned");
    }
    // For tech/admin, ensure membership in workshop that can access vehicle (simplified)
    if (auth.role !== "OWNER") {
      const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id } });
      if (!member) throw new AppError(403, "FORBIDDEN", "Not a workshop member");
    }
    const maintenance = await prisma.maintenance.create({
      data: {
        vehicleId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        mileageKm,
        status: status ?? "SCHEDULED",
        createdById: auth.id,
      },
    });
    res.status(201).json({ success: true, data: maintenance });
  } catch (e) {
    next(e);
  }
};

export const getMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { id } = req.params as any;
    const maintenance = await prisma.maintenance.findUnique({ where: { id } });
    if (!maintenance) throw new AppError(404, "NOT_FOUND", "Maintenance not found");
    const vehicle = await prisma.vehicle.findUnique({ where: { id: maintenance.vehicleId } });
    if (!vehicle) throw new AppError(404, "NOT_FOUND", "Vehicle not found");
    if (auth.role === "OWNER" && vehicle.ownerId !== auth.id) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }
    if (auth.role !== "OWNER") {
      const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id } });
      if (!member) throw new AppError(403, "FORBIDDEN", "Access denied");
    }
    res.json({ success: true, data: maintenance });
  } catch (e) {
    next(e);
  }
};

export const updateMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { id } = req.params as any;
    const updates = req.body as any;
    const maintenance = await prisma.maintenance.findUnique({ where: { id } });
    if (!maintenance) throw new AppError(404, "NOT_FOUND", "Maintenance not found");
    const vehicle = await prisma.vehicle.findUnique({ where: { id: maintenance.vehicleId } });
    if (!vehicle) throw new AppError(404, "NOT_FOUND", "Vehicle not found");
    if (auth.role === "OWNER" && vehicle.ownerId !== auth.id) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }
    if (auth.role !== "OWNER") {
      const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id } });
      if (!member) throw new AppError(403, "FORBIDDEN", "Access denied");
    }
    const updated = await prisma.maintenance.update({ where: { id }, data: updates });
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

export const deleteMaintenance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { id } = req.params as any;
    const maintenance = await prisma.maintenance.findUnique({ where: { id } });
    if (!maintenance) throw new AppError(404, "NOT_FOUND", "Maintenance not found");
    const vehicle = await prisma.vehicle.findUnique({ where: { id: maintenance.vehicleId } });
    if (!vehicle) throw new AppError(404, "NOT_FOUND", "Vehicle not found");
    if (auth.role === "OWNER" && vehicle.ownerId !== auth.id) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }
    if (auth.role !== "OWNER") {
      const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id } });
      if (!member) throw new AppError(403, "FORBIDDEN", "Access denied");
    }
    await prisma.maintenance.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};
