import type { Server as HttpServer } from "node:http";

import { Server } from "socket.io";

import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../shared/security/tokens";

type SocketAuth = { id: string; role: string; sessionId: string };

export const createSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (typeof token !== "string") {
      next(new Error("AUTHENTICATION_REQUIRED"));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      const session = await prisma.authSession.findFirst({
        where: { id: payload.sessionId, userId: payload.userId, revokedAt: null, expiresAt: { gt: new Date() }, user: { isActive: true } },
        select: { id: true }
      });
      if (!session) throw new Error("SESSION_REVOKED");
      socket.data.auth = { id: payload.userId, role: payload.role, sessionId: session.id } as SocketAuth;
      next();
    } catch {
      next(new Error("INVALID_TOKEN"));
    }
  });

  io.on("connection", (socket) => {
    const auth = socket.data.auth as SocketAuth;
    socket.join(`user:${auth.id}`);
    socket.emit("system:ready", { timestamp: new Date().toISOString() });
  });

  return io;
};

export const emitNotification = (io: Server, userId: string, notification: unknown): void => {
  io.to(`user:${userId}`).emit("notification:created", notification);
};
