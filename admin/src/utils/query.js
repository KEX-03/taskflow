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

module.exports = { getQueryString };
