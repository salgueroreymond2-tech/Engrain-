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
});
