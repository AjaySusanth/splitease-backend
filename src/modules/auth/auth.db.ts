// src/modules/auth/auth.db.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// -------------------------
// Users Table
// -------------------------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),

  // Store hashed password only (BCrypt)
  password: text("password").notNull(),

  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

// -------------------------
// Refresh Tokens Table
// -------------------------
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  /**
   * Store hashed refresh tokens only.
   * DB leak must NOT reveal real tokens.
   */
  tokenHash: text("token_hash").notNull(),

  expiresAt: timestamp("expires_at", { withTimezone: false }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
