import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { transferService } from "./transfer.service";

export const initiateTransfer: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const result = await transferService.initiate(id, response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: result });
});

export const acceptTransfer: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const result = await transferService.accept(id, response.locals.auth!, response.locals.requestId);
  response.status(200).json({ success: true, data: result });
});
