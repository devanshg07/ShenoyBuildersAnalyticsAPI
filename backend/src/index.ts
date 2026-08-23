import "dotenv/config";
import express from "express";
import cors from "cors";
import analyticsRouter from "./routes/analytics.js";
import { savePreviousMonth } from "./jobs/monthlyAnalytics.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "ShenoyBuilders Analytics API",
    status: "running",
  });
});

app.use("/analytics", analyticsRouter);

// Prevent the monthly job from running multiple times
// during the same month while the server stays alive.
let monthlyAnalyticsRan = false;

async function checkMonthlyAnalytics() {
  const now = new Date();

  // Reset the guard when we're no longer on the first day
  if (now.getUTCDate() !== 1) {
    monthlyAnalyticsRan = false;
    return;
  }

  // Already ran this month
  if (monthlyAnalyticsRan) {
    return;
  }

  console.log(
    "First day of the month detected. Running monthly analytics..."
  );

  try {
    await savePreviousMonth();

    monthlyAnalyticsRan = true;

    console.log("Monthly analytics completed successfully.");
  } catch (error) {
    console.error(
      "Monthly analytics failed:",
      error
    );
  }
}

// Check immediately when the server starts
checkMonthlyAnalytics();

// Check every hour
setInterval(
  checkMonthlyAnalytics,
  60 * 60 * 1000
);

app.listen(PORT, () => {
  console.log(
    `API running on http://localhost:${PORT}`
  );
});