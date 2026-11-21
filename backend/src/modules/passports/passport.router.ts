import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  createPassport,
  getPassportById,
  getPassportByPublicToken,
  updatePassport,
} from "./passport.controller";
import {
  createPassportSchema,
  updatePassportSchema,
  passportIdSchema,
  publicTokenSchema,
} from "./passport.schemas";

const router = Router();
router.use(authenticate);

// Create passport (owner only)
router.post(
  "/",
  authorize("OWNER"),
  validate(createPassportSchema),
  createPassport
);

// Get passport by internal id (owner or participant)
router.get(
  "/:id",
  authorize("OWNER", "TECHNICIAN", "WORKSHOP_ADMIN"),
  validate(passportIdSchema, "params"),
  getPassportById
);

// Public endpoint (no auth)
router.get(
  "/public/:publicToken",
  validate(publicTokenSchema, "params"),
  getPassportByPublicToken
);

// Patch passport (owner can revoke or change visibility)
router.patch(
  "/:id",
  authorize("OWNER"),
  validate(passportIdSchema, "params"),
  validate(updatePassportSchema),
  updatePassport
);

export const passportRouter = router;
