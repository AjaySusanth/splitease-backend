import { Router } from "express";
import { groupsController } from "./groups.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

// ---------------------------------------------------------
// Group creation
// POST /groups
// ---------------------------------------------------------
router.post("/", authMiddleware, groupsController.createGroup);

// ---------------------------------------------------------
// Add member (Admin only)
// POST /groups/:groupId/members
// ---------------------------------------------------------
router.post("/:groupId/members", authMiddleware, groupsController.addMember);

// ---------------------------------------------------------
// Remove member (Admin only)
// DELETE /groups/:groupId/members/:userId
// ---------------------------------------------------------
router.delete(
  "/:groupId/members/:userId",
  authMiddleware,
  groupsController.removeMember
);

// ---------------------------------------------------------
// Get specific group details (Members only)
// GET /groups/:groupId
// ---------------------------------------------------------
router.get("/:groupId", authMiddleware, groupsController.getGroup);

// ---------------------------------------------------------
// Get all my groups
// GET /groups
// ---------------------------------------------------------
router.get("/", authMiddleware, groupsController.getMyGroups);

export default router;
