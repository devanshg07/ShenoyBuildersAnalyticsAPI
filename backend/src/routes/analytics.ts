import { Router } from "express";
import { getVisitorCount } from "../services/vercel.js";

const router = Router();

router.get("/visitors", async (_req, res) => {
  try {
    const visitors = await getVisitorCount();

    res.json({
      visitors,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch analytics",
    });
  }
});

export default router;