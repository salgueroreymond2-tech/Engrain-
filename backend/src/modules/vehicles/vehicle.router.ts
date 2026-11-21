import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  archiveVehicle,
  createVehicle,
  getVehicle,
  getVehicleTimeline,
  grantVehicleAccess,
  listVehicles,
  updateVehicle
} from "./vehicle.controller";
import { createVehicleSchema, updateVehicleSchema, vehicleAccessGrantSchema, vehicleIdSchema } from "./vehicle.schemas";

export const vehicleRouter = Router();

vehicleRouter.use(authenticate);
vehicleRouter.get("/", listVehicles);
vehicleRouter.post("/", validate(createVehicleSchema), createVehicle);
vehicleRouter.get("/:id", validate(vehicleIdSchema, "params"), getVehicle);
vehicleRouter.get("/:id/timeline", validate(vehicleIdSchema, "params"), getVehicleTimeline);
vehicleRouter.post("/:id/access-grants", validate(vehicleIdSchema, "params"), validate(vehicleAccessGrantSchema), grantVehicleAccess);
vehicleRouter.patch("/:id", validate(vehicleIdSchema, "params"), validate(updateVehicleSchema), updateVehicle);
vehicleRouter.delete("/:id", validate(vehicleIdSchema, "params"), archiveVehicle);
