import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { createOrganization, listMyOrganizations } from "./organization.controller";
import { createOrganizationSchema } from "./organization.schemas";

export const organizationRouter = Router();

organizationRouter.use(authenticate);
organizationRouter.get("/me", listMyOrganizations);
organizationRouter.post("/", validate(createOrganizationSchema), createOrganization);
