const mongoose = require("mongoose");
const Task = require("../models/Task");
const { PRIORITIES, STATUSES } = Task;
const { getQueryString, escapeRegex, parsePositiveInt } = require("../utils/query");
const { normalizeTags } = require("../utils/tags");

const MAX_SEARCH_LENGTH = 100;

// Reusable helper to validate task IDs
const isInvalidTaskId = (id) => !mongoose.isValidObjectId(id);

// Reusable 404 response for missing tasks
const sendTaskNotFound = (res) =>
  res.status(404).json({
    success: false,
    message: "Task not found.",
  });

// ── POST /api/v1/tasks ───────────────────────
const createTask = async (req, res) => {
  const { title, description, priority, status, tags } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: "Title is required." });
  }
  const tagResult = tags === undefined ? { tags: [] } : normalizeTags(tags);
  if (tagResult.error) {
    return res.status(400).json({ success: false, message: tagResult.error });
  }

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim() || "",
    priority: priority || "medium",
    status: status || "todo",
    tags: tagResult.tags,
    owner: req.user._id,
  });

  res.status(201).json({ success: true, task });
};

// ── GET /api/v1/tasks ────────────────────────
// Supports: ?search=, ?priority=, ?status=, ?tag=, ?page=, ?limit=
const getTasks = async (req, res) => {
  const search = getQueryString(req.query.search);
  const priority = getQueryString(req.query.priority);
  const status = getQueryString(req.query.status);
  const tag = getQueryString(req.query.tag);

  const filter = { owner: req.user._id };

  if (search) {
    // Literal, case-insensitive match; extra characters beyond the cap are ignored
    const term = escapeRegex(search.slice(0, MAX_SEARCH_LENGTH));
    filter.title = { $regex: term, $options: "i" };
  }
  if (priority && PRIORITIES.includes(priority)) {
    filter.priority = priority;
  }
  if (status && STATUSES.includes(status)) {
    filter.status = status;
  }
  if (tag) {
    // Tags are stored lowercase, so ?tag=Work finds "work"
    filter.tags = tag.toLowerCase();
  }

  const p = parsePositiveInt(req.query.page, { fallback: 1 });
  const l = parsePositiveInt(req.query.limit, { fallback: 20, max: 50 });

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
  const { id } = req.params;

  if (isInvalidTaskId(id)) {
    return sendTaskNotFound(res);
  }

  const task = await Task.findOne({ _id: id, owner: req.user._id });
  if (!task) {
    return sendTaskNotFound(res);
  }
  res.json({ success: true, task });
};

// ── PUT /api/v1/tasks/:id ────────────────────
const updateTask = async (req, res) => {
  const { id } = req.params;

  if (isInvalidTaskId(id)) {
    return sendTaskNotFound(res);
  }

  const task = await Task.findOne({ _id: id, owner: req.user._id });
  if (!task) {
    return sendTaskNotFound(res);
  }

  const { title, description, priority, status, tags } = req.body;

  if (title !== undefined) {
    if (!title.trim()) {
      return res.status(400).json({ success: false, message: "Title cannot be empty." });
    }
    task.title = title.trim();
  }
  if (description !== undefined) task.description = description.trim();
  if (priority !== undefined) {
    if (!PRIORITIES.includes(priority))
      return res.status(400).json({ success: false, message: "Invalid priority." });
    task.priority = priority;
  }
  if (status !== undefined) {
    if (!STATUSES.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status." });
    task.status = status;
  }
  if (tags !== undefined) {
    const tagResult = normalizeTags(tags);
    if (tagResult.error) return res.status(400).json({ success: false, message: tagResult.error });
    task.tags = tagResult.tags;
  }

  await task.save();
  res.json({ success: true, task });
};

// ── DELETE /api/v1/tasks/:id ─────────────────
const deleteTask = async (req, res) => {
  const { id } = req.params;

  if (isInvalidTaskId(id)) {
    return sendTaskNotFound(res);
  }

  const task = await Task.findOne({ _id: id, owner: req.user._id });
  if (!task) {
    return sendTaskNotFound(res);
  }
  await task.deleteOne();
  res.json({ success: true, message: "Task deleted." });
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
