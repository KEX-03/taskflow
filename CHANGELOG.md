# Changelog

All notable changes to TaskFlow are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/KEX-03/taskflow/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/KEX-03/taskflow/releases/tag/v1.0.0
