import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

export const getMe = async (id: string) => {
  const user = await db.select().from(users).where(eq(users.id, id));

  if (user.length === 0) {
    throw new Error("User not found");
  }

  return user[0];
};
