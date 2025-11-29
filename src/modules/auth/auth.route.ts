import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "./middleware.js";

const router = Router();

// Register (signup)
router.post("/auth/register", authController.register);

// Login
router.post("/auth/login", authController.login);

// Logout
router.post("/auth/logout", authController.logout);

// Get current user (protected)
router.get("/auth/me", authenticate, authController.me);

// Refresh tokens
router.post("/auth/refresh", authController.refresh);

export default router;
