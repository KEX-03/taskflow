/**
 * Normalize a query-string value to a single trimmed string.
 * Express turns `?a=1&a=2` into an array and `?a[x]=1` into an object,
 * so a param can't be assumed to be a string.
 *
 * @param {unknown} value - A value from `req.query`.
 * @returns {string|undefined} The trimmed string (first element if an array),
 *   or `undefined` if it isn't a string.
 */
const getQueryString = (value) => {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === "string" ? first.trim() : undefined;
};

/**
 * Escape regex special characters so a string matches literally
 * when used in a MongoDB `$regex` (e.g. "(" or ".*" from user input).
 *
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Parse a query-string value as an integer for pagination.
 * Non-numeric input (e.g. "abc") returns `fallback`; numbers outside
 * [min, max] are clamped to the nearest bound.
 *
 * @param {unknown} value - A value from `req.query`.
 * @param {{ fallback: number, min?: number, max?: number }} options
 * @returns {number}
 */
const parsePositiveInt = (value, { fallback, min = 1, max = Infinity }) => {
  const n = parseInt(getQueryString(value), 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

module.exports = { getQueryString, escapeRegex, parsePositiveInt };
