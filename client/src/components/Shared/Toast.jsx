import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const bgMap = {
    success: "bg-emerald-600",
    error: "bg-red-600",
    info: "bg-primary-600",
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* ── Toast Container ────────────────── */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-xs w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${bgMap[t.type]} text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-slide-up flex items-center justify-between gap-3`}
          >
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="text-white/70 hover:text-white transition-colors">✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
};
