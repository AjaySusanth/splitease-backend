import { db } from "../../db/index.js";
import { groups, groupMembers } from "./groups.db";
import { users } from "../auth/auth.db";
import { eq, and } from "drizzle-orm";
import { CreateGroupInput, AddGroupMemberInput } from "./groups.schema";
import crypto from "crypto";

export const groupsService = {
  // ---------------------------------------------
  // CREATE GROUP
  // ---------------------------------------------
  async createGroup(ownerId: string, data: CreateGroupInput) {
    const id = crypto.randomUUID();

    await db.insert(groups).values({
      id,
      name: data.name,
      ownerId,
    });

    // Add owner as admin
    await db.insert(groupMembers).values({
      userId: ownerId,
      groupId: id,
      role: "admin",
    });

    return { id, name: data.name };
  },

  // ---------------------------------------------
  // ADD MEMBER
  // ---------------------------------------------
  async addMember(groupId: string, data: AddGroupMemberInput) {
    // ensure the user exists
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, data.userId),
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    const existing = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, data.userId)
      ),
    });

    if (existing) {
      throw new Error("User is already a member of this group");
    }

    await db.insert(groupMembers).values({
      userId: data.userId,
      groupId,
      role: data.role ?? "member",
    });

    return { success: true };
  },

  // ---------------------------------------------
  // REMOVE MEMBER
  // ---------------------------------------------
  async removeMember(groupId: string, userId: string) {
    // check membership exists
    const membership = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    if (!membership) {
      throw new Error("User is not a member of this group");
    }

    await db
      .delete(groupMembers)
      .where(
        and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
      );

    return { success: true };
  },

  // ---------------------------------------------
  // GET GROUP DETAILS
  // ---------------------------------------------
  async getGroup(groupId: string) {
    const group = await db.query.groups.findFirst({
      where: eq(groups.id, groupId),
      with: {
        members: true,
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    return group;
  },

  // ---------------------------------------------
  // GET GROUPS FOR A USER
  // ---------------------------------------------
  async getUserGroups(userId: string) {
    return await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, userId),
      with: {
        group: true,
      },
    });
  },

  // ---------------------------------------------
  // CHECK IF USER IS MEMBER
  // ---------------------------------------------
  async isMember(groupId: string, userId: string) {
    const member = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    return !!member;
  },

  // ---------------------------------------------
  // CHECK IF USER IS ADMIN
  // ---------------------------------------------
  async isAdmin(groupId: string, userId: string) {
    const member = await db.query.groupMembers.findFirst({
      where: and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ),
    });

    return member?.role === "admin";
  },
};
