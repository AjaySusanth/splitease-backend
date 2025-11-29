import { Request, Response, NextFunction } from "express";
import { verifyToken } from "./utils/jwt";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = decoded;
  next();
};
