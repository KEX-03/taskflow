import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import api, { setUnauthorizedHandler } from "../utils/api.js";
import { useToast } from "../components/Shared/Toast.jsx";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const sessionExpiredRef = useRef(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // ── On mount — restore session if token exists ──
  const restoreSession = useCallback(async () => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/me");
      sessionExpiredRef.current = false;
      setUser(data.user);
      setToken(savedToken);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ── Logout ──────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  // ── Expired session — same logout as the button, then redirect and toast ──
  // The handler is only registered while a user is logged in, so a failed
  // login/signup (or the /me check on page load) never shows this message.
  useEffect(() => {
    if (loading || !token) return undefined;

    const handleUnauthorized = () => {
      if (sessionExpiredRef.current) return;
      sessionExpiredRef.current = true;
      logout();
      addToast("Your session has expired. Please log in again.", "error");
      navigate("/login", { replace: true });
    };

    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [loading, token, logout, addToast, navigate]);

  // ── Signup ──────────────────────────────
  const signup = async ({ name, email, password }) => {
    const { data } = await api.post("/auth/signup", { name, email, password });
    sessionExpiredRef.current = false;
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // ── Login ───────────────────────────────
  const login = async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    sessionExpiredRef.current = false;
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  // ── Update local user after profile edit ─
  const updateLocalUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, login, logout, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
