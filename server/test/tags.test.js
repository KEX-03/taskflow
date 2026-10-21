const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeTags } = require("../src/utils/tags");

test("trims, lowercases and de-duplicates tags, keeping the first", () => {
  assert.deepEqual(normalizeTags(["Work", "urgent", "work "]), { tags: ["work", "urgent"] });
});

test("accepts an empty list", () => {
  assert.deepEqual(normalizeTags([]), { tags: [] });
});

test("accepts five tags of 1 and 20 characters", () => {
  const tags = ["a", "b", "c", "d", "x".repeat(20)];
  assert.deepEqual(normalizeTags(tags), { tags });
});

test("counts tags after removing duplicates", () => {
  assert.deepEqual(normalizeTags(["a", "b", "c", "d", "e", "A "]).tags, ["a", "b", "c", "d", "e"]);
});

test("rejects more than five tags", () => {
  assert.match(normalizeTags(["a", "b", "c", "d", "e", "f"]).error, /at most 5 tags/);
});

test("rejects a tag longer than 20 characters", () => {
  assert.match(normalizeTags(["x".repeat(25)]).error, /1 to 20 characters/);
});

test("rejects an empty or blank tag", () => {
  assert.match(normalizeTags(["work", "  "]).error, /1 to 20 characters/);
});

test("rejects anything but an array of strings", () => {
  for (const value of ["work", null, 5, { 0: "work" }, ["work", 5]]) {
    assert.match(normalizeTags(value).error, /array of strings/);
  }
});
