import type { RequestHandler } from "express";

import { asyncHandler } from "../../shared/utils/async-handler";
import { organizationService } from "./organization.service";

export const createOrganization: RequestHandler = asyncHandler(async (request, response) => {
  const organization = await organizationService.create(response.locals.auth!, request.body, response.locals.requestId);
  response.status(201).json({ success: true, data: { organization } });
});

export const listMyOrganizations: RequestHandler = asyncHandler(async (_request, response) => {
  const memberships = await organizationService.listForUser(response.locals.auth!.id);
  response.status(200).json({ success: true, data: { memberships } });
});
