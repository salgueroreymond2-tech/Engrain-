import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { archiveVehicle, createVehicle, getVehicle, listVehicles, updateVehicle } from "./vehicle.controller";
import { createVehicleSchema, updateVehicleSchema, vehicleIdSchema } from "./vehicle.schemas";

export const vehicleRouter = Router();

vehicleRouter.use(authenticate);
vehicleRouter.get("/", listVehicles);
vehicleRouter.post("/", validate(createVehicleSchema), createVehicle);
vehicleRouter.get("/:id", validate(vehicleIdSchema, "params"), getVehicle);
vehicleRouter.patch("/:id", validate(vehicleIdSchema, "params"), validate(updateVehicleSchema), updateVehicle);
vehicleRouter.delete("/:id", validate(vehicleIdSchema, "params"), archiveVehicle);
