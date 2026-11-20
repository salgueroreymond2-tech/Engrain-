import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";

import { env } from "../config/env";
import { AppError } from "../shared/errors/app-error";

export const notFound: RequestHandler = (request, _response, next) => {
  next(new AppError(404, "ROUTE_NOT_FOUND", `Route ${request.method} ${request.originalUrl} was not found.`));
};

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  let normalized = error instanceof AppError ? error : undefined;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      normalized = new AppError(409, "RESOURCE_CONFLICT", "A resource with this value already exists.");
    }
    if (error.code === "P2025") {
      normalized = new AppError(404, "RESOURCE_NOT_FOUND", "The requested resource does not exist.");
    }
  }

  if (!normalized) {
    if (env.NODE_ENV !== "test") {
      console.error(error);
    }
    normalized = new AppError(500, "INTERNAL_ERROR", "An unexpected error occurred.");
  }

  response.status(normalized.statusCode).json({
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.details ? { details: normalized.details } : {})
    },
    meta: { requestId: response.locals.requestId ?? "unknown" }
  });
};
