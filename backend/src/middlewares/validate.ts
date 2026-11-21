import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

import { AppError } from "../shared/errors/app-error";

type RequestPart = "body" | "params" | "query";

export const validate = (schema: ZodTypeAny, part: RequestPart = "body"): RequestHandler =>
  (request, response, next) => {
    const parsed = schema.safeParse(request[part]);

    if (!parsed.success) {
      next(
        new AppError(
          422,
          "VALIDATION_ERROR",
          "The request contains invalid data.",
          parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        )
      );
      return;
    }

    // Express 5 exposes request.query as a getter. Keep the normalized query in locals
    // instead of assigning to it, while preserving body/params normalization.
    if (part === "query") {
      response.locals.validatedQuery = parsed.data;
    } else {
      request[part] = parsed.data;
    }
    next();
  };
