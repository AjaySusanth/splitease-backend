import { Request, Response } from "express";
import { validatedExpenseSchema, expenseIdSchema } from "./expenses.schema";
import { expensesService } from "./expenses.service";

export const expenseController = {
  // ---------------------------------------------------------
  // CREATE EXPENSE
  // ---------------------------------------------------------
  create: async (req: Request, res: Response) => {
    const groupId = req.params.groupId;
    const userId = req.user!.id; // from auth middleware

    const parsed = validatedExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    try {
      const expense = await expensesService.createExpense(groupId, {
        ...parsed.data,
        // enforce the actual payer from the authenticated user
        paidBy: userId,
      });

      return res.status(201).json({ message: "Expense added", expense });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------
  // GET ALL EXPENSES FOR GROUP
  // ---------------------------------------------------------
  getGroupExpenses: async (req: Request, res: Response) => {
    const groupId = req.params.groupId;

    try {
      const expenses = await expensesService.getGroupExpenses(groupId);
      return res.json(expenses);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------
  // GET SINGLE EXPENSE
  // ---------------------------------------------------------
  getOne: async (req: Request, res: Response) => {
    const parsed = expenseIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    try {
      const expense = await expensesService.getExpense(parsed.data.expenseId);
      return res.json(expense);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  },

  // ---------------------------------------------------------
  // DELETE EXPENSE
  // ---------------------------------------------------------
  delete: async (req: Request, res: Response) => {
    const parsed = expenseIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    try {
      const userId = req.user!.id;
      await expensesService.deleteExpense(parsed.data.expenseId, userId);
      return res.json({ message: "Expense deleted" });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  },
};
