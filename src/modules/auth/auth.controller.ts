import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schema";
import { getMe, login, register, verifyRefreshToken } from "./auth.service.js";

export const authController = {
  // ------------------------------------------------------
  // POST /auth/register
  // ------------------------------------------------------
  register: async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    try {
      const result = await register(parsed.data);

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        accessToken: result.accessToken,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes("User already exists")) {
        return res.status(409).json({ message });
      }

      return res.status(500).json({ message });
    }
  },

  // ------------------------------------------------------
  // POST /auth/login
  // ------------------------------------------------------
  login: async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }
    try {
      const { user, accessToken, refreshToken } = await login(parsed.data);

      // Send refresh token via httpOnly cookie
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        accessToken,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      if (message.includes("Invalid email or password")) {
        return res.status(401).json({ message });
      }

      return res.status(500).json({ message });
    }
  },

  // ------------------------------------------------------
  // POST /auth/logout
  // ------------------------------------------------------
  logout: async (_req: Request, res: Response) => {
    res.clearCookie("refresh_token", {
      path: "/auth/refresh",
    });

    return res.json({ message: "Logged out successfully" });
  },

  // ------------------------------------------------------
  // GET /auth/me
  // ------------------------------------------------------
  me: async (req: Request, res: Response) => {
    const user = await getMe(req.user!.id);
    return res.json({ user });
  },

  // ------------------------------------------------------
  // POST /auth/refresh
  // ------------------------------------------------------
  refresh: async (req: Request, res: Response) => {
    const token = req.cookies.refresh_token;

    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const result = await verifyRefreshToken(token);

    if (!result) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = result;

    // Issue a new refresh token cookie
    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ accessToken });
  },
};
