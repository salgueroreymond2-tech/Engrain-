import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { passportService } from "./passport.service";

export const createPassport: RequestHandler = asyncHandler(async (request, response) => {
  const passport = await passportService.create(response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: { passport } });
});

export const getPassport: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const passport = await passportService.getPrivate(id, response.locals.auth!);
  response.status(200).json({ success: true, data: { passport } });
});

export const revokePassport: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const passport = await passportService.revoke(id, response.locals.auth!, response.locals.requestId);
  response.status(200).json({ success: true, data: { passport } });
});

export const getPassportQrCode: RequestHandler = asyncHandler(async (request, response) => {
  const { id } = request.params as { id: string };
  const qrCode = await passportService.qrCode(id, response.locals.auth!);
  response.status(200).json({ success: true, data: qrCode });
});

export const getPublicPassport: RequestHandler = asyncHandler(async (request, response) => {
  const { publicToken } = request.params as { publicToken: string };
  const result = await passportService.getPublic(publicToken, response.locals.requestId, request.ip);
  response.status(200).json({ success: true, data: result });
});
