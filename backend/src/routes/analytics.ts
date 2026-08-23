import { Router } from "express";
import { getVisitorCount } from "../services/vercel.js";
import {
  testSupabase,
  getMonthlyAnalytics,
} from "../services/supabase.js";

const router = Router();

router.get("/visitors", async (_req, res) => {
  const start = performance.now();

  try {
    const analytics = await getVisitorCount();

    const duration = performance.now() - start;

    console.log(
      `GET /analytics/visitors - ${duration.toFixed(2)}ms`
    );

    res.json({
      visitors: analytics.data.visitors,
      pageviews: analytics.data.pageviews,
      responseTimeMs: Number(duration.toFixed(2)),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch analytics",
    });
  }
});

router.get("/monthly", async (_req, res) => {
  try {
    const data = await getMonthlyAnalytics();

    res.json({
      data,
    });
  } catch (error) {
    console.error("SUPABASE ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch monthly analytics",
    });
  }
});

router.get("/supabase-test", async (_req, res) => {
  try {
    const data = await testSupabase();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("SUPABASE ERROR:", error);

    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});

export default router;