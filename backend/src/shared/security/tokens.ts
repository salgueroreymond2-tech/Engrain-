import { createHash, timingSafeEqual } from "node:crypto";

import type { User, UserRole } from "@prisma/client";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { env } from "../../config/env";
import { AppError } from "../errors/app-error";

type TokenType = "access" | "refresh";

export interface SessionTokenClaims {
  userId: string;
  role: UserRole;
  sessionId: string;
  type: TokenType;
  expiresAt: Date;
}

const durationToMilliseconds = (duration: string): number => {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) {
    throw new Error("JWT TTL must use a whole number followed by s, m, h or d.");
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = unit === "s" ? 1_000 : unit === "m" ? 60_000 : unit === "h" ? 3_600_000 : 86_400_000;
  return amount * multiplier;
};

const sign = (user: Pick<User, "id" | "role">, sessionId: string, type: TokenType): string => {
  const isAccess = type === "access";
  const secret = isAccess ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;
  const ttl = isAccess ? env.JWT_ACCESS_TTL : env.JWT_REFRESH_TTL;

  return jwt.sign({ role: user.role, sessionId, type }, secret, {
    subject: user.id,
    expiresIn: ttl as SignOptions["expiresIn"]
  });
};

export const createTokenPair = (user: Pick<User, "id" | "role">, sessionId: string) => ({
  accessToken: sign(user, sessionId, "access"),
  refreshToken: sign(user, sessionId, "refresh"),
  refreshExpiresAt: getRefreshExpiresAt()
});

export const getRefreshExpiresAt = (): Date => new Date(Date.now() + durationToMilliseconds(env.JWT_REFRESH_TTL));

const verify = (token: string, expectedType: TokenType): SessionTokenClaims => {
  const secret = expectedType === "access" ? env.JWT_ACCESS_SECRET : env.JWT_REFRESH_SECRET;

  try {
    const payload = jwt.verify(token, secret) as JwtPayload & {
      role?: unknown;
      sessionId?: unknown;
      type?: unknown;
    };

    if (
      !payload.sub ||
      typeof payload.role !== "string" ||
      typeof payload.sessionId !== "string" ||
      payload.type !== expectedType ||
      typeof payload.exp !== "number"
    ) {
      throw new Error("Malformed token payload.");
    }

    return {
      userId: payload.sub,
      role: payload.role as UserRole,
      sessionId: payload.sessionId,
      type: expectedType,
      expiresAt: new Date(payload.exp * 1_000)
    };
  } catch {
    throw new AppError(401, "INVALID_TOKEN", "The token is invalid or expired.");
  }
};

export const verifyAccessToken = (token: string): SessionTokenClaims => verify(token, "access");
export const verifyRefreshToken = (token: string): SessionTokenClaims => verify(token, "refresh");

export const hashToken = (token: string): string => createHash("sha256").update(token).digest("hex");

export const hashesMatch = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};
