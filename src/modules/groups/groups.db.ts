import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../auth/auth.db"; // import without extension for drizzle-kit (CJS/TS) compatibility
import { expenses } from "../expenses/expenses.db";

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// -------------------------
// Groups Relations
// -------------------------
export const groupsRelations = relations(groups, ({ one, many }) => ({
  // This relation 'members' is what fixes the 'getGroup' error
  members: many(groupMembers),

  // Relation to the user who owns the group
  owner: one(users, {
    fields: [groups.ownerId],
    references: [users.id],
  }),

  expenses: many(expenses),
}));

export const groupMembers = pgTable(
  "group_members",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id),

    role: varchar("role", { length: 50 }).default("member").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.groupId),
  })
);

// -------------------------
// Group Members Relations
// -------------------------
export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  // Relation to the actual group
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),

  // Relation to the actual user
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));