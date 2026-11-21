import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { authRateLimit } from "../../middlewares/auth-rate-limit";
import { validate } from "../../middlewares/validate";
import { listSessions, login, logout, me, refresh, register } from "./auth.controller";
import { loginSchema, refreshSchema, registerSchema, sessionIdSchema } from "./auth.schemas";

export const authRouter = Router();

authRouter.post("/register", authRateLimit, validate(registerSchema), register);
authRouter.post("/login", authRateLimit, validate(loginSchema), login);
authRouter.post("/refresh", authRateLimit, validate(refreshSchema), refresh);
authRouter.get("/me", authenticate, me);
authRouter.get("/sessions", authenticate, listSessions);
authRouter.delete("/sessions/:id", authenticate, validate(sessionIdSchema, "params"), logout);
