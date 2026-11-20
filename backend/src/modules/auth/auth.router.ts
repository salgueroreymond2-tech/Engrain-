import { Router } from "express";

import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import { login, me, register } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.get("/me", authenticate, me);
