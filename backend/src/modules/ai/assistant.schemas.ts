import { z } from "zod";

const cuid = z.string().cuid();

export const assistantVehicleIdSchema = z.object({ id: cuid });
export const assistantAnalysisQuerySchema = z.object({ scanId: cuid.optional() });
export const historyQuestionSchema = z.object({
  question: z.string().trim().min(4).max(800),
  scanId: cuid.optional()
});
