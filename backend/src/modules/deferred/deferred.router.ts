import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { AppError } from "../../shared/errors/app-error";

/**
 * Preserves a documented resource boundary while its domain workflow is built.
 * It prevents unimplemented endpoints from silently appearing successful.
 */
export const createDeferredResourceRouter = (resource: string): Router => {
  const router = Router();
  router.use(authenticate);
  router.use((_request, _response, next) => {
    next(
      new AppError(
        501,
        "FEATURE_NOT_IMPLEMENTED",
        `The ${resource} module is defined in the API contract but is not enabled in this MVP build.`
      )
    );
  });
  return router;
};
