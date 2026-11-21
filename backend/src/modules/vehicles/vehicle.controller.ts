import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { vehicleService } from "./vehicle.service";

export const listVehicles: RequestHandler = asyncHandler(async (_request, response) => {
  const vehicles = await vehicleService.list(response.locals.auth!);
  response.status(200).json({ success: true, data: { vehicles } });
});

export const getVehicle: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const vehicle = await vehicleService.getById(id, response.locals.auth!);
  response.status(200).json({ success: true, data: { vehicle } });
});

export const createVehicle: RequestHandler = asyncHandler(async (request, response) => {
  const vehicle = await vehicleService.create(response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: { vehicle } });
});

export const updateVehicle: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const vehicle = await vehicleService.update(id, response.locals.auth!, request.body, response.locals.requestId);
  response.status(200).json({ success: true, data: { vehicle } });
});

export const archiveVehicle: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  await vehicleService.archive(id, response.locals.auth!, response.locals.requestId);
  response.status(204).send();
});

export const grantVehicleAccess: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const grant = await vehicleService.grantAccess(id, response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: { grant } });
});

export const getVehicleTimeline: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const timeline = await vehicleService.timeline(id, response.locals.auth!);
  response.status(200).json({ success: true, data: timeline });
});
