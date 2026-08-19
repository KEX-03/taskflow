const User = require("../models/User");
const { generateToken } = require("../utils/token");

// ── POST /api/v1/auth/signup ─────────────────
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // ── Manual validation ────────────────────
  const errors = [];
  if (!name || name.trim().length < 2)
    errors.push("Name must be at least 2 characters.");
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.push("Provide a valid email.");
  if (!password || password.length < 6)
    errors.push("Password must be at least 6 characters.");
  if (password && !/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter.");
  if (password && !/[0-9]/.test(password))
    errors.push("Password must contain at least one number.");

  if (errors.length) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }

  // ── Check duplicate email ────────────────
  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: "An account with this email already exists.",
    });
  }

  // ── Create user (password hashed in pre-save hook) ──
  const user = await User.create({ name: name.trim(), email, password });
  const token = generateToken(user._id);

  res.status(201).json({ success: true, token, user });
};

// ── POST /api/v1/auth/login ──────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }

  const token = generateToken(user._id);
  res.json({ success: true, token, user });
};

// ── POST /api/v1/auth/logout ─────────────────
// Stateless JWT — logout is handled client-side (token deletion).
// This endpoint exists so the frontend has a clean call.
const logout = async (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
};

module.exports = { signup, login, logout };
