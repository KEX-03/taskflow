const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const cors = require("cors");

const { parseAllowedOrigins, DEFAULT_ORIGIN } = require("../src/utils/cors");

const PREVIEW_PATTERN = String.raw`^https://taskflow-[a-z0-9-]+-my-team\.vercel\.app$`;

// Tests for the exact origins in FRONTEND_ORIGIN
test("parseAllowedOrigins defaults to localhost when nothing is set", () => {
  assert.deepEqual(parseAllowedOrigins(undefined, undefined), { origins: [DEFAULT_ORIGIN] });
});

test("parseAllowedOrigins splits, trims and strips trailing slashes", () => {
  const { origins } = parseAllowedOrigins(" https://my-app.vercel.app/ , http://localhost:3000,", undefined);
  assert.deepEqual(origins, ["https://my-app.vercel.app", "http://localhost:3000"]);
});

test("parseAllowedOrigins ignores an empty pattern", () => {
  assert.deepEqual(parseAllowedOrigins("https://my-app.vercel.app", "  "), {
    origins: ["https://my-app.vercel.app"],
  });
});

// Tests for FRONTEND_ORIGIN_PATTERN
test("parseAllowedOrigins adds a valid pattern after the exact origins", () => {
  const { origins } = parseAllowedOrigins("https://my-app.vercel.app", PREVIEW_PATTERN);
  assert.equal(origins[0], "https://my-app.vercel.app");
  assert.ok(origins[1] instanceof RegExp);
});

test("the pattern matches preview URLs but not other sites", () => {
  const pattern = parseAllowedOrigins(undefined, PREVIEW_PATTERN).origins[1];

  assert.equal(pattern.test("https://taskflow-git-fix-login-my-team.vercel.app"), true);
  assert.equal(pattern.test("https://taskflow-a1b2c3d4e-my-team.vercel.app"), true);
  assert.equal(pattern.test("https://evil.vercel.app"), false);
  assert.equal(pattern.test("https://taskflow-x-my-team.vercel.app.evil.com"), false);
  assert.equal(pattern.test("http://taskflow-x-my-team.vercel.app"), false);
});

test("parseAllowedOrigins rejects a pattern that isn't anchored", () => {
  const result = parseAllowedOrigins(undefined, String.raw`https://taskflow-[a-z0-9-]+\.vercel\.app`);
  assert.match(result.error, /start with \^https:\/\/ and end with \$/);
});

test("parseAllowedOrigins rejects a pattern that allows http", () => {
  const result = parseAllowedOrigins(undefined, String.raw`^http://taskflow-[a-z0-9-]+\.vercel\.app$`);
  assert.match(result.error, /start with \^https:\/\//);
});

test("parseAllowedOrigins rejects unescaped dots", () => {
  const result = parseAllowedOrigins(undefined, "^https://taskflow-[a-z0-9-]+-my-team.vercel.app$");
  assert.match(result.error, /escape every dot/);
});

test("parseAllowedOrigins rejects .* wildcards", () => {
  const result = parseAllowedOrigins(undefined, String.raw`^https://.*\.vercel\.app$`);
  assert.match(result.error, /escape every dot/);
});

test("parseAllowedOrigins rejects an invalid regular expression", () => {
  const result = parseAllowedOrigins(undefined, String.raw`^https://taskflow-[a-z\.vercel\.app$`);
  assert.match(result.error, /not a valid regular expression/);
});

// The cors middleware with these origins: only allowed origins get the header
test("cors allows the exact origins and matching previews, and nothing else", async () => {
  const { origins } = parseAllowedOrigins("https://my-app.vercel.app", PREVIEW_PATTERN);
  const app = express();
  app.use(cors({ origin: origins, credentials: true }));
  app.get("/", (req, res) => res.json({ ok: true }));

  const server = app.listen(0);
  const url = `http://localhost:${server.address().port}/`;
  const allowedOrigin = async (origin) =>
    (await fetch(url, { headers: { Origin: origin } })).headers.get("access-control-allow-origin");

  try {
    assert.equal(await allowedOrigin("https://my-app.vercel.app"), "https://my-app.vercel.app");
    assert.equal(
      await allowedOrigin("https://taskflow-git-fix-login-my-team.vercel.app"),
      "https://taskflow-git-fix-login-my-team.vercel.app"
    );
    assert.equal(await allowedOrigin("https://evil.vercel.app"), null);
  } finally {
    server.close();
  }
});
