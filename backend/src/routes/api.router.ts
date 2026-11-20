import { Router } from "express";

import { authRouter } from "../modules/auth/auth.router";
import { createDeferredResourceRouter } from "../modules/deferred/deferred.router";
import { healthRouter } from "../modules/health/health.router";
import { vehicleRouter } from "../modules/vehicles/vehicle.router";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/vehicles", vehicleRouter);
apiRouter.use("/workshops", createDeferredResourceRouter("workshops"));
apiRouter.use("/work-orders", createDeferredResourceRouter("work orders"));
apiRouter.use("/maintenances", createDeferredResourceRouter("maintenances"));
apiRouter.use("/evidences", createDeferredResourceRouter("evidences"));
apiRouter.use("/diagnostics", createDeferredResourceRouter("diagnostics"));
apiRouter.use("/assistant", createDeferredResourceRouter("AI assistant"));
apiRouter.use("/notifications", createDeferredResourceRouter("notifications"));
apiRouter.use("/passports", createDeferredResourceRouter("passports"));
