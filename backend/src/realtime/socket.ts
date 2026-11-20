import type { Server as HttpServer } from "node:http";

import jwt, { type JwtPayload } from "jsonwebtoken";
import { Server } from "socket.io";

import { env } from "../config/env";

type SocketAuth = { id: string; role: string };

export const createSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (typeof token !== "string") {
      next(new Error("AUTHENTICATION_REQUIRED"));
      return;
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
      if (!payload.sub || typeof payload.role !== "string") {
        throw new Error("INVALID_TOKEN");
      }
      socket.data.auth = { id: payload.sub, role: payload.role } as SocketAuth;
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
