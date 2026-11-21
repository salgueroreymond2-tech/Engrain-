import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { externalDataService } from "./external-data.service";

export const listExternalProviders: RequestHandler = asyncHandler(async (_request, response) => {
  const providers = await externalDataService.providers();
  response.status(200).json({ success: true, data: { providers } });
});

export const queryVehicleExternalData: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const query = await externalDataService.queryVehicle(id, response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: { query } });
});

export const queryPlateExternalData: RequestHandler = asyncHandler(async (request, response) => {
  const { plate, ...input } = request.body as { plate: { category?: string; code?: string; number: string }; providers?: never[]; mode: "MANUAL" | "SIMULATED" };
  const query = await externalDataService.queryPlate(plate, response.locals.auth!, input, response.locals.requestId);
  response.status(201).json({ success: true, data: { query } });
});

export const listVehicleExternalQueries: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const queries = await externalDataService.listForVehicle(id, response.locals.auth!);
  response.status(200).json({ success: true, data: { queries } });
});

export const getExternalQuery: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const query = await externalDataService.getQuery(id, response.locals.auth!);
  response.status(200).json({ success: true, data: { query } });
});

export const retryExternalQuery: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const query = await externalDataService.retry(id, response.locals.auth!, response.locals.requestId);
  response.status(201).json({ success: true, data: { query } });
});

export const attachExternalDocument: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const record = await externalDataService.attachManualDocument(id, response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: { record } });
});
