import { Request, Response } from "express";
import { signup, login } from "./auth.service";
import { signupSchema, loginSchema } from "./auth.validation";
import { omitPassword } from "../users/utils/user.utils";

import { ZodError } from "zod";

export const signupController = async (req: Request, res: Response) => {
  try {
    const data = signupSchema.parse(req.body);
    const { token, user } = await signup(data);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ user: omitPassword(user) });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: err.errors });
    }
    if (err instanceof Error && err.message === "User already exists") {
      return res.status(409).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const { token, user } = await login(data);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ user: omitPassword(user) });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: err.errors });
    }
    if (err instanceof Error && err.message === "Invalid credentials") {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
