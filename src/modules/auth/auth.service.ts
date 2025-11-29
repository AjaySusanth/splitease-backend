import { db } from "../../db";
import { users } from "../../db/schema";
import { signupSchema, loginSchema } from "./auth.validation";
import bcrypt from "bcrypt";
import { generateToken } from "./utils/jwt";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const signup = async (data: z.infer<typeof signupSchema>) => {
  const { name, email, password } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
    })
    .returning();

  const token = generateToken({ id: newUser[0].id });

  return { token, user: newUser[0] };
};

export const login = async (data: z.infer<typeof loginSchema>) => {
  const { email, password } = data;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user[0].password);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({ id: user[0].id });

  return { token, user: user[0] };
};
