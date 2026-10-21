// Changelog helpers for the release workflows (prepare-release.yml and publish-release.yml).
//
//   node .github/scripts/changelog.js release <version> <date>
//     Moves everything under "## [Unreleased]" into a new "## [<version>] - <date>" section,
//     leaves an empty Unreleased section above it, and updates the compare links at the bottom.
//
//   node .github/scripts/changelog.js notes <version>
//     Prints that version's section, for the release PR and the GitHub Release notes.
//
// The same logic is exported as releaseChangelog() and releaseNotes() for the tests.
const fs = require("fs");
const path = require("path");

const checkVersion = (version) => {
  if (!/^\d+\.\d+\.\d+$/.test(version || "")) throw new Error(`Version must look like 1.2.3, got "${version}".`);
};

const isVersionHeading = (line) => line.startsWith("## [");
const headingIndex = (lines, name) =>
  lines.findIndex((line) => line === `## [${name}]` || line.startsWith(`## [${name}] - `));

// Lines between a "## [...]" heading and the next one, without blank lines at either end
const sectionBody = (lines, start) => {
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

// Returns a version's section (without its heading)
const releaseNotes = (text, version) => {
  checkVersion(version);
  const lines = text.split(/\r?\n/);
  const start = headingIndex(lines, version);
  if (start === -1) throw new Error(`CHANGELOG.md has no "## [${version}]" section.`);
  return sectionBody(lines, start).body.join("\n");
};

// Returns the changelog with Unreleased moved into a new version, and the version it's compared with
const releaseChangelog = (text, version, date) => {
  checkVersion(version);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) throw new Error(`Date must look like 2026-10-31, got "${date}".`);

  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  if (headingIndex(lines, version) !== -1) throw new Error(`CHANGELOG.md already has a "## [${version}]" section.`);

  const start = headingIndex(lines, "Unreleased");
  if (start === -1) throw new Error(`CHANGELOG.md has no "## [Unreleased]" section.`);
  const { body, end } = sectionBody(lines, start);
  if (!body.some((line) => line.startsWith("- "))) throw new Error("The Unreleased section has no entries to release.");

  const linkIndex = lines.findIndex((line) => line.startsWith("[Unreleased]: "));
  const link = linkIndex === -1 ? null : lines[linkIndex].match(/^\[Unreleased\]: (.+)\/compare\/(v[^.]+\.[^.]+\.[^.]+)\.\.\.HEAD$/);
  if (!link) throw new Error('Couldn\'t find the "[Unreleased]: .../compare/vX.Y.Z...HEAD" link at the bottom.');
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

  return { text: output.join(eol), previous };
};

module.exports = { releaseChangelog, releaseNotes };

// Command line, used by the release workflows
if (require.main === module) {
  const [command, version, date] = process.argv.slice(2);
  const file = process.env.CHANGELOG_PATH || path.join(__dirname, "../../CHANGELOG.md");
  try {
    checkVersion(version);
    const text = fs.readFileSync(file, "utf8");
    if (command === "notes") {
      console.log(releaseNotes(text, version));
    } else if (command === "release") {
      const result = releaseChangelog(text, version, date);
      fs.writeFileSync(file, result.text);
      console.log(`✅  Moved Unreleased into ${version} (${date}); compared with ${result.previous}.`);
    } else {
      throw new Error(`Unknown command "${command}". Use "release" or "notes".`);
    }
  } catch (err) {
    console.error(`❌  ${err.message}`);
    process.exit(1);
  }
}
