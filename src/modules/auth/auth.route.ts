import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authenticate } from "./middleware.js";

const router = Router();

// Register (signup)
router.post("/register", authController.register);

// Login
router.post("/login", authController.login);

// Logout
router.post("/logout", authController.logout);

// Get current user (protected)
router.get("/me", authenticate, authController.me);

// Refresh tokens
router.post("/refresh", authController.refresh);

export default router;
