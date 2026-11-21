import { Router } from "express";

import { assistantRouter } from "../modules/ai/assistant.router";
import { authRouter } from "../modules/auth/auth.router";
import { createDeferredResourceRouter } from "../modules/deferred/deferred.router";
import { diagnosticRouter, vehicleDiagnosticRouter } from "../modules/diagnostics/diagnostic.router";
import { externalProviderRouter, externalQueryRouter, vehicleExternalQueryRouter } from "../modules/external-data/external-data.router";
import { healthRouter } from "../modules/health/health.router";
import { organizationRouter } from "../modules/organizations/organization.router";
import { passportRouter, publicPassportRouter } from "../modules/passports/passport.router";
import { maintenanceTrustRouter, vehicleTrustRouter } from "../modules/trust/trust.router";
import { transferRouter, vehicleTransferRouter } from "../modules/transfers/transfer.router";
import { vehicleRouter } from "../modules/vehicles/vehicle.router";
import { workshopRouter } from "../modules/workshops/workshop.router";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/organizations", organizationRouter);
apiRouter.use("/vehicles", vehicleRouter);
apiRouter.use("/vehicles", vehicleTrustRouter);
apiRouter.use("/vehicles", vehicleDiagnosticRouter);
apiRouter.use("/vehicles", vehicleTransferRouter);
apiRouter.use("/vehicles", vehicleExternalQueryRouter);
apiRouter.use("/maintenance-records", maintenanceTrustRouter);
apiRouter.use("/workshops", workshopRouter);
apiRouter.use("/work-orders", createDeferredResourceRouter("work orders"));
apiRouter.use("/maintenances", createDeferredResourceRouter("maintenances"));
apiRouter.use("/evidences", createDeferredResourceRouter("evidences"));
apiRouter.use("/diagnostics", diagnosticRouter);
apiRouter.use("/external-providers", externalProviderRouter);
apiRouter.use("/external-queries", externalQueryRouter);
apiRouter.use("/assistant", assistantRouter);
apiRouter.use("/notifications", createDeferredResourceRouter("notifications"));
apiRouter.use("/transfers", transferRouter);
apiRouter.use("/passports/public", publicPassportRouter);
apiRouter.use("/passports", passportRouter);
