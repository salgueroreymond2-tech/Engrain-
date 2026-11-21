import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { analyzeMaintenance, answerHistoryQuestion, detectInconsistencies, explainDiagnostics, interpretDtcs, recommendReviews } from "./assistant.controller";
import { assistantAnalysisQuerySchema, assistantVehicleIdSchema, historyQuestionSchema } from "./assistant.schemas";

export const assistantRouter = Router();

assistantRouter.use(authenticate);
assistantRouter.get("/vehicles/:id/dtc-interpretation", validate(assistantVehicleIdSchema, "params"), validate(assistantAnalysisQuerySchema, "query"), interpretDtcs);
assistantRouter.get("/vehicles/:id/diagnostic-explanation", validate(assistantVehicleIdSchema, "params"), validate(assistantAnalysisQuerySchema, "query"), explainDiagnostics);
assistantRouter.get("/vehicles/:id/maintenance-analysis", validate(assistantVehicleIdSchema, "params"), validate(assistantAnalysisQuerySchema, "query"), analyzeMaintenance);
assistantRouter.get("/vehicles/:id/recommendations", validate(assistantVehicleIdSchema, "params"), validate(assistantAnalysisQuerySchema, "query"), recommendReviews);
assistantRouter.get("/vehicles/:id/inconsistencies", validate(assistantVehicleIdSchema, "params"), validate(assistantAnalysisQuerySchema, "query"), detectInconsistencies);
assistantRouter.post("/vehicles/:id/questions", validate(assistantVehicleIdSchema, "params"), validate(historyQuestionSchema), answerHistoryQuestion);
