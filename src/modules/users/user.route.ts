import { Router } from "express";
import { getMeController } from "./user.controller";
import { authenticate } from "../auth/middleware";

const router = Router();

router.get("/users/me", authenticate, getMeController);

export default router;
