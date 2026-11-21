import { z } from "zod";

import { simulatedObdScenarios } from "./simulated-obd.provider";

const cuid = z.string().cuid();

export const vehicleIdSchema = z.object({ id: cuid });
export const diagnosticIdSchema = z.object({ id: cuid });

export const simulateDiagnosticSchema = z.object({
  scenario: z.enum(simulatedObdScenarios)
});

export const measurementSeriesSchema = z.object({
  metric: z.string().trim().min(2).max(80).regex(/^[a-z0-9_]+$/, "metric must use lowercase snake_case"),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(250)
}).refine((value) => !value.from || !value.to || value.from <= value.to, {
  message: "from must be before or equal to to",
  path: ["from"]
});
