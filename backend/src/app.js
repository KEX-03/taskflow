const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const taskRoutes = require("./routes/tasks");
const { errorHandler } = require("./utils/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Logging ──────────────────────────────────
app.use(morgan("dev"));

// ── CORS ─────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// ── Body Parser ──────────────────────────────
app.use(express.json());

// ── Health Check ─────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ───────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/me", profileRoutes);
app.use("/api/v1/tasks", taskRoutes);

// ── 404 Handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ── Global Error Handler ─────────────────────
app.use(errorHandler);

// ── DB Connect & Server Start ────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n✅  Server running on http://localhost:${PORT}`);
    console.log(`📂  API base: http://localhost:${PORT}/api/v1\n`);
  });
});

module.exports = app;
