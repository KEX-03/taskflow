const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const taskRoutes = require("./routes/tasks");
const { errorHandler } = require("./utils/errorHandler");

// ── Required environment variables ───────────
const missingEnv = ["MONGO_URI", "JWT_SECRET"].filter((name) => !process.env[name]);
if (missingEnv.length) {
  console.error(`❌  Missing required environment variable(s): ${missingEnv.join(", ")}`);
  console.error("    Copy server/.env.example to server/.env and fill them in.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Hosts like Render put a proxy in front of the server, so every request
// would seem to come from the proxy's IP. Trusting the first proxy lets
// Express read the visitor's real IP from the X-Forwarded-For header,
// which the login/signup rate limit relies on.
app.set("trust proxy", 1);


// Logging ──────────────────────────────────
// Keep dev logs unchanged; use compact production logs and skip health checks.
const isProduction = process.env.NODE_ENV === "production";

app.use(
  morgan(isProduction ? "tiny" : "dev", {
    skip: (req) =>
      isProduction && req.path === "/api/v1/health",
  })
);

// ── CORS ─────────────────────────────────────
// FRONTEND_ORIGIN can list several origins separated by commas,
// e.g. "http://localhost:3000,https://my-app.vercel.app".
// Browsers send the origin without a trailing slash, so strip any.
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
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
  const server = app.listen(PORT, () => {
    console.log(`\n✅  Server running on http://localhost:${PORT}`);
    console.log(`📂  API base: http://localhost:${PORT}/api/v1\n`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌  Port ${PORT} is already in use. Stop the other process or set a different PORT.`);
    } else {
      console.error("❌  Server error:", err.message);
    }
    process.exit(1);
  });
});

module.exports = app;
