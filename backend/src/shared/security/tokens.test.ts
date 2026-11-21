import { describe, expect, it } from "vitest";

import { createTokenPair, verifyAccessToken, verifyRefreshToken } from "./tokens";

describe("session JWT tokens", () => {
  it("binds both tokens to the same user, role and session while keeping token types distinct", () => {
    const pair = createTokenPair({ id: "cm4auth000000000000000001", role: "VEHICLE_OWNER" }, "cm4session0000000000000001");

    expect(verifyAccessToken(pair.accessToken)).toMatchObject({
      userId: "cm4auth000000000000000001",
      role: "VEHICLE_OWNER",
      sessionId: "cm4session0000000000000001",
      type: "access"
    });
    expect(verifyRefreshToken(pair.refreshToken)).toMatchObject({
      userId: "cm4auth000000000000000001",
      sessionId: "cm4session0000000000000001",
      type: "refresh"
    });
    expect(() => verifyAccessToken(pair.refreshToken)).toThrow("invalid or expired");
  });
});
