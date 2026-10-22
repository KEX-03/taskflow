
# Contributing to TaskFlow

Thanks for wanting to help! TaskFlow is built for learning, so **first-time contributors are very welcome**. Never opened a pull request before? This guide walks you through every step.

By taking part, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md). In short: be kind and respectful.

**Contents**

1. [Find an issue to work on](#1-find-an-issue-to-work-on)
2. [Set up the project](#2-set-up-the-project)
3. [Make your change](#3-make-your-change)
4. [Test your change](#4-test-your-change)
5. [Open a pull request](#5-open-a-pull-request)
6. [Where things live](#6-where-things-live)
7. [Getting help](#7-getting-help)

---

## 1. Find an issue to work on

1. Browse the [open issues](https://github.com/KEX-03/taskflow/issues). If you're new, look for the [`good first issue`](https://github.com/KEX-03/taskflow/labels/good%20first%20issue) label: these are small, well-described tasks.
2. **Comment on the issue before you start**, for example: *"Hi, I'd like to work on this!"*
3. **Wait until a maintainer assigns the issue to you.** This stops two people from accidentally doing the same work. Pull requests for issues that aren't assigned to you are closed.
4. If you get stuck or can't finish, just say so in a comment. That's completely fine, and someone else can pick it up.

> **Good first issues are reserved for people making their first few open-source contributions.** They're how newcomers get started here. If you've already had several pull requests merged in other projects, please pick a [`help wanted`](https://github.com/KEX-03/taskflow/labels/help%20wanted) issue instead.

**Have an idea that isn't in an issue yet?** [Open an issue](https://github.com/KEX-03/taskflow/issues/new/choose) first and describe it, so we can agree on the approach before you write code. Small fixes like typos can go straight to a pull request.

---

## 2. Set up the project

### What you need

- [Node.js](https://nodejs.org) **22.12 or newer**. Version 24 is recommended (it's in [`.nvmrc`](.nvmrc)). Check yours with `node --version`.
- [Git](https://git-scm.com).
- **MongoDB**, either:
  - Installed locally ([MongoDB Community Server](https://www.mongodb.com/try/download/community)), or
  - A free cloud database on [MongoDB Atlas](https://www.mongodb.com/atlas). Step 1 of the [deployment guide](docs/DEPLOYMENT.md#1-database-mongodb-atlas) explains how to get a connection string.

### Fork and clone

A **fork** is your own copy of the repository on GitHub. You push your changes there, then ask for them to be merged into the original.

1. Click **Fork** at the top right of the [TaskFlow repository](https://github.com/KEX-03/taskflow).
2. Clone **your fork** (replace `<your-username>`):

   ```bash
   git clone https://github.com/<your-username>/taskflow.git
   cd taskflow
   ```

3. Connect it to the original repository, called `upstream`, so you can get the latest changes later:

   ```bash
   git remote add upstream https://github.com/KEX-03/taskflow.git
   ```

### Install and run

All commands run from the **repository root** (the `taskflow` folder).

1. Install everything (root, server and client):

   ```bash
   npm run install:all
   ```

2. Create your local settings files from the examples:

   ```bash
   # macOS / Linux / Git Bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

   ```powershell
   # Windows PowerShell
   Copy-Item server/.env.example server/.env
   Copy-Item client/.env.example client/.env
   ```

   The defaults work with a local MongoDB. Using Atlas? Put your connection string in `MONGO_URI` in `server/.env`. Each setting is explained in the file.

3. Start the server and the client together:

   ```bash
   npm run dev
   ```

   You should see a server message showing that it is running at `http://localhost:5000` and a client message from Vite.

4. Open [http://localhost:3000](http://localhost:3000) and sign up for an account.

Other commands you can run from the root:

| Command | What it does |
|---------|--------------|
| `npm run dev:server` | Start only the API ([http://localhost:5000](http://localhost:5000)) |
| `npm run dev:client` | Start only the frontend ([http://localhost:3000](http://localhost:3000)) |
| `npm run build` | Build the frontend for production |
| `npm test` | Run the automated tests (backend unit and integration tests, plus release and merge script tests) |
| `npm run lint` | Check the client and server code for likely bugs with ESLint |

**Something went wrong?** The server prints a message explaining what's missing, for example an environment variable or a MongoDB connection. Port already in use? Stop the other program, or the other `npm run dev`, first.

---

## 3. Make your change

### Create a branch

Never work directly on `main`. First get the latest code, then create a branch for your issue:

```bash
git checkout main
git pull upstream main
git checkout -b fix/42-dashboard-task-count
```

Name branches `<type>/<issue-number>-<short-description>`, using the same types as commit messages (below):

| Example | When |
|---------|------|
| `feat/17-due-dates` | A new feature |
| `fix/42-dashboard-task-count` | A bug fix |
| `docs/8-api-examples` | Documentation only |

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org): `type(scope): short description`.

- **Type** says what kind of change it is.
- **Scope** (optional) says which part: `server` or `client`.
- **Description** is written in lowercase, in the imperative ("add", not "added"), without a full stop at the end.

| Type | Use it for | Example |
|------|------------|---------|
| `feat` | A new feature | `feat(client): add password visibility toggle` |
| `fix` | A bug fix | `fix(server): return 404 for invalid task ids` |
| `docs` | Documentation | `docs: add Windows setup notes to README` |
| `style` | Formatting only, no logic change | `style(client): fix indentation in Tasks page` |
| `refactor` | Restructuring code without changing behavior | `refactor(server): move auth validation into a helper` |
| `test` | Adding or changing tests | `test(server): add tests for task controller` |
| `build` | Dependencies, scripts, build setup | `build(client): upgrade vite` |
| `ci` | GitHub Actions workflows | `ci: run tests on pull requests` |
| `chore` | Other maintenance | `chore: update .gitignore` |

Small, focused commits are easier to review than one giant commit.

Pull requests are **squash-merged**: all your commits become one commit on `main`, and **your pull request's title becomes that commit's title**. So give the pull request a title in this same format too (see [Open a pull request](#5-open-a-pull-request)).

### Keep your branch up to date

If `main` has changed since you started, bring your branch up to date:

```bash
git fetch upstream
git merge upstream/main
```

---

## 4. Test your change

The backend has an automated test suite using Node.js's built-in test runner. It needs MongoDB running locally (the same as `npm run dev`), so make sure MongoDB is running before starting the tests.

1. **The tests and the linter pass.** Run `npm test` from the repository root (or from `server/`) and verify that it finishes with `ℹ fail 0`. Run `npm run lint` and make sure it reports no problems. If you change a helper in `server/src/utils/` or an API endpoint, add or update the relevant tests in `server/test/`. Changes to scripts in `.github/scripts/` should include corresponding test updates.
2. **It builds.** `npm run build` finishes successfully.
3. **It starts cleanly.** `npm run dev` shows no errors in either the server or client output.
4. **Your change works.** Try the exact thing your issue describes, including edge cases such as empty input and invalid values.
5. **Nothing else broke.** Run through the main flow:
   - Sign up, log out, and log back in.
   - Create, edit, filter, search, and delete a task.
   - Update your profile.
6. **The browser console is clean.** Open the developer tools (**F12**) and check the **Console** tab for red errors.
7. **For API changes:** call the endpoint with [Postman](https://www.postman.com) (import [`postman_collection.json`](postman_collection.json)) or `curl`, including error cases such as missing fields, invalid values, and no login token.

When you open a pull request, GitHub Actions runs the tests and the build automatically, and shows the result at the bottom of the PR. If a check fails, click **Details** to see why, fix it, and push again: the checks re-run on every push. On your first pull request, a maintainer may need to approve the checks before they run.

---

## 5. Open a pull request

1. Push your branch to your fork:

   ```bash
   git push -u origin fix/42-dashboard-task-count
   ```

2. GitHub will show a **Compare & pull request** button on your fork. Click it, and check that the base is `KEX-03/taskflow` → `main`.
3. **Give it a title in the Conventional Commits format**, for example `fix(client): show every task on the Tasks page`. It becomes the commit title on `main`.
4. Fill in the pull request template:
   - **Link the issue** with `Closes #42`, so it closes automatically when merged.
   - **Explain what you changed and why** under "What does this PR do?". Write it for someone reading the project history later: this section becomes the commit's description on `main`.
   - **Explain how you tested it**.
   - **Add screenshots** (before and after) for anything visible in the UI.
   - **Update the docs** if you changed setup steps, environment variables, or API endpoints.

What to expect:

- **Keep pull requests small:** one issue per pull request.
- A maintainer will review it and may ask for changes. That's normal and part of learning! Push new commits to the same branch and the pull request updates automatically.
- Please be patient: maintainers review in their free time.
- Once it's approved, it's **merged automatically** as soon as the tests and the build pass. The commit on `main` is made from your pull request: the title, the "What does this PR do?" section, and a `Closes #...` line for the linked issue. A maintainer may tidy the title or description before approving.

---

## 6. Where things live

For the bigger picture (how a request flows, how login works, and how the data is stored), read [How TaskFlow works](docs/ARCHITECTURE.md) first.

```text
taskflow/
├── server/src/            Express API
│   ├── app.js             Express app: middleware and routes
│   ├── server.js          Entry point: database connection and startup
│   ├── config/db.js       MongoDB connection
│   ├── models/            Mongoose schemas: User, Task
│   ├── controllers/       Request handlers (the actual logic)
│   ├── routes/            URL-to-controller mapping
│   ├── middleware/auth.js protect: checks the login token
│   └── utils/             Helpers: tokens, errors, query parsing
├── server/test/           Automated unit and integration tests
└── client/src/            React app
    ├── App.jsx            All page routes
    ├── pages/             One file per page
    ├── components/        Shared UI (Sidebar, Toast, Spinner, ...)
    ├── context/            AuthContext: the logged-in user
    └── utils/api.js        Axios instance that talks to the API
```

### Adding an API endpoint (model → controller → route)

A request travels **route → middleware → controller → model**. To add an endpoint, work through the following steps.

**1. Model** (`server/src/models/`): only needed if you store **new data**. For example, to add a field, include it in the appropriate schema in `Task.js` or `User.js`:

```js
dueDate: {
  type: Date,
  default: null,
},
```

**2. Controller** (`server/src/controllers/`): write the function that handles the request. `req.user` is the logged-in user (set by `protect`). Always ensure users can access only their own data when the endpoint operates on user-owned resources.

**3. Route** (`server/src/routes/`): connect the URL to the controller. Wrap protected endpoints in `protect` and use `asyncHandler` to pass errors to the error handler:

```js
router.get("/example", protect, asyncHandler(getExample));
```

**4. App** (`server/src/app.js`): only needed for a new routes file. Mount it next to the existing routes:

```js
app.use("/api/v1/example", exampleRoutes);
```

**5. Try it:** test the endpoint with Postman or `curl`, including a valid request and relevant error cases. Add it to `postman_collection.json` and the API table in the README when appropriate.

**6. Add automated tests** (`server/test/`): add integration tests for API behavior or unit tests for new helpers. Run `npm test` from the root to ensure all tests pass.

### Adding a page to the client

Example: an **Archive** page at `/archive`.

**1. Create the page** in `client/src/pages/Archive.jsx`. Use the shared `api` instance for requests and `useToast` for messages:

```jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api.js";
import { useToast } from "../components/Shared/Toast.jsx";

const Archive = () => {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get("/tasks?status=done")
      .then(({ data }) => setTasks(data.tasks))
      .catch(() => addToast("Could not load tasks.", "error"));
  }, [addToast]);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-xl font-bold text-white mb-6">Archive</h1>
      {tasks.map((task) => (
        <p key={task._id} className="text-slate-300 text-sm">
          {task.title}
        </p>
      ))}
    </div>
  );
};

export default Archive;
```

**2. Add a route** in `client/src/App.jsx`. Import the page at the top, then add a `Route` next to the others. Wrapping it in `ProtectedRoute` sends logged-out users to the login page, and `DashLayout` adds the sidebar:

```jsx
import Archive from "./pages/Archive.jsx";
```

```jsx
<Route
  path="/archive"
  element={
    <ProtectedRoute>
      <DashLayout>
        <Archive />
      </DashLayout>
    </ProtectedRoute>
  }
/>
```

**3. Add a sidebar link** in `client/src/components/Layout/Sidebar.jsx` by adding an entry to the `navItems` array, with `to: "/archive"`, a `label`, and an `icon` (copy the SVG from another entry to start with).

**4. Try it:** open [http://localhost:3000/archive](http://localhost:3000/archive) while logged in, then try it again while logged out (you should be sent to the login page).

Styling uses [Tailwind CSS](https://tailwindcss.com) utility classes. Copy the classes from existing pages to keep the look consistent.

---

## 7. Getting help

- **Questions about the code or setup?** Ask in [GitHub Discussions](https://github.com/KEX-03/taskflow/discussions).
- **Stuck on an issue you're working on?** Comment on the issue itself.
- **Found a bug?** [Open an issue](https://github.com/KEX-03/taskflow/issues/new/choose).
- **Found a security problem?** Please don't open a public issue; see [SECURITY.md](SECURITY.md).

Thanks for contributing!
