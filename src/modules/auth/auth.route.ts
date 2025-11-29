import { Router } from "express";
import { signupController, loginController } from "./auth.controller";

const router = Router();

router.post("/auth/signup", signupController);
router.post("/auth/login", loginController);

export default router;
