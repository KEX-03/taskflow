const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const taskRoutes = require("./routes/tasks");
const { errorHandler } = require("./utils/errorHandler");
const { parseAllowedOrigins } = require("./utils/cors");

const app = express();

// Hosts like Render put a proxy in front of the server, so every request
// would seem to come from the proxy's IP. Trusting the first proxy lets
// Express read the visitor's real IP from the X-Forwarded-For header,
// which the login/signup rate limit relies on.
app.set("trust proxy", 1);


// Logging ──────────────────────────────────
// Keep dev logs unchanged; use compact production logs and skip health checks.
// Tests run with NODE_ENV=test and skip logging entirely.
const isProduction = process.env.NODE_ENV === "production";

app.use(
  morgan(isProduction ? "tiny" : "dev", {
    skip: (req) =>
      process.env.NODE_ENV === "test" ||
      (isProduction && req.path === "/api/v1/health"),
  })
);

// ── CORS ─────────────────────────────────────
// FRONTEND_ORIGIN can list several origins separated by commas,
// e.g. "http://localhost:3000,https://my-app.vercel.app", and
// FRONTEND_ORIGIN_PATTERN can add a pattern for Vercel preview URLs.
// server.js stops with an error if the pattern is unsafe; if it gets here
// anyway, no other origin is allowed rather than every one.
const corsOrigins = parseAllowedOrigins(
  process.env.FRONTEND_ORIGIN,
  process.env.FRONTEND_ORIGIN_PATTERN
);

app.use(
  cors({
    origin: corsOrigins.origins || [],
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

module.exports = app;
