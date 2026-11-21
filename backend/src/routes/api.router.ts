import { Router } from "express";

import { authRouter } from "../modules/auth/auth.router";
import { createDeferredResourceRouter } from "../modules/deferred/deferred.router";
import { workOrderRouter } from "../modules/work-orders/work-order.router";
import { maintenanceRouter } from "../modules/maintenances/maintenance.router";
import { passportRouter } from "../modules/passports/passport.router";
import { healthRouter } from "../modules/health/health.router";
import { vehicleRouter } from "../modules/vehicles/vehicle.router";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/vehicles", vehicleRouter);
apiRouter.use("/workshops", createDeferredResourceRouter("workshops"));
apiRouter.use("/work-orders", workOrderRouter);
apiRouter.use("/maintenances", maintenanceRouter);
apiRouter.use("/evidences", createDeferredResourceRouter("evidences"));
apiRouter.use("/diagnostics", createDeferredResourceRouter("diagnostics"));
apiRouter.use("/assistant", createDeferredResourceRouter("AI assistant"));
apiRouter.use("/notifications", createDeferredResourceRouter("notifications"));
apiRouter.use("/passports", passportRouter);
