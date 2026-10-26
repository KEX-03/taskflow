require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { parseAllowedOrigins } = require("./utils/cors");

// ── Required environment variables ───────────
const missingEnv = ["MONGO_URI", "JWT_SECRET"].filter((name) => !process.env[name]);
if (missingEnv.length) {
  console.error(`❌  Missing required environment variable(s): ${missingEnv.join(", ")}`);
  console.error("    Copy server/.env.example to server/.env and fill them in.");
  process.exit(1);
}

const corsCheck = parseAllowedOrigins(process.env.FRONTEND_ORIGIN, process.env.FRONTEND_ORIGIN_PATTERN);
if (corsCheck.error) {
  console.error(`❌  ${corsCheck.error}`);
  console.error("    See FRONTEND_ORIGIN_PATTERN in server/.env.example.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

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
