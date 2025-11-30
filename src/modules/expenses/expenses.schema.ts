import { z } from "zod";

// ---------------------------------------------
// CREATE EXPENSE
// ---------------------------------------------
export const createExpenseSchema = z.object({
  description: z.string().trim().optional(),

  amount: z.number().positive(),

  // `paidBy` is set by the server from the authenticated user; make optional for client payloads
  paidBy: z.string().uuid("Invalid UUID").optional(),

  /**
   * Example:
   * splits: [
   *   { userId: "...", amount: 250 },
   *   { userId: "...", amount: 250 },
   * ]
   */
  splits: z
    .array(
      z.object({
        userId: z.string().uuid("Invalid UUID"),
        amount: z.number().positive(),
      })
    )
    .min(1, "At least one split entry is required"),
});

// Ensure total split == expense amount
export const validatedExpenseSchema = createExpenseSchema.superRefine(
  (data, ctx) => {
    const totalSplit = data.splits.reduce((sum, s) => sum + s.amount, 0);

    if (Math.abs(totalSplit - data.amount) > 0.01) {
      ctx.addIssue({
        code: "custom",
        message: `Split total (${totalSplit}) must equal expense amount (${data.amount})`,
        path: ["splits"],
      });
    }
  }
);

// ---------------------------------------------
// TYPE EXPORTS
// ---------------------------------------------
export type CreateExpenseInput = z.infer<typeof validatedExpenseSchema>;

export const expenseIdSchema = z.object({
  expenseId: z.string().uuid("Invalid expense ID"),
});
