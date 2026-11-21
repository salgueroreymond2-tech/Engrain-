import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { AuthenticatedUser } from "../../shared/types/auth";

// Helper to get auth info
function getAuth(req: Request): AuthenticatedUser {
  return req.res?.locals?.auth;
}

export const listWorkOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { vehicleId, workshopId, status } = req.query as any;

    const where: any = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (workshopId) where.workshopId = workshopId;
    if (status) where.status = status;

    // Authorization filter
    if (auth.role === "OWNER") {
      // Owner can only see orders for their vehicles
      const vehicles = await prisma.vehicle.findMany({ where: { ownerId: auth.id }, select: { id: true } });
      const vehicleIds = vehicles.map(v => v.id);
      where.vehicleId = { in: vehicleIds };
    } else if (auth.role === "TECHNICIAN" || auth.role === "WORKSHOP_ADMIN") {
      // Member of workshop: need to be part of workshop
      const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id } });
      if (!member) throw new AppError(403, "FORBIDDEN", "Not a workshop member");
      where.workshopId = member.workshopId;
    }

    const workOrders = await prisma.workOrder.findMany({ where });
    res.json({ success: true, data: workOrders });
  } catch (e) {
    next(e);
  }
};

export const createWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { vehicleId, workshopId, title, description, status } = req.body as any;

    // Verify vehicle belongs to owner (if owner) or exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new AppError(404, "NOT_FOUND", "Vehicle not found");
    if (auth.role === "OWNER" && vehicle.ownerId !== auth.id) {
      throw new AppError(403, "FORBIDDEN", "Vehicle not owned");
    }

    // Verify workshop membership for tech/admin
    if (auth.role !== "OWNER") {
      const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id, workshopId } });
      if (!member) throw new AppError(403, "FORBIDDEN", "Not member of workshop");
    }

    const workOrder = await prisma.workOrder.create({
      data: {
        vehicleId,
        workshopId,
        createdById: auth.id,
        title,
        description,
        status: status ?? "DRAFT",
      },
    });
    res.status(201).json({ success: true, data: workOrder });
  } catch (e) {
    next(e);
  }
};

export const getWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { id } = req.params as any;
    const workOrder = await prisma.workOrder.findUnique({ where: { id } });
    if (!workOrder) throw new AppError(404, "NOT_FOUND", "Work order not found");

    // Authorization check
    if (auth.role === "OWNER") {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: workOrder.vehicleId } });
      if (!vehicle || vehicle.ownerId !== auth.id) {
        throw new AppError(403, "FORBIDDEN", "Access denied");
      }
    } else {
      const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id, workshopId: workOrder.workshopId } });
      if (!member) throw new AppError(403, "FORBIDDEN", "Access denied");
    }
    res.json({ success: true, data: workOrder });
  } catch (e) {
    next(e);
  }
};

export const updateWorkOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { id } = req.params as any;
    const updates = req.body as any;

    const workOrder = await prisma.workOrder.findUnique({ where: { id } });
    if (!workOrder) throw new AppError(404, "NOT_FOUND", "Work order not found");

    // Only technician or admin of the workshop can update
    if (auth.role !== "TECHNICIAN" && auth.role !== "WORKSHOP_ADMIN") {
      throw new AppError(403, "FORBIDDEN", "Insufficient role");
    }
    const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id, workshopId: workOrder.workshopId } });
    if (!member) throw new AppError(403, "FORBIDDEN", "Not a member of workshop");

    const updated = await prisma.workOrder.update({ where: { id }, data: updates });
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};
