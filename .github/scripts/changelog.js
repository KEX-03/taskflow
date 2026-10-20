// Changelog helpers for the release workflows (prepare-release.yml and publish-release.yml).
//
//   node .github/scripts/changelog.js release <version> <date>
//     Moves everything under "## [Unreleased]" into a new "## [<version>] - <date>" section,
//     leaves an empty Unreleased section above it, and updates the compare links at the bottom.
//
//   node .github/scripts/changelog.js notes <version>
//     Prints that version's section, for the release PR and the GitHub Release notes.
const fs = require("fs");
const path = require("path");

const FILE = process.env.CHANGELOG_PATH || path.join(__dirname, "../../CHANGELOG.md");

const fail = (message) => {
  console.error(`❌  ${message}`);
  process.exit(1);
};

const [command, version, date] = process.argv.slice(2);
if (!/^\d+\.\d+\.\d+$/.test(version || "")) fail(`Version must look like 1.2.3, got "${version}".`);

const text = fs.readFileSync(FILE, "utf8");
const eol = text.includes("\r\n") ? "\r\n" : "\n";
const lines = text.split(/\r?\n/);

const isVersionHeading = (line) => line.startsWith("## [");
const headingIndex = (name) => lines.findIndex((line) => line === `## [${name}]` || line.startsWith(`## [${name}] - `));

// Lines between a "## [...]" heading and the next one, without blank lines at either end
const sectionBody = (start) => {
  let end = lines.findIndex((line, i) => i > start && isVersionHeading(line));
  if (end === -1) end = lines.findIndex((line, i) => i > start && /^\[[^\]]+\]: /.test(line));
  if (end === -1) end = lines.length;
  const body = lines.slice(start + 1, end);
  while (body.length && !body[0].trim()) body.shift();
  while (body.length && !body[body.length - 1].trim()) body.pop();
  return { body, end };
};

// Drops "### ..." headings that have no entries under them, and the blank lines they leave behind
const withoutEmptyGroups = (body) =>
  body
    .filter((line, i) => {
      if (!line.startsWith("### ")) return true;
      const next = body.findIndex((l, j) => j > i && l.startsWith("### "));
      return body.slice(i + 1, next === -1 ? body.length : next).some((l) => l.trim());
    })
    .filter((line, i, kept) => line.trim() || (i > 0 && i < kept.length - 1 && kept[i - 1].trim()));

if (command === "notes") {
  const start = headingIndex(version);
  if (start === -1) fail(`CHANGELOG.md has no "## [${version}]" section.`);
  console.log(sectionBody(start).body.join("\n"));
} else if (command === "release") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) fail(`Date must look like 2026-10-31, got "${date}".`);
  if (headingIndex(version) !== -1) fail(`CHANGELOG.md already has a "## [${version}]" section.`);

  const start = headingIndex("Unreleased");
  if (start === -1) fail(`CHANGELOG.md has no "## [Unreleased]" section.`);
  const { body, end } = sectionBody(start);
  if (!body.some((line) => line.startsWith("- "))) fail("The Unreleased section has no entries to release.");

  const linkIndex = lines.findIndex((line) => line.startsWith("[Unreleased]: "));
  const link = linkIndex === -1 ? null : lines[linkIndex].match(/^\[Unreleased\]: (.+)\/compare\/(v[^.]+\.[^.]+\.[^.]+)\.\.\.HEAD$/);
  if (!link) fail('Couldn\'t find the "[Unreleased]: .../compare/vX.Y.Z...HEAD" link at the bottom.');
  const [, base, previous] = link;

  const output = [
    ...lines.slice(0, start),
    "## [Unreleased]",
    "",
    `## [${version}] - ${date}`,
    "",
    ...withoutEmptyGroups(body),
    "",
    ...lines.slice(end),
  ];
  const newLinkIndex = output.findIndex((line) => line.startsWith("[Unreleased]: "));
  output.splice(newLinkIndex, 1, `[Unreleased]: ${base}/compare/v${version}...HEAD`, `[${version}]: ${base}/compare/${previous}...v${version}`);

  fs.writeFileSync(FILE, output.join(eol));
  console.log(`✅  Moved Unreleased into ${version} (${date}); compared with ${previous}.`);
} else {
  fail(`Unknown command "${command}". Use "release" or "notes".`);
}
