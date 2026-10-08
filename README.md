# TaskFlow — Auth + Dashboard App

A full-stack web application featuring authentication, a task-management dashboard, and full CRUD — built with **React + Node.js + MongoDB**.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, TailwindCSS, Vite |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB (Mongoose ODM)              |
| Auth       | JWT (jsonwebtoken), bcryptjs        |
| Logging    | Morgan                              |

---

## Setup & Run

### Prerequisites
- Node.js 20.19+ or 22.12+ (required by Vite)
- MongoDB running locally **or** a MongoDB Atlas URI
- npm / yarn

---

### 1. Clone the repo
```bash
git clone https://github.com/KEX-03/taskflow.git
cd taskflow
```

---

### 2. Backend Setup (`admin`)

```bash
cd admin
cp .env.example .env          # then edit .env with your values
npm install
npm run dev                   # starts on http://localhost:5000
```

#### `.env` variables
| Variable         | Description                              | Default               |
|------------------|------------------------------------------|-----------------------|
| `PORT`           | Server port                              | `5000`                |
| `MONGO_URI`      | MongoDB connection string                | `mongodb://localhost:27017/auth_dashboard_db` |
| `JWT_SECRET`     | Secret key for signing JWTs              | *(must set)*          |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`, `1h`)           | `7d`                  |
| `FRONTEND_ORIGIN`| CORS allowed origin                      | `http://localhost:3000` |

---

### 3. Frontend Setup (`app`)

In a second terminal (keep the backend running):

```bash
cd app
cp .env.example .env          # sets VITE_API_URL=http://localhost:5000/api/v1
npm install
npm run dev                   # starts on http://localhost:3000
```

`VITE_API_URL` is required — it's the backend's base URL including `/api/v1`. Change it if your backend runs elsewhere, then restart `npm run dev` (Vite only reads `.env` on startup).

Both `npm run dev` and `npm run preview` always use port `3000` to match the backend's default `FRONTEND_ORIGIN`; if that port is taken they exit with an error instead of switching ports (so stop one before starting the other).

| Script            | Description                                   |
|-------------------|-----------------------------------------------|
| `npm run dev`     | Start the dev server on http://localhost:3000 |
| `npm run build`   | Build for production into `dist/`             |
| `npm run preview` | Serve the `dist/` build on http://localhost:3000 |

---

## Demo Credentials / Seed

No seed script is required — simply **sign up** via the UI or use the signup API:

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Gorgan","email":"demo@example.com","password":"Demopass@1234"}'
```

Then log in with **demo@example.com / Demopass@1234**.

---

## Project Structure

```
taskflow/
├── admin/
│   ├── src/
│   │   ├── app.js              # Entry point
│   │   ├── config/db.js        # MongoDB connection
│   │   ├── middleware/auth.js   # JWT protect middleware
│   │   ├── models/             # Mongoose schemas (User, Task)
│   │   ├── controllers/        # Business logic
│   │   ├── routes/             # Express routers
│   │   └── utils/              # Helpers (token, errorHandler)
│   ├── package.json
│   └── .env.example
├── app/
│   ├── src/
│   │   ├── index.jsx           # Entry point
│   │   ├── App.jsx             # Root routes
│   │   ├── context/            # React Context (Auth)
│   │   ├── pages/              # Login, Signup, Dashboard, Tasks, Profile
│   │   ├── components/         # Sidebar, Toast, Spinner, ProtectedRoute
│   │   └── utils/              # Axios instance, validation helpers
│   ├── index.html              # Vite HTML entry
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## API Endpoints

| Method | Endpoint               | Auth | Description            |
|--------|------------------------|------|------------------------|
| POST   | `/api/v1/auth/signup`  | —    | Register               |
| POST   | `/api/v1/auth/login`   | —    | Login → returns JWT    |
| POST   | `/api/v1/auth/logout`  | ✓    | Logout (client-side)   |
| GET    | `/api/v1/me`           | ✓    | Get current profile    |
| PUT    | `/api/v1/me`           | ✓    | Update profile / pw    |
| POST   | `/api/v1/tasks`        | ✓    | Create task            |
| GET    | `/api/v1/tasks`        | ✓    | List tasks (search/filter) |
| GET    | `/api/v1/tasks/:id`    | ✓    | Get single task        |
| PUT    | `/api/v1/tasks/:id`    | ✓    | Update task            |
| DELETE | `/api/v1/tasks/:id`    | ✓    | Delete task            |

---

## Deployment

This project is live, deployed as follows:

- **Frontend (`app`)** — deployed on **Vercel**. Connected directly to the `app` folder of this repo; every push to `main` triggers an automatic build and deploy. Vercel uses the **Vite** framework preset (build command `npm run build`, output directory `dist`). The `VITE_API_URL` environment variable is set in the Vercel project settings to point at the production backend URL; it is baked in at build time, so changing it requires a redeploy.
- **Backend (`admin`)** — deployed on **Render** as a web service. Connected to the `admin` folder of this repo, with `npm install` as the build command and `npm run start` (or `npm run dev` equivalent for production) as the start command. All `.env` variables (`MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_ORIGIN`, `PORT`) are configured in Render's environment variable dashboard, with `FRONTEND_ORIGIN` set to the deployed Vercel URL for CORS.
- **Database** — MongoDB Atlas, used as the production database for the Render-hosted backend.

### Deployment steps (summary)
1. Push the repo to GitHub.
2. On **Render**: create a new Web Service, point it at the `admin` folder, set the build/start commands, and add the environment variables from `.env.example`.
3. On **Vercel**: import the repo, set the root directory to `app`, choose the **Vite** framework preset, and add `VITE_API_URL` pointing to the Render backend's public URL (including `/api/v1`).
4. Update `FRONTEND_ORIGIN` on Render to match the live Vercel domain once it's issued.
5. Redeploy both services to pick up the final environment variables.

---

## How Would I Scale This for Production?

1. **Deployment** — Containerise with Docker; deploy backend on Railway / Fly.io / AWS ECS; host React on Vercel / Netlify with env-based API URLs.
2. **CORS & Security** — Lock `CORS origin` to the production domain; use `Helmet.js` for security headers; move secrets to a secrets manager (AWS SSM / Doppler).
3. **Database** — Add indexes on frequently queried fields (already done for `tasks.owner`); use MongoDB Atlas with connection pooling; consider read replicas at scale.
4. **Caching** — Layer Redis in front of hot endpoints (e.g. profile fetch); cache task lists with short TTLs.
5. **Auth Hardening** — Implement refresh-token rotation with httpOnly cookies; add rate-limiting (`express-rate-limit`) on auth routes.
6. **Observability** — Swap `morgan` for structured JSON logs (Winston / Pino); integrate with a log aggregator (Datadog / Grafana Loki).
7. **CI/CD** — GitHub Actions pipeline: lint → test → build → deploy on push to `main`.
