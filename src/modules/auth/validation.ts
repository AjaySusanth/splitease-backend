import { z } from "zod";

// ---------------------------------------------
// REGISTER SCHEMA
// ---------------------------------------------
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name cannot exceed 50 characters.")
    .trim(),

  email: z
    .string()
    .email("Invalid email format.")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password cannot exceed 100 characters."),

  confirmPassword: z.string(),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});


// ---------------------------------------------
// LOGIN SCHEMA
// ---------------------------------------------
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format.")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password is required."),
});

export type AuthRegisterInput = z.infer<typeof registerSchema>;
export type AuthLoginInput = z.infer<typeof loginSchema>;
