import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import Spinner from "../components/Shared/Spinner";

const NotFound = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* ── Subtle grid background ─────────── */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* ── Card ────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* ── Header ──────────────────── */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Page not found</h1>
          </div>

          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
