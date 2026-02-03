const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");
const { asyncHandler } = require("../utils/errorHandler");

router.get("/", protect, asyncHandler(getProfile));
router.put("/", protect, asyncHandler(updateProfile));

module.exports = router;
