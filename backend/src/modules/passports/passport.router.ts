import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { createPassport, getPassport, getPassportQrCode, getPublicPassport, revokePassport } from "./passport.controller";
import { passportPublicRateLimit } from "./passport-public-rate-limit";
import { createPassportSchema, passportIdSchema, publicTokenSchema } from "./passport.schemas";

export const passportRouter = Router();
export const publicPassportRouter = Router();

publicPassportRouter.get("/:publicToken", passportPublicRateLimit, validate(publicTokenSchema, "params"), getPublicPassport);

passportRouter.use(authenticate);
passportRouter.post("/", validate(createPassportSchema), createPassport);
passportRouter.get("/:id/qr", validate(passportIdSchema, "params"), getPassportQrCode);
passportRouter.post("/:id/revoke", validate(passportIdSchema, "params"), revokePassport);
passportRouter.get("/:id", validate(passportIdSchema, "params"), getPassport);
