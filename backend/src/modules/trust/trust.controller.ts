import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { trustService } from "./trust.service";

export const recordMileage: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const result = await trustService.recordMileage(id, response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: result });
});

export const createMaintenance: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const maintenance = await trustService.createMaintenance(id, response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: { maintenance } });
});

export const finalizeMaintenance: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const maintenance = await trustService.finalizeMaintenance(id, response.locals.auth!, response.locals.requestId);
  response.status(200).json({ success: true, data: { maintenance } });
});

export const correctMaintenance: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const maintenance = await trustService.correctMaintenance(id, response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: { maintenance } });
});

export const listVehicleEvents: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const events = await trustService.events(id, response.locals.auth!);
  response.status(200).json({ success: true, data: { events } });
});

export const listOwnershipHistory: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const ownerships = await trustService.ownershipHistory(id, response.locals.auth!);
  response.status(200).json({ success: true, data: { ownerships } });
});
