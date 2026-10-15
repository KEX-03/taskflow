const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { signup, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { asyncHandler } = require("../utils/errorHandler");

// Rate limits to slow down password guessing and mass sign-ups.
// Each limiter keeps its own count per IP address for 15 minutes.
const sharedOptions = {
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
};

// Login: only failed attempts count, so people sharing one IP (an office,
// a school, a mobile network) can't lock each other out by logging in normally.
const loginLimiter = rateLimit({ ...sharedOptions, skipSuccessfulRequests: true });

// Signup: every request counts, so one IP can't create unlimited accounts.
const signupLimiter = rateLimit({ ...sharedOptions });

router.post("/signup", signupLimiter, asyncHandler(signup));
router.post("/login", loginLimiter, asyncHandler(login));
router.post("/logout", protect, asyncHandler(logout));

module.exports = router;
