import { compare, hash } from "bcryptjs";
import type { User } from "@prisma/client";
import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";

type RegisterInput = { name: string; email: string; password: string };
type LoginInput = { email: string; password: string };

export const publicUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const createAccessToken = (user: User): string =>
  jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_ACCESS_TTL as SignOptions["expiresIn"]
  });

export const authService = {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError(409, "EMAIL_ALREADY_REGISTERED", "An account with this email already exists.");
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await hash(input.password, 12)
      }
    });

    return { user: publicUser(user), accessToken: createAccessToken(user) };
  },

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !(await compare(input.password, user.passwordHash))) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    }

    return { user: publicUser(user), accessToken: createAccessToken(user) };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError(401, "INVALID_TOKEN", "The account associated with this token no longer exists.");
    }

    return publicUser(user);
  }
};
