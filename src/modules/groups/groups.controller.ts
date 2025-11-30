import { Request, Response } from "express";
import { groupsService } from "./groups.service";
import { createGroupSchema, addGroupMemberSchema } from "./groups.schema";

export const groupsController = {
  // -------------------------------------------------------
  // POST /groups  (Create group)
  // -------------------------------------------------------
  async createGroup(req: Request, res: Response) {
    try {
      const user = req.user; // set by auth middleware
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const body = createGroupSchema.parse(req.body);

      const group = await groupsService.createGroup(user.id, body);

      return res.status(201).json({
        message: "Group created successfully",
        group,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  // -------------------------------------------------------
  // POST /groups/:groupId/members  (Add member)
  // Admin only
  // -------------------------------------------------------
  async addMember(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { groupId } = req.params;

      const isAdmin = await groupsService.isAdmin(groupId, user.id);
      if (!isAdmin) {
        return res.status(403).json({ error: "Only admins can add members" });
      }

      const body = addGroupMemberSchema.parse(req.body);

      const result = await groupsService.addMember(groupId, body);

      return res.status(200).json({
        message: "Member added successfully",
        result,
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  // -------------------------------------------------------
  // DELETE /groups/:groupId/members/:userId  (Remove member)
  // Admin only
  // -------------------------------------------------------
  async removeMember(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { groupId, userId } = req.params;

      const isAdmin = await groupsService.isAdmin(groupId, user.id);
      if (!isAdmin) {
        return res
          .status(403)
          .json({ error: "Only admins can remove members" });
      }

      await groupsService.removeMember(groupId, userId);

      return res.status(200).json({
        message: "Member removed successfully",
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },

  // -------------------------------------------------------
  // GET /groups/:groupId  (Group details)
  // Only members can view
  // -------------------------------------------------------
  async getGroup(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { groupId } = req.params;

      const isMember = await groupsService.isMember(groupId, user.id);
      if (!isMember) {
        return res
          .status(403)
          .json({ error: "You are not a member of this group" });
      }

      const group = await groupsService.getGroup(groupId);

      return res.status(200).json(group);
    } catch (err: any) {
      // When Drizzle/DB returns unexpected errors, normalize message
      const message = err instanceof Error ? err.message : String(err);
      return res.status(400).json({ error: message });
    }
  },

  // -------------------------------------------------------
  // GET /groups  (List all groups for logged-in user)
  // -------------------------------------------------------
  async getMyGroups(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const groups = await groupsService.getUserGroups(user.id);

      if (!groups || groups.length === 0) {
        return res.status(200).json({ message: "No groups found" });
      }

      return res.status(200).json(groups);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  },
};
