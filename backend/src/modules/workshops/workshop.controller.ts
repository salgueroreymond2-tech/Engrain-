import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { workshopService } from "./workshop.service";

export const createWorkshop: RequestHandler = asyncHandler(async (request, response) => {
  const workshop = await workshopService.create(response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: { workshop } });
});

export const listAuthorizedVehicles: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const vehicles = await workshopService.authorizedVehicles(id, response.locals.auth!);
  response.status(200).json({ success: true, data: { vehicles } });
});
