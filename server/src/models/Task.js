const mongoose = require("mongoose");

const PRIORITIES = ["low", "medium", "high"];
const STATUSES = ["todo", "in-progress", "done"];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title can be at most 200 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [1000, "Description can be at most 1000 characters"],
    },
    priority: {
      type: String,
      enum: { values: PRIORITIES, message: "Invalid priority" },
      default: "medium",
    },
    status: {
      type: String,
      enum: { values: STATUSES, message: "Invalid status" },
      default: "todo",
    },
    // Lowercase, unique, at most 5 of 1-20 characters (checked by utils/tags.js)
    tags: {
      type: [String],
      default: [],
    },
    dueDate: {
  type: Date,
  default: null,
},
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ── Index for fast per-user queries ──────────
taskSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Task", taskSchema);
// Shared enum values, e.g. for validating query params in controllers
module.exports.PRIORITIES = PRIORITIES;
module.exports.STATUSES = STATUSES;
