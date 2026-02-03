const Task = require("../models/Task");

// ── POST /api/v1/tasks ───────────────────────
const createTask = async (req, res) => {
  const { title, description, priority, status } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: "Title is required." });
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || "",
    priority: priority || "medium",
    status: status || "todo",
    owner: req.user._id,
  });

  res.status(201).json({ success: true, task });
};

// ── GET /api/v1/tasks ────────────────────────
// Supports: ?search=, ?priority=, ?status=, ?page=, ?limit=
const getTasks = async (req, res) => {
  const { search, priority, status, page = 1, limit = 20 } = req.query;

  const filter = { owner: req.user._id };

  if (search) {
    filter.title = { $regex: search.trim(), $options: "i" };
  }
  if (priority && ["low", "medium", "high"].includes(priority)) {
    filter.priority = priority;
  }
  if (status && ["todo", "in-progress", "done"].includes(status)) {
    filter.status = status;
  }

  const p = Math.max(1, parseInt(page));
  const l = Math.min(50, Math.max(1, parseInt(limit)));

  const total = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .skip((p - 1) * l)
    .limit(l);

  res.json({
    success: true,
    tasks,
    meta: { total, page: p, limit: l, pages: Math.ceil(total / l) },
  });
};

// ── GET /api/v1/tasks/:id ────────────────────
const getTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found." });
  }
  res.json({ success: true, task });
};

// ── PUT /api/v1/tasks/:id ────────────────────
const updateTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found." });
  }

  const { title, description, priority, status } = req.body;

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ success: false, message: "Title cannot be empty." });
    }
    task.title = title.trim();
  }
  if (description !== undefined) task.description = description.trim();
  if (priority !== undefined) {
    if (!["low", "medium", "high"].includes(priority))
      return res.status(400).json({ success: false, message: "Invalid priority." });
    task.priority = priority;
  }
  if (status !== undefined) {
    if (!["todo", "in-progress", "done"].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status." });
    task.status = status;
  }

  await task.save();
  res.json({ success: true, task });
};

// ── DELETE /api/v1/tasks/:id ─────────────────
const deleteTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: "Task not found." });
  }
  await task.deleteOne();
  res.json({ success: true, message: "Task deleted." });
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
