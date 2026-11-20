import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env";
import { openapiDocument } from "./docs/openapi";
import { errorHandler, notFound } from "./middlewares/error-handler";
import { requestId } from "./middlewares/request-id";
import { apiRouter } from "./routes/api.router";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"]
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(requestId);

if (env.ENABLE_SWAGGER) {
  app.get("/docs.json", (_request, response) => response.json(openapiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument, { explorer: true }));
}

app.use("/api/v1", apiRouter);
app.use(notFound);
app.use(errorHandler);
