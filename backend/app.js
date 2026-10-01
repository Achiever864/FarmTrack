import "dotenv/config";
import express from "express";
import cors from "cors";
import ndviRoutes from "./routes/ndvi.routes.js";
import authRoutes from "./routes/auth.routes.js";
import farmRoutes from "./routes/farm.routes.js";
import orgRoutes from "./routes/org.routes.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "FarmTrack API", timestamp: new Date() });
});

// Routes
app.use("/auth", authRoutes);
app.use("/farms", farmRoutes);
app.use("/orgs", orgRoutes);
app.use("/ndvi", ndviRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[Error Handler]", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

export default app;