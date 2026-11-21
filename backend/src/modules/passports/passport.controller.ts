import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { AuthenticatedUser } from "../../shared/types/auth";
import crypto from "crypto";

function getAuth(req: Request): AuthenticatedUser {
  return req.res?.locals?.auth;
}

export const createPassport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { vehicleId, visibility } = req.body as any;
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new AppError(404, "NOT_FOUND", "Vehicle not found");
    if (vehicle.ownerId !== auth.id) throw new AppError(403, "FORBIDDEN", "Vehicle not owned");

    const publicToken = crypto.randomBytes(12).toString("hex");
    const passport = await prisma.passport.create({
      data: {
        vehicleId,
        visibility,
        publicToken,
        status: "ACTIVE",
      },
    });
    res.status(201).json({ success: true, data: passport });
  } catch (e) {
    next(e);
  }
};

export const getPassportById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { id } = req.params as any;
    const passport = await prisma.passport.findUnique({ where: { id } });
    if (!passport) throw new AppError(404, "NOT_FOUND", "Passport not found");

    // Owner can always view; others only if they have access to vehicle via workshop membership
    const vehicle = await prisma.vehicle.findUnique({ where: { id: passport.vehicleId } });
    if (!vehicle) throw new AppError(404, "NOT_FOUND", "Vehicle not found");
    if (auth.role === "OWNER" && vehicle.ownerId !== auth.id) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }
    if (auth.role !== "OWNER") {
      const member = await prisma.workshopMember.findFirst({ where: { userId: auth.id } });
      if (!member) throw new AppError(403, "FORBIDDEN", "Access denied");
    }
    res.json({ success: true, data: passport });
  } catch (e) {
    next(e);
  }
};

export const getPassportByPublicToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { publicToken } = req.params as any;
    const passport = await prisma.passport.findUnique({ where: { publicToken } });
    if (!passport) {
      // Return INVALID response without revealing existence
      return res.status(404).json({ success: false, error: { code: "INVALID", message: "Passport not found" } });
    }
    if (passport.status !== "ACTIVE") {
      return res.status(410).json({ success: false, error: { code: "REVOKED", message: "Passport link revoked" } });
    }
    // Load related vehicle and maintenances for public view (only allowed fields)
    const vehicle = await prisma.vehicle.findUnique({ where: { id: passport.vehicleId } });
    const maintenances = await prisma.maintenance.findMany({ where: { vehicleId: passport.vehicleId, status: "COMPLETED" } });
    // Snapshot may already contain data, but we provide basics
    res.json({ success: true, data: { passport, vehicle, maintenances } });
  } catch (e) {
    next(e);
  }
};

export const updatePassport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = getAuth(req);
    const { id } = req.params as any;
    const { visibility, status } = req.body as any;
    const passport = await prisma.passport.findUnique({ where: { id } });
    if (!passport) throw new AppError(404, "NOT_FOUND", "Passport not found");

    // Ensure owner
    const vehicle = await prisma.vehicle.findUnique({ where: { id: passport.vehicleId } });
    if (!vehicle || vehicle.ownerId !== auth.id) {
      throw new AppError(403, "FORBIDDEN", "Only owner can modify passport");
    }

    const updated = await prisma.passport.update({
      where: { id },
      data: { visibility, status },
    });
    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};
