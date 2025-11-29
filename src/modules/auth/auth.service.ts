import { db } from "../../db/index.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";

import { hashPassword, verifyPassword } from "../../utlis/crypto.js";
import { signAccessToken, signRefreshToken } from "../../utlis/jwt.js";
import { AuthRegisterInput, AuthLoginInput } from "./validation";

import jwt from "jsonwebtoken";
// ---------------------------
//  REGISTER
// ---------------------------
export async function register(input: AuthRegisterInput) {
  const { name, email, password } = input;

  // Check if user already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("User already exists with this email.");
  }

  // Hash password
  const hashed = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashed,
    })
    .returning();

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
}

// ---------------------------
//  LOGIN
// ---------------------------
export async function login(input: AuthLoginInput) {
  const { email, password } = input;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const valid = await verifyPassword(user.password, password);

  if (!valid) {
    throw new Error("Invalid email or password.");
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  return { user, accessToken, refreshToken };
}

// ---------------------------
//  LOGOUT
// ---------------------------
export async function logout() {
  // With JWT-based auth, logout is handled by:
  // - clearing httpOnly cookies on frontend OR
  // - storing refresh token blacklist (optional)
  return { message: "Logged out" };
}

// ---------------------------
//  GET ME
// ---------------------------
export async function getMe(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}

// ---------------------------
//  VERIFY ACCESS TOKEN
// ---------------------------
export function verifyAccessToken(token: string) {
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };

    return payload.userId;
  } catch (err) {
    return null;
  }
}

// ---------------------------
//  VERIFY REFRESH TOKEN
// ---------------------------
export function verifyRefreshToken(token: string) {
  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
      userId: string;
    };

    // Issue new tokens
    const accessToken = signAccessToken({ userId: payload.userId });
    const refreshToken = signRefreshToken({ userId: payload.userId });

    return { accessToken, refreshToken };
  } catch (err) {
    return null;
  }
}
