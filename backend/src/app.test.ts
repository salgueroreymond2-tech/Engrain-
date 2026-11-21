import request from "supertest";
import { describe, expect, it } from "vitest";

import { app } from "./app";

describe("GET /api/v1/health", () => {
  it("returns the standard health response without a database connection", async () => {
    const response = await request(app).get("/api/v1/health").expect(200);

    expect(response.body).toMatchObject({
      success: true,
      data: { service: "engrain-api", status: "ok" }
    });
    expect(response.body.data.timestamp).toEqual(expect.any(String));
    expect(response.headers["x-request-id"]).toEqual(expect.any(String));
  });

  it("publishes the OpenAPI document for the frontend team", async () => {
    const response = await request(app).get("/docs.json").expect(200);

    expect(response.body).toMatchObject({
      openapi: "3.0.3",
      info: { title: "ENGRAIN API" }
    });
    expect(response.body.paths).toHaveProperty("/vehicles");
  });

  it("allows the configured frontend origin through CORS", async () => {
    const response = await request(app)
      .get("/api/v1/health")
      .set("Origin", "http://localhost:5173")
      .expect(200);

    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("uses the standard error envelope for unknown API routes", async () => {
    const response = await request(app).get("/api/v1/not-a-route").expect(404);

    expect(response.body).toMatchObject({
      success: false,
      error: { code: "ROUTE_NOT_FOUND" }
    });
    expect(response.body.meta.requestId).toEqual(expect.any(String));
  });
});
