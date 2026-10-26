const DEFAULT_ORIGIN = "http://localhost:3000";

/**
 * Build the list of frontend origins allowed to call the API, for the `cors` middleware.
 *
 * `originList` is a comma-separated list of exact origins, e.g.
 * "http://localhost:3000,https://my-app.vercel.app". Browsers send the origin
 * without a trailing slash, so any is stripped.
 *
 * `pattern` is an optional regular expression for origins that change, like
 * Vercel preview URLs. Because a loose pattern would let any website call the
 * API, it must start with `^https://`, end with `$`, and escape every dot (`\.`):
 * an unescaped `.` matches any character, so `my-app.vercel.app` would also match
 * a domain like `my-app-vercel.app` that someone else could register.
 *
 * @param {string | undefined} originList - `process.env.FRONTEND_ORIGIN`.
 * @param {string | undefined} pattern - `process.env.FRONTEND_ORIGIN_PATTERN`.
 * @returns {{ origins: (string | RegExp)[] } | { error: string }} The origins, or a message explaining what's wrong.
 */
const parseAllowedOrigins = (originList, pattern) => {
  const origins = (originList || DEFAULT_ORIGIN)
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  if (!pattern || !pattern.trim()) return { origins };

  const source = pattern.trim();
  if (!source.startsWith("^https://") || !source.endsWith("$")) {
    return { error: "FRONTEND_ORIGIN_PATTERN must start with ^https:// and end with $." };
  }
  if (/(?<!\\)\./.test(source)) {
    return { error: "FRONTEND_ORIGIN_PATTERN must escape every dot as \\. (for example \\.vercel\\.app$)." };
  }
  try {
    return { origins: [...origins, new RegExp(source)] };
  } catch {
    return { error: "FRONTEND_ORIGIN_PATTERN is not a valid regular expression." };
  }
};

module.exports = { parseAllowedOrigins, DEFAULT_ORIGIN };
