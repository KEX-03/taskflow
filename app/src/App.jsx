import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ToastProvider } from "./components/Shared/Toast.jsx";
import ProtectedRoute from "./components/Layout/ProtectedRoute.jsx";
import Sidebar from "./components/Layout/Sidebar.jsx";
import Spinner from "./components/Shared/Spinner.jsx";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Tasks from "./pages/Tasks.jsx";
import Profile from "./pages/Profile.jsx";

const AuthRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner fullPage />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashLayout = ({ children }) => (
  <div className="flex h-screen bg-slate-950 relative">
    <Sidebar />
    <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
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
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
