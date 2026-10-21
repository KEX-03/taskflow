# Changelog

All notable changes to TaskFlow are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- ESLint checks the client and server code for likely bugs (unused variables, mistakes with React hooks). Run it with `npm run lint`, and CI runs it on every pull request ([#78](https://github.com/KEX-03/taskflow/issues/78)).
- A character counter under the Bio field on the Profile page ("120 / 300"), which turns amber from 280 characters. The field now stops at the 300-character limit instead of the save failing ([#54](https://github.com/KEX-03/taskflow/pull/54)). Thanks to [@SwatiManjari](https://github.com/SwatiManjari)!
- Approved pull requests are merged automatically: when the maintainer approves a PR, a GitHub Actions workflow squash-merges it as soon as the tests and the build pass, with a commit message built from the PR title, its description and the issues it closes ([#53](https://github.com/KEX-03/taskflow/pull/53), [#55](https://github.com/KEX-03/taskflow/pull/55)).

### Changed

- The README's demo GIF shows the current app.
- The automatic thank-you comment on merged pull requests now invites every contributor to suggest their own ideas through the feature request form.
- The README, contributing guide and pull request template explain that approved pull requests are merged automatically, and that the pull request's title and "What does this PR do?" section become the commit on `main`.

### Fixed

- Password fields in Microsoft Edge no longer show two eye icons: Edge's built-in reveal button is hidden, and the Profile page's password fields now have the same show/hide toggle as Login and Signup ([#50](https://github.com/KEX-03/taskflow/pull/50)).
- The default avatar on the Profile page works for names with special characters: "Tom & Jerry" now shows "TJ" instead of "TO", and names with `#` keep their background colour ([#52](https://github.com/KEX-03/taskflow/pull/52)). Thanks to [@suryaprakashsingh1705-sys](https://github.com/suryaprakashsingh1705-sys)!

## [1.1.0] - 2026-10-20

### Added

- Show/hide password toggle on the Login and Signup pages, with labels linked to the password fields ([#22](https://github.com/KEX-03/taskflow/pull/22)). Thanks to [@Mathi23ok](https://github.com/Mathi23ok)!
- A friendly empty state on the Tasks page for users who have no tasks yet, with a "Create your first task" button ([#25](https://github.com/KEX-03/taskflow/pull/25)). Thanks to [@GauriMalge](https://github.com/GauriMalge)!
- Automated tests for the server's query helpers, using Node's built-in test runner (no new dependencies). Run them with `npm test` from the repository root ([#26](https://github.com/KEX-03/taskflow/pull/26)). Thanks to [@Venom-2006](https://github.com/Venom-2006)!
- A browser tab icon (favicon) and home-screen icon, matching the TaskFlow logo in the sidebar.
- The Dashboard greets users with "Good morning", "Good afternoon" or "Good evening" based on their local time, instead of always "Good morning" ([#29](https://github.com/KEX-03/taskflow/pull/29)). Thanks to [@s-sivaselvan](https://github.com/s-sivaselvan)!
- Loading skeletons on the Tasks page: placeholder cards shaped like real tasks appear while tasks load, instead of a spinner ([#30](https://github.com/KEX-03/taskflow/pull/30)). Thanks to [@CreatorguyS](https://github.com/CreatorguyS)!
- `npm run seed` creates a demo user (`demo@example.com`) with 8 sample tasks for local development. It refuses to run against a non-local database unless `--allow-remote` is given ([#31](https://github.com/KEX-03/taskflow/pull/31)). Thanks to [@CreatorguyS](https://github.com/CreatorguyS)!
- An API reference ([`docs/API.md`](docs/API.md)) with example requests and real responses for every endpoint ([#32](https://github.com/KEX-03/taskflow/pull/32)). Thanks to [@CreatorguyS](https://github.com/CreatorguyS)!
- Continuous integration: every pull request and every push to `main` runs the server tests and the client build with GitHub Actions, and the result shows on the pull request ([#44](https://github.com/KEX-03/taskflow/pull/44)).
- Pressing <kbd>Esc</kbd> closes the New Task, Edit Task and Delete Task dialogs, and screen readers now announce them as dialogs with their title ([#45](https://github.com/KEX-03/taskflow/pull/45)). Thanks to [@Mikcys](https://github.com/Mikcys)!
- When a contributor's pull request is merged, a GitHub Actions workflow posts a thank-you comment, and points first-time contributors to more issues to work on ([#46](https://github.com/KEX-03/taskflow/pull/46)).
- Releases are automated with GitHub Actions: a "Prepare release" workflow opens a pull request that bumps the version and moves the Unreleased changelog entries into a new version, and merging it publishes the GitHub Release with those entries as the notes ([#47](https://github.com/KEX-03/taskflow/pull/47)).

### Changed

- The README's main image is now an animated demo of the app.
- The contributing guide and pull request template ask contributors to run `npm test` before opening a pull request.

### Fixed

- Accessibility: every form label is now linked to its field (clicking a label focuses it, and screen readers announce it), and the icon-only buttons (Edit, Delete, dialog Close, sidebar Collapse/Expand) have descriptive names ([#23](https://github.com/KEX-03/taskflow/pull/23)). Thanks to [@manish-panwarr](https://github.com/manish-panwarr)!
- Requesting, updating or deleting a task with an invalid id (like `/tasks/abc`) now returns 404 "Task not found." instead of a 500 error that exposed an internal database message ([#27](https://github.com/KEX-03/taskflow/pull/27)). Thanks to [@s-sivaselvan](https://github.com/s-sivaselvan)!
- The Tasks page now shows every task instead of only the 20 newest: Previous/Next buttons and a "Page X of Y" label appear when there's more than one page, and the header shows the total number of matching tasks ([#36](https://github.com/KEX-03/taskflow/pull/36)). Thanks to [@varunverma1361-create](https://github.com/varunverma1361-create)!

### Security

- Rate limiting on login and signup: each IP address gets 10 failed login attempts and 10 signup requests per 15 minutes, after which the API returns 429. Successful logins don't count toward the limit ([#33](https://github.com/KEX-03/taskflow/pull/33)). Thanks to [@Saifjafri212213](https://github.com/Saifjafri212213)!
- Signup and password changes now use the same password rules in the app and on the server: at least 12 characters, with an uppercase letter, a lowercase letter, a number and a special character, and no spaces at the start or end. Previously the server accepted 6-character passwords, and the Profile page only checked the length. Existing passwords still work for logging in ([#35](https://github.com/KEX-03/taskflow/pull/35)). Thanks to [@Arya-AV](https://github.com/Arya-AV)!

## [1.0.0] - 2026-10-09

First public release. 🎉

### Added

- Full-stack task manager: sign up and log in with JWT authentication, a dashboard with task statistics, task create/read/update/delete with search and filters, a profile page with password change, and a Postman collection for the API.
- Root `package.json` with helper scripts to work from the repository root: `install:all`, `dev` (server and client together), `dev:server`, `dev:client` and `build`.
- `.nvmrc` (Node.js 24) and an `engines` field requiring Node.js 22.12 or newer.
- `FRONTEND_ORIGIN` accepts a comma-separated list of allowed origins, so local and deployed frontends can use the same API.
- Vercel rewrite (`client/vercel.json`) so refreshing a page like `/tasks` doesn't return a 404.
- Deployment guide for MongoDB Atlas, Render and Vercel ([`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)).
- Architecture overview explaining the request flow, login, data model and React app ([`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)).
- Community files: [MIT license](LICENSE), [contributing guide](CONTRIBUTING.md), [Code of Conduct](CODE_OF_CONDUCT.md) (Contributor Covenant 3.0), [security policy](SECURITY.md), issue forms for bug reports and feature requests, and a pull request template.
- Comments explaining every variable in `server/.env.example` and `client/.env.example`.

### Changed

- **Folder rename:** the API now lives in `server/` and the frontend in `client/` (previously `backend/`/`frontend/`, then `admin/`/`app/`). Packages are renamed to `taskflow-server` and `taskflow-client`.
- Frontend build tool migrated from Create React App (`react-scripts`) to Vite ([#2](https://github.com/KEX-03/taskflow/pull/2)). The API URL is now set with `VITE_API_URL` and is required; there is no built-in fallback URL.
- Upgraded React Router from 6 to 7 and Tailwind CSS from 3 to 4. The UI looks the same as before.
- The server's development mode uses Node's built-in `node --watch` instead of `nodemon`.
- The server now stops with a clear error message and a non-zero exit code when `MONGO_URI` or `JWT_SECRET` is missing, when the port is already in use, or when MongoDB can't be reached within 10 seconds (previously 30).
- The default local database name in `server/.env.example` is now `taskflow`.
- README rewritten as a landing page with screenshots, a live demo link, a quick start and an API overview.
- The app's page description (used by search engines and link previews) now describes TaskFlow instead of "Auth + Dashboard App".

### Fixed

- Task list pagination: non-numeric `page`/`limit` values fall back to the defaults, and `limit` is capped at 50 ([#3](https://github.com/KEX-03/taskflow/pull/3)).
- Repeated or nested task query parameters (like `?search=a&search=b`) no longer crash the task list with a server error ([#3](https://github.com/KEX-03/taskflow/pull/3)).
- The large loading spinner on the Dashboard now shows up; it previously had no visible border.
- The Login page now shows its grid background, which a CSS typo had always hidden ([#12](https://github.com/KEX-03/taskflow/pull/12)). Thanks to [@Jah-yee](https://github.com/Jah-yee) for the first community contribution!

### Security

- Task search treats special characters (such as `(` or `.*`) literally and is capped at 100 characters, preventing regular-expression injection and expensive queries ([#3](https://github.com/KEX-03/taskflow/pull/3)).
- Updated dependencies to fix all known vulnerabilities reported by `npm audit`.

### Removed

- Unused `uuid` dependency from the server.

[Unreleased]: https://github.com/KEX-03/taskflow/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/KEX-03/taskflow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/KEX-03/taskflow/releases/tag/v1.0.0
