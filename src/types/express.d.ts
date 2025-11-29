import type { Request as ExpressRequest } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export {};
