const express = require("express");
const router = express.Router();
const { signup, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { asyncHandler } = require("../utils/errorHandler");

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
router.post("/logout", protect, asyncHandler(logout));

module.exports = router;
