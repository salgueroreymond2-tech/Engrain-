import type { AuthenticatedUser } from "../shared/types/auth";

declare global {
  namespace Express {
    interface Locals {
      auth?: AuthenticatedUser;
      requestId?: string;
    }
  }
}

export {};
