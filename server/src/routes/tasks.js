const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");
const { asyncHandler } = require("../utils/errorHandler");

router.post("/", protect, asyncHandler(createTask));
router.get("/", protect, asyncHandler(getTasks));
router.get("/:id", protect, asyncHandler(getTask));
router.put("/:id", protect, asyncHandler(updateTask));
router.delete("/:id", protect, asyncHandler(deleteTask));

module.exports = router;
