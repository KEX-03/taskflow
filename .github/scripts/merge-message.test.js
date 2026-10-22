const test = require("node:test");
const assert = require("node:assert/strict");
const { buildMergeMessage } = require("./merge-message");

const template = (summary) => `<!-- Title: use Conventional Commits -->

## What does this PR do?

<!-- A short description of the change. -->
${summary}

Closes #42

## How did you test it?

Clicked around.

## Checklist

- [x] npm test passes
`;

test("uses the PR title plus the PR number as the commit title", () => {
  const { headline } = buildMergeMessage({ number: 52, title: "fix(client): encode the avatar name", body: "" });
  assert.equal(headline, "fix(client): encode the avatar name (#52)");
});

test("replaces a (#N) the author already put at the end of the title", () => {
  const { headline } = buildMergeMessage({ number: 35, title: "fix: consistent password rules (#18)", body: "" });
  assert.equal(headline, "fix: consistent password rules (#35)");
});

test("uses only the 'What does this PR do?' section, followed by the linked issues", () => {
  const { body } = buildMergeMessage({
    number: 52,
    title: "fix: x",
    body: template("- Encodes the name.\n- Keeps the fallback."),
    closingIssues: [42],
  });
  assert.equal(body, "- Encodes the name.\n- Keeps the fallback.\n\nCloses #42");
});

test("removes template comments and the author's own Closes line", () => {
  const { body } = buildMergeMessage({ number: 1, title: "fix: x", body: template("Summary."), closingIssues: [42] });
  assert.doesNotMatch(body, /<!--/);
  assert.equal(body.match(/Closes #42/g).length, 1);
});

test("an empty or untouched template gives only the Closes lines", () => {
  assert.equal(buildMergeMessage({ number: 1, title: "fix: x", body: template(""), closingIssues: [42] }).body, "Closes #42");
  assert.equal(buildMergeMessage({ number: 1, title: "fix: x", body: null, closingIssues: [7] }).body, "Closes #7");
  assert.equal(buildMergeMessage({ number: 1, title: "fix: x", body: "" }).body, "");
});

test("a description without the template section gives only the Closes lines", () => {
  const { body } = buildMergeMessage({ number: 1, title: "fix: x", body: "Some notes\n\nCloses #3", closingIssues: [3] });
  assert.equal(body, "Closes #3");
});

test("also reads a '### What does this PR do?' heading", () => {
  const description = "### What does this PR do?\n\n- Keeps dev logs.\n\n### Testing\n- Checked it.\n\nCloses #65";
  const { body } = buildMergeMessage({ number: 80, title: "feat: x", body: description, closingIssues: [65] });
  assert.equal(body, "- Keeps dev logs.\n\nCloses #65");
});

test("keeps sub-headings that are inside the section", () => {
  const description = "## What does this PR do?\n\nSummary.\n\n### Changes\n- One.\n\n## How did you test it?\nx";
  const { body } = buildMergeMessage({ number: 1, title: "feat: x", body: description });
  assert.equal(body, "Summary.\n\n### Changes\n- One.");
});

test("lists several linked issues once each, in order", () => {
  const { body } = buildMergeMessage({ number: 1, title: "fix: x", body: "", closingIssues: [12, 3, 12] });
  assert.equal(body, "Closes #3\nCloses #12");
});

test("collapses runs of blank lines and handles Windows line endings", () => {
  const description = "## What does this PR do?\r\n\r\nFirst.\r\n\r\n\r\n\r\nSecond.\r\n\r\n## How did you test it?\r\nx";
  const { body } = buildMergeMessage({ number: 1, title: "fix: x", body: description });
  assert.equal(body, "First.\n\nSecond.");
});
