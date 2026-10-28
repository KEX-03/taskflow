import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/Shared/Toast.jsx";
import ProtectedRoute from "./components/Layout/ProtectedRoute.jsx";
import Sidebar from "./components/Layout/Sidebar.jsx";
import Topbar from "./components/Layout/Topbar.jsx";
import Spinner from "./components/Shared/Spinner.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashLayout = ({ children }) => (
  <div className="relative flex h-dvh overflow-hidden bg-surface">
    <div className="flex min-w-0 flex-1 flex-col md:flex-row">
      <div className="shrink-0 md:hidden">
        <Topbar />
      </div>

      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  </div>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Routes>

          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashLayout><Dashboard /></DashLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <DashLayout><Tasks /></DashLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashLayout><Profile /></DashLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
