import type { RequestHandler } from "express";

import { prisma } from "../lib/prisma";
import { AppError } from "../shared/errors/app-error";
import { verifyAccessToken } from "../shared/security/tokens";
import type { AuthenticatedUser } from "../shared/types/auth";

const validRoles = new Set(["SUPER_ADMIN", "WORKSHOP_ADMIN", "MECHANIC", "VEHICLE_OWNER", "DEALERSHIP_ADMIN", "SALES_AGENT"]);

export const authenticate: RequestHandler = async (request, response, next) => {
  const authorization = request.header("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  if (!token) {
    next(new AppError(401, "AUTHENTICATION_REQUIRED", "A Bearer token is required."));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    if (!validRoles.has(payload.role)) {
      throw new AppError(401, "INVALID_TOKEN", "The access token is invalid.");
    }

    const activeSession = await prisma.authSession.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: { isActive: true }
      },
      select: { id: true }
    });

    if (!activeSession) {
      throw new AppError(401, "SESSION_REVOKED", "The session is no longer active.");
    }

    response.locals.auth = {
      id: payload.userId,
      role: payload.role as AuthenticatedUser["role"],
      sessionId: activeSession.id
    };
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
