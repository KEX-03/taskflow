// ── Wrap async route handlers to catch errors ─
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ── Global error handler middleware ──────────
// Express only treats a middleware as an error handler when it takes all four arguments,
// so `next` has to stay even though it isn't used
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("[Error]", err.stack || err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages[0], errors: messages });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(400).json({
      success: false,
      message: `Duplicate value for "${field}". Please choose another.`,
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = { asyncHandler, errorHandler };
