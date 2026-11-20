import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { vehicleService } from "./vehicle.service";

export const listVehicles: RequestHandler = asyncHandler(async (_request, response) => {
  const vehicles = await vehicleService.list(response.locals.auth!.id);
  response.status(200).json({ success: true, data: { vehicles } });
});

export const getVehicle: RequestHandler = asyncHandler(async (request, response) => {
  const vehicle = await vehicleService.getById(request.params.id, response.locals.auth!.id);
  response.status(200).json({ success: true, data: { vehicle } });
});

export const createVehicle: RequestHandler = asyncHandler(async (request, response) => {
  const vehicle = await vehicleService.create(response.locals.auth!.id, request.body);
  response.status(201).json({ success: true, data: { vehicle } });
});

export const updateVehicle: RequestHandler = asyncHandler(async (request, response) => {
  const vehicle = await vehicleService.update(request.params.id, response.locals.auth!.id, request.body);
  response.status(200).json({ success: true, data: { vehicle } });
});

export const archiveVehicle: RequestHandler = asyncHandler(async (request, response) => {
  await vehicleService.archive(request.params.id, response.locals.auth!.id);
  response.status(204).send();
});
