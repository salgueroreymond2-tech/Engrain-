import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { createWorkshop, listAuthorizedVehicles } from "./workshop.controller";
import { createWorkshopSchema, workshopIdSchema } from "./workshop.schemas";

export const workshopRouter = Router();

workshopRouter.use(authenticate);
workshopRouter.post("/", validate(createWorkshopSchema), createWorkshop);
workshopRouter.get("/:id/vehicles", validate(workshopIdSchema, "params"), listAuthorizedVehicles);
