import "dotenv/config";
import express from "express";
import cors from "cors";
import analyticsRouter from "./routes/analytics.js";

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

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});