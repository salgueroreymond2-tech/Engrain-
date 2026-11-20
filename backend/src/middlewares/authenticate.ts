import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "../shared/errors/app-error";
import type { AuthenticatedUser } from "../shared/types/auth";

const validRoles = new Set(["OWNER", "TECHNICIAN", "WORKSHOP_ADMIN", "DEALER_ADMIN", "PLATFORM_ADMIN"]);

export const authenticate: RequestHandler = (request, response, next) => {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  if (!token) {
    next(new AppError(401, "AUTHENTICATION_REQUIRED", "A Bearer token is required."));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    const subject = payload.sub;
    const role = payload.role;

    if (!subject || typeof role !== "string" || !validRoles.has(role)) {
      throw new AppError(401, "INVALID_TOKEN", "The access token is invalid.");
    }

    response.locals.auth = { id: subject, role: role as AuthenticatedUser["role"] };
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, "INVALID_TOKEN", "The access token is invalid."));
  }
};

export const authorize = (...roles: AuthenticatedUser["role"][]): RequestHandler =>
  (_request, response, next) => {
    const auth = response.locals.auth;
    if (!auth) {
      next(new AppError(401, "AUTHENTICATION_REQUIRED", "A Bearer token is required."));
      return;
    }

    if (!roles.includes(auth.role)) {
      next(new AppError(403, "FORBIDDEN", "You do not have permission for this action."));
      return;
    }

    next();
  };
