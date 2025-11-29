import argon2 from "argon2";

/**
 * Hash a plaintext password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  if (typeof password !== "string") {
    throw new Error("Password must be a string.");
  }

  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456, // ~19MB — strong but safe for servers
    timeCost: 2,       // number of iterations
    parallelism: 1,    // typical for web auth workloads
  });
}

/**
 * Compare a plaintext password with a stored Argon2 hash.
 */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  if (typeof password !== "string" || typeof hash !== "string") {
    throw new Error("Invalid arguments: hash and password must be strings.");
  }

  try {
    return await argon2.verify(hash, password);
  } catch {
    return false; // on hash corruption, mismatches, or tampering
  }
}
