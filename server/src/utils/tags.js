const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 20;

/**
 * Validate and normalize a task's tags from a request body.
 * Each tag is trimmed and lowercased, and duplicates are dropped, keeping the
 * first one: `["Work", "work "]` becomes `["work"]`.
 *
 * @param {unknown} value - `req.body.tags`.
 * @returns {{ tags: string[] } | { error: string }} The tags, or a message for a 400.
 */
const normalizeTags = (value) => {
  if (!Array.isArray(value) || !value.every((tag) => typeof tag === "string")) {
    return { error: "Tags must be an array of strings." };
  }
  const tags = [...new Set(value.map((tag) => tag.trim().toLowerCase()))];
  if (tags.some((tag) => tag.length < 1 || tag.length > MAX_TAG_LENGTH)) {
    return { error: `Each tag must be 1 to ${MAX_TAG_LENGTH} characters.` };
  }
  if (tags.length > MAX_TAGS) {
    return { error: `A task can have at most ${MAX_TAGS} tags.` };
  }
  return { tags };
};

module.exports = { normalizeTags, MAX_TAGS, MAX_TAG_LENGTH };
