const test = require("node:test");
const assert = require("node:assert/strict");
const { releaseChangelog, releaseNotes } = require("./changelog");

const BASE = "https://github.com/KEX-03/taskflow";
const changelog = (unreleased) =>
  [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    unreleased,
    "",
    "## [1.0.0] - 2026-10-09",
    "",
    "First release.",
    "",
    "### Added",
    "",
    "- Everything.",
    "",
    `[Unreleased]: ${BASE}/compare/v1.0.0...HEAD`,
    `[1.0.0]: ${BASE}/releases/tag/v1.0.0`,
    "",
  ].join("\n");

const ENTRIES = "### Added\n\n- A feature.\n\n### Fixed\n\n- A bug.";

test("release moves the Unreleased entries into the new version", () => {
  const { text, previous } = releaseChangelog(changelog(ENTRIES), "1.1.0", "2026-10-21");
  assert.equal(previous, "v1.0.0");
  assert.match(text, /## \[Unreleased\]\n\n## \[1\.1\.0\] - 2026-10-21\n\n### Added\n\n- A feature\.\n\n### Fixed\n\n- A bug\.\n\n## \[1\.0\.0\]/);
});

test("release updates the compare links", () => {
  const { text } = releaseChangelog(changelog(ENTRIES), "1.1.0", "2026-10-21");
  assert.match(text, new RegExp(`\\[Unreleased\\]: ${BASE}/compare/v1\\.1\\.0\\.\\.\\.HEAD\n\\[1\\.1\\.0\\]: ${BASE}/compare/v1\\.0\\.0\\.\\.\\.v1\\.1\\.0\n\\[1\\.0\\.0\\]: `));
});

test("release drops ### groups that have no entries", () => {
  const { text } = releaseChangelog(changelog("### Added\n\n- A feature.\n\n### Changed\n\n### Fixed\n\n- A bug.\n\n### Removed"), "1.1.0", "2026-10-21");
  const notes = releaseNotes(text, "1.1.0");
  assert.equal(notes, "### Added\n\n- A feature.\n\n### Fixed\n\n- A bug.");
});

test("release keeps Windows line endings", () => {
  const { text } = releaseChangelog(changelog(ENTRIES).replace(/\n/g, "\r\n"), "1.1.0", "2026-10-21");
  assert.match(text, /\r\n/);
  assert.doesNotMatch(text, /[^\r]\n/);
});

test("release refuses an empty Unreleased section", () => {
  assert.throws(() => releaseChangelog(changelog("### Added"), "1.1.0", "2026-10-21"), /no entries to release/);
});

test("release refuses a version that already exists", () => {
  assert.throws(() => releaseChangelog(changelog(ENTRIES), "1.0.0", "2026-10-21"), /already has a "## \[1\.0\.0\]" section/);
});

test("release refuses a badly formatted version or date", () => {
  assert.throws(() => releaseChangelog(changelog(ENTRIES), "1.1", "2026-10-21"), /Version must look like 1\.2\.3/);
  assert.throws(() => releaseChangelog(changelog(ENTRIES), "v1.1.0", "2026-10-21"), /Version must look like 1\.2\.3/);
  assert.throws(() => releaseChangelog(changelog(ENTRIES), "1.1.0", "21-10-2026"), /Date must look like 2026-10-31/);
});

test("release refuses a changelog without the Unreleased compare link", () => {
  const noLink = changelog(ENTRIES).replace(/\[Unreleased\]: .*\n/, "");
  assert.throws(() => releaseChangelog(noLink, "1.1.0", "2026-10-21"), /Couldn't find the "\[Unreleased\]/);
});

test("notes returns a version's section, without the heading", () => {
  assert.equal(releaseNotes(changelog(ENTRIES), "1.0.0"), "First release.\n\n### Added\n\n- Everything.");
});

test("notes refuses a missing version", () => {
  assert.throws(() => releaseNotes(changelog(ENTRIES), "9.9.9"), /no "## \[9\.9\.9\]" section/);
});
