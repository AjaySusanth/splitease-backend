import { Router } from "express";
import { db } from "../db/index";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/health/db", async (_req, res) => {
  try {
    // Minimal, safe DB ping
    await db.execute(sql`SELECT 1`);

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "unreachable",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default router;
