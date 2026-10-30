import { Link } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/Shared/Spinner.jsx";

const NotFound = () => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      {/* ── Subtle grid background ─────────── */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(var(--color-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* ── Card ────────────────────────── */}
        <div className="bg-surface-card border border-border-subtle rounded-2xl p-8 shadow-2xl">
          {/* ── Header ──────────────────── */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text">Page not found</h1>
            <p className="text-text-muted text-sm mt-1">The page you're looking for doesn't exist.</p>
          </div>

          <Link
            to={user ? "/dashboard" : "/login"}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center"
          >
            {user ? "Go to Dashboard" : "Go to Login"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
