import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { getDiagnostic, getDiagnosticMeasurements, getMeasurementSeries, listDiagnostics, simulateDiagnostic } from "./diagnostic.controller";
import { diagnosticIdSchema, measurementSeriesSchema, simulateDiagnosticSchema, vehicleIdSchema } from "./diagnostic.schemas";

export const vehicleDiagnosticRouter = Router();
export const diagnosticRouter = Router();

vehicleDiagnosticRouter.use(authenticate);
vehicleDiagnosticRouter.get("/:id/diagnostics", validate(vehicleIdSchema, "params"), listDiagnostics);
vehicleDiagnosticRouter.post("/:id/diagnostics/simulations", validate(vehicleIdSchema, "params"), validate(simulateDiagnosticSchema), simulateDiagnostic);
vehicleDiagnosticRouter.get("/:id/diagnostics/measurements", validate(vehicleIdSchema, "params"), validate(measurementSeriesSchema, "query"), getMeasurementSeries);

diagnosticRouter.use(authenticate);
diagnosticRouter.get("/:id", validate(diagnosticIdSchema, "params"), getDiagnostic);
diagnosticRouter.get("/:id/measurements", validate(diagnosticIdSchema, "params"), getDiagnosticMeasurements);
