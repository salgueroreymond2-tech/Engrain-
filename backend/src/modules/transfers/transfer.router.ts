import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { acceptTransfer, initiateTransfer } from "./transfer.controller";
import { createTransferSchema, transferIdSchema, vehicleIdSchema } from "./transfer.schemas";

export const vehicleTransferRouter = Router();
export const transferRouter = Router();

vehicleTransferRouter.use(authenticate);
vehicleTransferRouter.post("/:id/transfers", validate(vehicleIdSchema, "params"), validate(createTransferSchema), initiateTransfer);

transferRouter.use(authenticate);
transferRouter.post("/:id/accept", validate(transferIdSchema, "params"), acceptTransfer);
