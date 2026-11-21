import { compare, hash } from "bcryptjs";
import type { Prisma, User } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { writeAudit } from "../../shared/services/audit.service";
import {
  createTokenPair,
  getRefreshExpiresAt,
  hashesMatch,
  hashToken,
  verifyRefreshToken
} from "../../shared/security/tokens";

type RegisterInput = { name: string; email: string; password: string };
type LoginInput = { email: string; password: string };
type ClientContext = { userAgent?: string; ipAddress?: string; requestId?: string };
type DbClient = Prisma.TransactionClient;

export const publicUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const publicSession = (session: {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  lastUsedAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}) => ({
  id: session.id,
  userAgent: session.userAgent,
  ipAddress: session.ipAddress,
  expiresAt: session.expiresAt,
  lastUsedAt: session.lastUsedAt,
  revokedAt: session.revokedAt,
  createdAt: session.createdAt
});

const createSession = async (client: DbClient, user: User, context: ClientContext) => {
  const session = await client.authSession.create({
    data: {
      userId: user.id,
      refreshTokenHash: "0".repeat(64),
      userAgent: context.userAgent?.slice(0, 512),
      ipAddress: context.ipAddress?.slice(0, 64),
      expiresAt: getRefreshExpiresAt()
    }
  });
  const tokens = createTokenPair(user, session.id);

  await client.authSession.update({
    where: { id: session.id },
    data: { refreshTokenHash: hashToken(tokens.refreshToken), expiresAt: tokens.refreshExpiresAt }
  });

  return { ...tokens, sessionId: session.id };
};

export const authService = {
  async register(input: RegisterInput, context: ClientContext) {
    const passwordHash = await hash(input.password, 12);

    return prisma.$transaction(async (transaction) => {
      const existing = await transaction.user.findUnique({ where: { email: input.email } });
      if (existing) {
        throw new AppError(409, "EMAIL_ALREADY_REGISTERED", "An account with this email already exists.");
      }

      const user = await transaction.user.create({
        data: { name: input.name, email: input.email, passwordHash }
      });
      const tokens = await createSession(transaction, user, context);
      await writeAudit(
        {
          actorUserId: user.id,
          action: "CREATE",
          entityType: "User",
          entityId: user.id,
          requestId: context.requestId,
          ipAddress: context.ipAddress,
          metadata: { source: "register" }
        },
        transaction
      );

      return { user: publicUser(user), ...tokens };
    });
  },

  async login(input: LoginInput, context: ClientContext) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive || !(await compare(input.password, user.passwordHash))) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    return prisma.$transaction(async (transaction) => {
      const tokens = await createSession(transaction, user, context);
      await writeAudit(
        {
          actorUserId: user.id,
          action: "LOGIN",
          entityType: "AuthSession",
          entityId: tokens.sessionId,
          requestId: context.requestId,
          ipAddress: context.ipAddress
        },
        transaction
      );
      return { user: publicUser(user), ...tokens };
    });
  },

  async refresh(refreshToken: string, context: ClientContext) {
    const claims = verifyRefreshToken(refreshToken);
    const session = await prisma.authSession.findFirst({
      where: { id: claims.sessionId, userId: claims.userId },
      include: { user: true }
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.isActive) {
      throw new AppError(401, "SESSION_REVOKED", "The session is no longer active.");
    }

    if (!hashesMatch(hashToken(refreshToken), session.refreshTokenHash)) {
      await prisma.authSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      throw new AppError(401, "INVALID_TOKEN", "The refresh token is invalid.");
    }

    const tokens = createTokenPair(session.user, session.id);
    await prisma.authSession.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashToken(tokens.refreshToken),
        expiresAt: tokens.refreshExpiresAt,
        lastUsedAt: new Date(),
        userAgent: context.userAgent?.slice(0, 512),
        ipAddress: context.ipAddress?.slice(0, 64)
      }
    });

    return { user: publicUser(session.user), ...tokens, sessionId: session.id };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId, isActive: true } });
    if (!user) {
      throw new AppError(401, "INVALID_TOKEN", "The account associated with this token no longer exists.");
    }
    return publicUser(user);
  },

  async listSessions(userId: string) {
    const sessions = await prisma.authSession.findMany({
      where: { userId },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        expiresAt: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true
      },
      orderBy: { lastUsedAt: "desc" }
    });
    return sessions.map(publicSession);
  },

  async revokeSession(userId: string, sessionId: string, context: ClientContext) {
    const result = await prisma.authSession.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
    if (result.count === 0) {
      throw new AppError(404, "SESSION_NOT_FOUND", "The requested session does not exist.");
    }
    await writeAudit({
      actorUserId: userId,
      action: "LOGOUT",
      entityType: "AuthSession",
      entityId: sessionId,
      requestId: context.requestId,
      ipAddress: context.ipAddress
    });
  }
};
