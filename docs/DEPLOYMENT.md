# Deploying TaskFlow

This guide puts your own copy of TaskFlow online using three free services:

| Part | Folder | Service | What it does |
|------|--------|---------|--------------|
| Database | – | [MongoDB Atlas](https://www.mongodb.com/atlas) | Stores users and tasks |
| API (backend) | `server/` | [Render](https://render.com) | Runs the Express server |
| Frontend | `client/` | [Vercel](https://vercel.com) | Serves the React app |

You'll need a GitHub account with your own fork (copy) of this repository; Render and Vercel deploy straight from GitHub.

**Do the steps in this order.** Each part needs a URL from the one before it:

1. **Atlas** gives you a connection string, which Render needs.
2. **Render** gives you the API URL, which Vercel needs.
3. **Vercel** gives you the frontend URL, which Render needs for CORS (step 4).

Throughout this guide, replace placeholders like `<your-api>` with your own values.

---

## 1. Database: MongoDB Atlas

1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a **free cluster**. Any cloud provider and region works; pick one close to the region you'll use on Render.
2. **Create a database user** (Atlas calls this *Database Access*). Choose a username and a strong password, and save both somewhere safe.
   - Tip: use a password with only letters and numbers. Characters like `@`, `:`, `/` or `#` have to be URL-encoded in the connection string (for example `@` becomes `%40`), and forgetting this is a common cause of "authentication failed" errors.
3. **Allow network access** (Atlas calls this *Network Access* / *IP Access List*). Add `0.0.0.0/0` ("allow access from anywhere").
   - Why: Render's free tier doesn't give your server a fixed IP address, so Atlas can't allow just that one address. Your database is still protected by the username and password.
4. **Get the connection string.** Click **Connect** on your cluster → **Drivers**, and copy the string. It looks like:
   ```
   mongodb+srv://<user>:<password>@<cluster>.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Put your password in, and **add the database name** `taskflow` right after `.mongodb.net/`:
   ```
   mongodb+srv://<user>:<password>@<cluster>.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
   ```
   Without a name, MongoDB uses a database called `test`. The `taskflow` database is created automatically on first use.

This full string is your `MONGO_URI`.

---

## 2. API: Render

1. Sign up at [render.com](https://render.com) with your GitHub account.
2. Click **New** → **Web Service** and pick your TaskFlow repository.
3. Fill in the settings:

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `server` |
   | **Runtime / Language** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |
   | **Auto-Deploy** | On Commit |

   **Auto-Deploy** makes Render redeploy the API every time a change to `server/` lands on `main`. You can check or change it later under **Settings → Build & Deploy**. If it's off, your live API keeps running old code until you click **Manual Deploy → Deploy latest commit**.

4. Add the **environment variables**:

   | Name | Value |
   |------|-------|
   | `MONGO_URI` | Your Atlas connection string from step 1 |
   | `JWT_SECRET` | A long random string, **different from your local one**. Generate one with:<br>`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_ORIGIN` | `http://localhost:3000` for now; you'll add your Vercel URL in step 4 |
   | `NODE_VERSION` | `24` (optional; makes Render use the same Node version as `.nvmrc`) |

   **Don't set `PORT`.** Render sets it automatically and the server reads it.

5. Optional but useful: under the advanced settings, set **Health Check Path** to `/api/v1/health`. Render then waits for the server to answer before sending it traffic.
6. Click **Create Web Service** and watch the logs. A successful start ends with:
   ```
   ✅  MongoDB connected: ...
   ✅  Server running on http://localhost:10000
   ```
   (The log says `localhost` because that's what the server sees from the inside. Your public address is shown at the top of the Render page.)
7. Copy your service URL, e.g. `https://<your-api>.onrender.com`, and check it in a browser:
   ```
   https://<your-api>.onrender.com/api/v1/health
   ```
   You should see `{"status":"ok","timestamp":"..."}`.

If the logs show a `❌` line instead, see [Troubleshooting](#troubleshooting).

---

## 3. Frontend: Vercel

1. Sign up at [vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New…** → **Project** and import your TaskFlow repository.
3. Fill in the settings:

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `client` (click **Edit** next to it) |
   | **Framework Preset** | Vite (usually detected automatically) |
   | **Build Command** | `npm run build` (the default) |
   | **Output Directory** | `dist` (the default) |

4. Add one **environment variable**:

   | Name | Value |
   |------|-------|
   | `VITE_API_URL` | `https://<your-api>.onrender.com/api/v1` |

   Use `https`, include `/api/v1`, and don't end with a `/`.

   Vite copies this value into the app **when it builds**. If you change it later, you must **redeploy** on Vercel for the change to take effect.
5. Click **Deploy**. When it finishes, copy your URL, e.g. `https://<your-app>.vercel.app`.

Page refreshes work on any route (like `/tasks`) because of `client/vercel.json`, which sends every URL to the React app.

---

## 4. Connect the API to the frontend (CORS)

Browsers only let the frontend talk to the API if the API lists the frontend's address. Right now Render only allows `http://localhost:3000`.

1. In Render, open your service → **Environment**.
2. Change `FRONTEND_ORIGIN` to include your Vercel URL. Separate several URLs with commas:
   ```
   https://<your-app>.vercel.app,http://localhost:3000
   ```
   Keeping `http://localhost:3000` lets you run the frontend locally against the deployed API. Remove it if you don't need that.
3. Save. Render redeploys the service with the new value (if it doesn't, use **Manual Deploy** → **Deploy latest commit**).

> **Preview deployments:** Vercel also creates a separate URL for every branch and pull request (like `https://<your-app>-git-<branch>-<you>.vercel.app`). Those aren't in `FRONTEND_ORIGIN`, so the API blocks them. Add a preview URL to the list if you need to test one.

---

## 5. Check that everything works

1. Open `https://<your-app>.vercel.app`. You should see the login page.
2. **Sign up** for a new account. You should land on the dashboard.
3. Create, edit and delete a task.
4. Go to the Tasks page and press **F5**. The page should reload, not show a Vercel "404: NOT_FOUND" page.
5. Log out and log back in.

If something fails, open your browser's developer tools (**F12**) and look at the **Console** and **Network** tabs, then check the table below.

---

## Free tiers: the first request can be slow

Free hosting plans save resources by pausing apps that aren't being used:

- **Render (API):** a free web service **goes to sleep after about 15 minutes without requests**. The next request wakes it up, which can take **up to a minute**. During that time the app may look stuck on a loading spinner, or logging in may take a long time. After that, it's fast again until the next idle period.
- **Vercel (frontend):** doesn't sleep; the page itself always loads quickly.
- **MongoDB Atlas:** free clusters stay on while they're being used, but Atlas may pause one after a long period with no connections. If that happens, resume it from the Atlas dashboard.

If you share a demo link, warn people that the first load may take up to a minute. To wake the API up in advance, open `https://<your-api>.onrender.com/api/v1/health` and wait for it to answer.

---

## Environment variable reference

### API (`server/`, set in Render)

| Variable | Required | Example | What it is |
|----------|----------|---------|------------|
| `MONGO_URI` | **Yes** | `mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/taskflow?...` | Database connection string. The server won't start without it. |
| `JWT_SECRET` | **Yes** | 64 random hex characters | Secret used to sign login tokens. The server won't start without it. Changing it logs everyone out. |
| `JWT_EXPIRES_IN` | No | `7d` | How long a login lasts (`1h`, `7d`, …). Default: `7d`. |
| `FRONTEND_ORIGIN` | No | `https://my-app.vercel.app,http://localhost:3000` | Comma-separated list of frontend URLs allowed to call the API. Default: `http://localhost:3000`. |
| `PORT` | No | `5000` | Port to listen on. **Set automatically by Render.** Default: `5000`. |
| `NODE_VERSION` | No | `24` | Render-only: which Node.js version to use. |

### Frontend (`client/`, set in Vercel)

| Variable | Required | Example | What it is |
|----------|----------|---------|------------|
| `VITE_API_URL` | **Yes** | `https://my-api.onrender.com/api/v1` | API base URL, including `/api/v1`. Built into the app, so **redeploy after changing it**. |

Never commit real values. Local `.env` files are ignored by git; on Render and Vercel, values are entered in their dashboards.

---

## Troubleshooting

| What you see | Likely cause | Fix |
|--------------|--------------|-----|
| Render log: `❌ Missing required environment variable(s): ...` | A required variable isn't set on Render | Add it under **Environment**, then redeploy. |
| Render log: `❌ MongoDB connection error: ... bad auth` / `authentication failed` | Wrong database username or password, or special characters not URL-encoded | Check the user in Atlas *Database Access*; use a letters-and-numbers password. |
| Render log: `❌ MongoDB connection error` after about 10 seconds, mentioning a timeout or server selection | Atlas is blocking Render's IP address | Add `0.0.0.0/0` in Atlas *Network Access*. |
| Browser console: `blocked by CORS policy` / `No 'Access-Control-Allow-Origin' header` | Your Vercel URL isn't in `FRONTEND_ORIGIN` | Add the exact URL (`https://...vercel.app`, no trailing `/`) on Render and save. |
| Login fails; the Network tab shows requests going to your Vercel URL (like `https://<your-app>.vercel.app/auth/login`) or a `Network Error` | `VITE_API_URL` is missing or wrong on Vercel | Set it to `https://<your-api>.onrender.com/api/v1`, then **redeploy** on Vercel. |
| Browser console: `Mixed Content` error | `VITE_API_URL` starts with `http://` | Use `https://`, then redeploy on Vercel. |
| Vercel `404: NOT_FOUND` when refreshing a page like `/tasks` | Vercel's Root Directory isn't `client`, so `client/vercel.json` isn't used | Set Root Directory to `client` and redeploy. |
| Everything works, but the first request takes 30–60 seconds | The Render free service was asleep | Expected on the free tier; see [above](#free-tiers-the-first-request-can-be-slow). |
| Logged out right after deploying the API | `JWT_SECRET` changed, so old login tokens are no longer valid | Log in again. |
