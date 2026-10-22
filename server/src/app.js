
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const taskRoutes = require("./routes/tasks");
const { errorHandler } = require("./utils/errorHandler");

const app = express();

// Trust the first proxy so Express can read the visitor's real IP.
app.set("trust proxy", 1);

// Logging: use compact logs in production and skip health checks.
const isProduction = process.env.NODE_ENV === "production";

app.use(
  morgan(isProduction ? "tiny" : "dev", {
    skip: (req) =>
      process.env.NODE_ENV === "test" ||
      (isProduction && req.path === "/api/v1/health"),
  })
);

// CORS
const allowedOrigins = (
  process.env.FRONTEND_ORIGIN || "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body Parser
app.use(express.json());

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/me", profileRoutes);
app.use("/api/v1/tasks", taskRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
