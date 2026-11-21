import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { diagnosticService } from "./diagnostic.service";
import type { SimulatedObdScenario } from "./simulated-obd.provider";

export const simulateDiagnostic: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const { scenario } = request.body as { scenario: SimulatedObdScenario };
  const diagnostic = await diagnosticService.simulate(id, response.locals.auth!, scenario, response.locals.requestId);
  response.status(201).json({ success: true, data: { diagnostic } });
});

export const listDiagnostics: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const diagnostics = await diagnosticService.list(id, response.locals.auth!);
  response.status(200).json({ success: true, data: { diagnostics } });
});

export const getDiagnostic: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const diagnostic = await diagnosticService.get(id, response.locals.auth!);
  response.status(200).json({ success: true, data: { diagnostic } });
});

export const getDiagnosticMeasurements: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const data = await diagnosticService.measurements(id, response.locals.auth!);
  response.status(200).json({ success: true, data });
});

export const getMeasurementSeries: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const { metric, from, to, limit } = response.locals.validatedQuery as { metric: string; from?: Date; to?: Date; limit: number };
  const measurements = await diagnosticService.series(id, response.locals.auth!, metric, from, to, limit);
  response.status(200).json({ success: true, data: { metric, measurements } });
});
