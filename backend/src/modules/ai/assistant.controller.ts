import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { diagnosticAIService } from "./diagnostic-ai.service";

const analysisHandler = (kind: "DTC_INTERPRETATION" | "DIAGNOSTIC_EXPLANATION" | "MAINTENANCE_ANALYSIS" | "RECOMMENDATIONS" | "INCONSISTENCIES"): RequestHandler => asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const { scanId } = response.locals.validatedQuery as { scanId?: string };
  const analysis = await diagnosticAIService.analyze(id, response.locals.auth!, kind, { scanId }, response.locals.requestId);
  response.status(200).json({ success: true, data: analysis });
});

export const interpretDtcs = analysisHandler("DTC_INTERPRETATION");
export const explainDiagnostics = analysisHandler("DIAGNOSTIC_EXPLANATION");
export const analyzeMaintenance = analysisHandler("MAINTENANCE_ANALYSIS");
export const recommendReviews = analysisHandler("RECOMMENDATIONS");
export const detectInconsistencies = analysisHandler("INCONSISTENCIES");

export const answerHistoryQuestion: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const { question, scanId } = request.body as { question: string; scanId?: string };
  const analysis = await diagnosticAIService.analyze(id, response.locals.auth!, "HISTORY_QUESTION", { question, scanId }, response.locals.requestId);
  response.status(200).json({ success: true, data: analysis });
});
