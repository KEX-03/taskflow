const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { signup, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { asyncHandler } = require("../utils/errorHandler");

// Limit login and signup attempts to slow down password guessing:
// at most 10 requests per 15 minutes from the same IP address.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

router.post("/signup", authLimiter, asyncHandler(signup));
router.post("/login", authLimiter, asyncHandler(login));
router.post("/logout", protect, asyncHandler(logout));

module.exports = router;
