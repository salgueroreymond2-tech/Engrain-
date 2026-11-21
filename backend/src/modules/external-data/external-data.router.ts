import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { attachExternalDocument, getExternalQuery, listExternalProviders, listVehicleExternalQueries, queryPlateExternalData, queryVehicleExternalData, retryExternalQuery } from "./external-data.controller";
import { externalQueryRateLimit } from "./external-query-rate-limit";
import { externalQueryIdSchema, manualDocumentSchema, plateExternalQuerySchema, vehicleExternalQuerySchema, vehicleIdSchema } from "./external-data.schemas";

export const externalProviderRouter = Router();
export const vehicleExternalQueryRouter = Router();
export const externalQueryRouter = Router();

externalProviderRouter.use(authenticate);
externalProviderRouter.get("/", listExternalProviders);

vehicleExternalQueryRouter.use(authenticate);
vehicleExternalQueryRouter.get("/:id/external-queries", validate(vehicleIdSchema, "params"), listVehicleExternalQueries);
vehicleExternalQueryRouter.post("/:id/external-queries", externalQueryRateLimit, validate(vehicleIdSchema, "params"), validate(vehicleExternalQuerySchema), queryVehicleExternalData);

externalQueryRouter.use(authenticate);
externalQueryRouter.post("/plate", externalQueryRateLimit, validate(plateExternalQuerySchema), queryPlateExternalData);
externalQueryRouter.get("/:id", validate(externalQueryIdSchema, "params"), getExternalQuery);
externalQueryRouter.post("/:id/retry", externalQueryRateLimit, validate(externalQueryIdSchema, "params"), retryExternalQuery);
externalQueryRouter.post("/:id/documents", validate(externalQueryIdSchema, "params"), validate(manualDocumentSchema), attachExternalDocument);
