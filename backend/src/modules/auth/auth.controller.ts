import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { authService } from "./auth.service";

export const register: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.register(request.body);
  response.status(201).json({ success: true, data: result });
});

export const login: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.login(request.body);
  response.status(200).json({ success: true, data: result });
});

export const me: RequestHandler = asyncHandler(async (_request, response) => {
  const user = await authService.getProfile(response.locals.auth!.id);
  response.status(200).json({ success: true, data: { user } });
});
