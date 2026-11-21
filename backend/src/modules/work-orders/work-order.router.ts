// Work Order router
import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  listWorkOrders,
  createWorkOrder,
  getWorkOrder,
  updateWorkOrder,
} from "./work-order.controller";
import {
  createWorkOrderSchema,
  updateWorkOrderSchema,
  workOrderIdSchema,
  listWorkOrdersQuerySchema,
} from "./work-order.schemas";

const router = Router();
router.use(authenticate);

// List work orders (owner or workshop member)
router.get(
  "/",
  authorize("OWNER", "TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(listWorkOrdersQuerySchema, "query"),
  listWorkOrders
);

// Create work order (technician or workshop admin)
router.post(
  "/",
  authorize("TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(createWorkOrderSchema),
  createWorkOrder
);

router.get(
  "/:id",
  authorize("OWNER", "TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(workOrderIdSchema, "params"),
  getWorkOrder
);

router.patch(
  "/:id",
  authorize("TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(workOrderIdSchema, "params"),
  validate(updateWorkOrderSchema),
  updateWorkOrder
);

export const workOrderRouter = router;
