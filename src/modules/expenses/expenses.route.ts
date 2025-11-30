import { Router } from "express";
import { expenseController } from "./expenses.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router({ mergeParams: true });

// All routes require the user to be authenticated
router.use(authMiddleware);

// -------------------------------------------------------
// CREATE EXPENSE
// POST /groups/:groupId/expenses
// -------------------------------------------------------
router.post("/", expenseController.create);

// -------------------------------------------------------
// GET ALL EXPENSES FOR A GROUP
// GET /groups/:groupId/expenses
// -------------------------------------------------------
router.get("/", expenseController.getGroupExpenses);

// -------------------------------------------------------
// GET ONE EXPENSE
// GET /groups/:groupId/expenses/:expenseId
// -------------------------------------------------------
router.get("/:expenseId", expenseController.getOne);

// -------------------------------------------------------
// DELETE EXPENSE
// DELETE /groups/:groupId/expenses/:expenseId
// -------------------------------------------------------
router.delete("/:expenseId", expenseController.delete);

export default router;
