import { Request, Response } from "express";
import { getMe } from "./user.service";
import { omitPassword } from "./utils/user.utils";

export const getMeController = async (req: Request, res: Response) => {
  try {
    if (!req.user || typeof req.user === "string" || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await getMe(req.user.id);
    res.status(200).json({ user: omitPassword(user) });
  } catch (err) {
    res.status(404).json({ message: err instanceof Error ? err.message : "User not found" });
  }
};
