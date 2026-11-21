import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { createMaintenance, correctMaintenance, finalizeMaintenance, listOwnershipHistory, listVehicleEvents, recordMileage } from "./trust.controller";
import { correctionSchema, createMaintenanceSchema, createMileageLogSchema, recordIdSchema, vehicleIdSchema } from "./trust.schemas";

export const vehicleTrustRouter = Router();
export const maintenanceTrustRouter = Router();

vehicleTrustRouter.use(authenticate);
vehicleTrustRouter.get("/:id/events", validate(vehicleIdSchema, "params"), listVehicleEvents);
vehicleTrustRouter.get("/:id/ownerships", validate(vehicleIdSchema, "params"), listOwnershipHistory);
vehicleTrustRouter.post("/:id/mileage-logs", validate(vehicleIdSchema, "params"), validate(createMileageLogSchema), recordMileage);
vehicleTrustRouter.post("/:id/maintenance-records", validate(vehicleIdSchema, "params"), validate(createMaintenanceSchema), createMaintenance);

maintenanceTrustRouter.use(authenticate);
maintenanceTrustRouter.post("/:id/finalize", validate(recordIdSchema, "params"), finalizeMaintenance);
maintenanceTrustRouter.post("/:id/corrections", validate(recordIdSchema, "params"), validate(correctionSchema), correctMaintenance);
