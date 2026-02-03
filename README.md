# TaskFlow — Auth + Dashboard App

A full-stack web application featuring authentication, a task-management dashboard, and full CRUD — built with **React + Node.js + MongoDB**.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, React Router v6, TailwindCSS |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB (Mongoose ODM)              |
| Auth       | JWT (jsonwebtoken), bcryptjs        |
| Logging    | Morgan                              |

---

## Setup & Run

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally **or** a MongoDB Atlas URI
- npm / yarn

---

### 1. Clone the repo
```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

---

### 2. Backend Setup

```bash
cd backend
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

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start                     # starts on http://localhost:3000
```

> If your backend runs on a different port, create a `.env` file in `/frontend` with:
> ```
> REACT_APP_API_URL=http://localhost:5000/api/v1
> ```

---

## Demo Credentials / Seed

No seed script is required — simply **sign up** via the UI or use the signup API:

```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"Demo1234"}'
```

Then log in with **demo@example.com / Demo1234**.

---

## Project Structure

```
taskflow/
├── backend/
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
├── frontend/
│   ├── src/
│   │   ├── App.js              # Root routes
│   │   ├── context/            # React Context (Auth)
│   │   ├── pages/              # Login, Signup, Dashboard, Tasks, Profile
│   │   ├── components/         # Sidebar, Toast, Spinner, ProtectedRoute
│   │   └── utils/              # Axios instance, validation helpers
│   ├── tailwind.config.js
│   └── package.json
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

## How Would I Scale This for Production?

1. **Deployment** — Containerise with Docker; deploy backend on Railway / Fly.io / AWS ECS; host React on Vercel / Netlify with env-based API URLs.
2. **CORS & Security** — Lock `CORS origin` to the production domain; use `Helmet.js` for security headers; move secrets to a secrets manager (AWS SSM / Doppler).
3. **Database** — Add indexes on frequently queried fields (already done for `tasks.owner`); use MongoDB Atlas with connection pooling; consider read replicas at scale.
4. **Caching** — Layer Redis in front of hot endpoints (e.g. profile fetch); cache task lists with short TTLs.
5. **Auth Hardening** — Implement refresh-token rotation with httpOnly cookies; add rate-limiting (`express-rate-limit`) on auth routes.
6. **Observability** — Swap `morgan` for structured JSON logs (Winston / Pino); integrate with a log aggregator (Datadog / Grafana Loki).
7. **CI/CD** — GitHub Actions pipeline: lint → test → build → deploy on push to `main`.
