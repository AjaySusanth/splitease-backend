import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../auth/auth.db";
import { groups } from "../groups/groups.db";

// --------------------------------------------------
// EXPENSES TABLE
// --------------------------------------------------
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),

  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  paidBy: uuid("paid_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  description: text("description"),

  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// --------------------------------------------------
// EXPENSES RELATIONS
// --------------------------------------------------
export const expensesRelations = relations(expenses, ({ one, many }) => ({
  // Relation for `with: { splits: true }` in your service
  splits: many(expenseSplits),

  // Relation to the group the expense belongs to
  group: one(groups, {
    fields: [expenses.groupId],
    references: [groups.id],
  }),

  // Relation to the user who paid
  paidByUser: one(users, {
    fields: [expenses.paidBy],
    references: [users.id],
  }),
}));

// --------------------------------------------------
// EXPENSE SPLITS TABLE
// --------------------------------------------------
export const expenseSplits = pgTable(
  "expense_splits",
  {
    expenseId: uuid("expense_id")
      .notNull()
      .references(() => expenses.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    pk: primaryKey(table.expenseId, table.userId),
  })
);

// --------------------------------------------------
// EXPENSE SPLITS RELATIONS
// --------------------------------------------------
export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  // Relation for `with: { expense: true }` in your service
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),

  // Relation to the user who owes/pays this split
  user: one(users, {
    fields: [expenseSplits.userId],
    references: [users.id],
  }),
}));