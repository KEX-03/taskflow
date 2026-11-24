import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Session-expiry callback — registered by AuthContext ──
// Kept out of React so this module can stay framework-agnostic.
let unauthorizedHandler = null;
let unauthorizedHandled = false;

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === "function" ? handler : null;
  unauthorizedHandled = false;
};

// Login and signup answer 401 for bad credentials, not for an expired session.
// Those requests keep showing their own form errors.
const isAuthRequest = (config) => {
  const url = config?.url || "";
  const method = (config?.method || "get").toLowerCase();
  if (method !== "post") return false;
  return ["/auth/login", "/auth/signup"].some(
    (path) => url === path || url.startsWith(`${path}?`)
  );
};

// ── Request interceptor — inject JWT ─────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Remember which session sent the request, so a late 401 from an old token
  // cannot log out a newer session that signed in while this one was in flight.
  config._authToken = token;
  return config;
});

// ── Response interceptor — handle 401 ────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // A request from a previous session may answer 401 after the user has
      // signed in again. Leave the new session's storage and handler alone.
      const isCurrentSession = err.config?._authToken === localStorage.getItem("token");
      if (isCurrentSession) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Several requests can expire together: run the logout/toast only once.
        if (unauthorizedHandler && !unauthorizedHandled && !isAuthRequest(err.config)) {
          unauthorizedHandled = true;
          unauthorizedHandler();
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
