import jwt from "jsonwebtoken";

function getSecrets() {
  const access = process.env.ACCESS_TOKEN_SECRET;
  const refresh = process.env.REFRESH_TOKEN_SECRET;

  if (!access || !refresh) {
    throw new Error("JWT secrets are not defined in environment variables.");
  }

  return { access, refresh };
}

/**
 * Generate a short-lived access token.
 * Contains minimal identifying info.
 */
export function signAccessToken(payload: { userId: string }) {
  const { access } = getSecrets();
  return jwt.sign(payload, access, {
    algorithm: "HS256",
    expiresIn: "15m",
  });
}

/**
 * Generate a long-lived refresh token.
 * Should only be stored securely (httpOnly cookie).
 */
export function signRefreshToken(payload: { userId: string }) {
  const { refresh } = getSecrets();
  return jwt.sign(payload, refresh, {
    algorithm: "HS256",
    expiresIn: "7d",
  });
}

/**
 * Verify an access token and return its payload or null.
 */
export function verifyToken(token: string) {
  try {
    const { access } = getSecrets();
    return jwt.verify(token, access) as { userId: string };
  } catch {
    return null;
  }
}
