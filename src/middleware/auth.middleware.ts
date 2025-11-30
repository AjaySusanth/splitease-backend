import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/auth.service.js";
import { db } from "../db/index.js";
import { users } from "../modules/auth/auth.db.js";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // --- 1. Extract Bearer token ---
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "Missing access token." });
    }

    // --- 2. Verify token ---
    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    // --- 3. Load user from DB ---
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, payload))
      .limit(1);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // --- 4. Attach to req.user ---
    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized." });
  }
}
