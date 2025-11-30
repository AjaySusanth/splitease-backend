import { db } from "../../db/index.js";
import { expenses, expenseSplits } from "./expenses.db";
import { groupMembers } from "../groups/groups.db";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";
import { CreateExpenseInput } from "./expenses.schema";

export const expensesService = {
  // ------------------------------------------------------------
  // VERIFY USER IS MEMBER OF THE GROUP
  // ------------------------------------------------------------
  async assertMember(userId: string, groupId: string) {
    const member = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.userId, userId),
        eq(groupMembers.groupId, groupId)
      ),
    });

    if (!member) {
      throw new Error("User is not a member of this group");
    }
  },

  // ------------------------------------------------------------
  // CREATE EXPENSE
  // ------------------------------------------------------------
  async createExpense(groupId: string, data: CreateExpenseInput) {
    // Ensure `paidBy` was provided by the caller (controller sets this from req.user)
    const paidBy = data.paidBy;
    if (!paidBy) {
      throw new Error("Missing payer (paidBy) for expense");
    }

    // 1. Verify `paidBy` is a group member
    await this.assertMember(paidBy, groupId);

    // 2. Verify all split users are members
    for (const split of data.splits) {
      await this.assertMember(split.userId, groupId);
    }

    // 3. Insert the expense (let DB generate UUID) and return the generated id
    const inserted = await db
      .insert(expenses)
      .values({
        groupId,
        paidBy: paidBy,
        description: data.description ?? null,
        // Drizzle maps Postgres `numeric` to string in TS types — convert
        amount: data.amount.toString(),
      })
      .returning({ id: expenses.id });

    const id = inserted[0].id as string;

    // 4. Insert the splits (convert amounts to string for numeric columns)
    for (const split of data.splits) {
      await db.insert(expenseSplits).values({
        expenseId: id,
        userId: split.userId,
        amount: split.amount.toString(),
      });
    }

    return { id };
  },

  // ------------------------------------------------------------
  // GET SINGLE EXPENSE (WITH SPLITS)
  // ------------------------------------------------------------
  async getExpense(expenseId: string) {
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, expenseId),
      with: {
        splits: true,
      },
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    return expense;
  },

  // ------------------------------------------------------------
  // GET ALL EXPENSES IN A GROUP
  // ------------------------------------------------------------
  async getGroupExpenses(groupId: string) {
    return await db.query.expenses.findMany({
      where: eq(expenses.groupId, groupId),
      with: {
        splits: true,
      },
      orderBy: (t) => t.createdAt,
    });
  },

  // ------------------------------------------------------------
  // DELETE EXPENSE
  // ------------------------------------------------------------
  async deleteExpense(expenseId: string, userId: string) {
    // Fetch the expense to validate permissions
    const expense = await db.query.expenses.findFirst({
      where: eq(expenses.id, expenseId),
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    // Only payer can delete OR group admin.
    // You have no admin check here (it exists in groupsService),
    // so we follow ONLY what is known: restrict delete to payer.

    if (expense.paidBy !== userId) {
      throw new Error("Only the person who paid can delete this expense");
    }

    await db.delete(expenses).where(eq(expenses.id, expenseId));

    return { success: true };
  },

  // ------------------------------------------------------------
  // GET ALL EXPENSES FOR A USER ACROSS GROUPS
  // ------------------------------------------------------------
  async getUserExpenses(userId: string) {
    return await db.query.expenseSplits.findMany({
      where: eq(expenseSplits.userId, userId),
      with: {
        expense: true,
      },
    });
  },
};
