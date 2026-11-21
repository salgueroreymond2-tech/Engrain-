import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { authService } from "./auth.service";

const clientContext = (request: Parameters<RequestHandler>[0], response: Parameters<RequestHandler>[1]) => ({
  userAgent: request.get("user-agent"),
  ipAddress: request.ip,
  requestId: response.locals.requestId
});

export const register: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.register(request.body, clientContext(request, response));
  response.status(201).json({ success: true, data: result });
});

export const login: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.login(request.body, clientContext(request, response));
  response.status(200).json({ success: true, data: result });
});

export const me: RequestHandler = asyncHandler(async (_request, response) => {
  const user = await authService.getProfile(response.locals.auth!.id);
  response.status(200).json({ success: true, data: { user } });
});

export const refresh: RequestHandler = asyncHandler(async (request, response) => {
  const result = await authService.refresh(request.body.refreshToken, clientContext(request, response));
  response.status(200).json({ success: true, data: result });
});

export const listSessions: RequestHandler = asyncHandler(async (_request, response) => {
  const sessions = await authService.listSessions(response.locals.auth!.id);
  response.status(200).json({ success: true, data: { sessions } });
});

export const logout: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  await authService.revokeSession(response.locals.auth!.id, id, clientContext(request, response));
  response.status(204).send();
});
