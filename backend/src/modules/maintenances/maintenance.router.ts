import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  listMaintenances,
  createMaintenance,
  getMaintenance,
  updateMaintenance,
  deleteMaintenance,
} from "./maintenance.controller";
import {
  maintenanceIdSchema,
  createMaintenanceSchema,
  updateMaintenanceSchema,
  listMaintenancesQuerySchema,
} from "./maintenance.schemas";

const router = Router();
router.use(authenticate);

router.get(
  "/",
  authorize("OWNER", "TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(listMaintenancesQuerySchema, "query"),
  listMaintenances
);
router.post(
  "/",
  authorize("OWNER", "TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(createMaintenanceSchema),
  createMaintenance
);
router.get(
  "/:id",
  authorize("OWNER", "TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(maintenanceIdSchema, "params"),
  getMaintenance
);
router.patch(
  "/:id",
  authorize("OWNER", "TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(maintenanceIdSchema, "params"),
  validate(updateMaintenanceSchema),
  updateMaintenance
);
router.delete(
  "/:id",
  authorize("OWNER", "TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(maintenanceIdSchema, "params"),
  deleteMaintenance
);

export const maintenanceRouter = router;
