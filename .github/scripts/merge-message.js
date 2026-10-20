// Builds the squash-merge commit message for merge-on-approval.yml.
//   Title:       the PR title plus "(#N)"
//   Description: the "What does this PR do?" section of the PR description,
//                then "Closes #N" for each issue the PR is linked to
const buildMergeMessage = ({ number, title, body, closingIssues = [] }) => {
  // Drop a "(#N)" the author already put at the end of the title
  const headline = `${title.replace(/\s*\(#\d+\)\s*$/, "").trim()} (#${number})`;

  const lines = (body || "").replace(/<!--[\s\S]*?-->/g, "").split(/\r?\n/);
  const start = lines.findIndex((line) => /^##\s*What does this PR do\?\s*$/i.test(line));
  let section = [];
  if (start !== -1) {
    const end = lines.findIndex((line, i) => i > start && /^##\s/.test(line));
    section = lines.slice(start + 1, end === -1 ? lines.length : end);
  }
  const summary = section
    // The Closes lines are rebuilt from the linked issues below
    .filter((line) => !/^\s*(closes|fixes|resolves)\s+#\d*\s*$/i.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const closes = [...new Set(closingIssues)].sort((a, b) => a - b).map((n) => `Closes #${n}`).join("\n");
  return { headline, body: [summary, closes].filter(Boolean).join("\n\n") };
};

module.exports = { buildMergeMessage };
