import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters long")
    .max(50, "Group name cannot exceed 50 characters"),
});

export const addGroupMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["member", "admin"]).default("member"),
});

export const removeGroupMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type AddGroupMemberInput = z.infer<typeof addGroupMemberSchema>;
export type RemoveGroupMemberInput = z.infer<typeof removeGroupMemberSchema>;
