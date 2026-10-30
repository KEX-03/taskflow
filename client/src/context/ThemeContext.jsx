import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "taskflow-theme";
const ThemeContext = createContext(null);

const isTheme = (value) => value === "light" || value === "dark";

const getInitialTheme = () => {
  const initialTheme = document.documentElement.dataset.theme;
  if (isTheme(initialTheme)) return initialTheme;

  try {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      } catch {
        // Theme changes still apply when storage is unavailable.
      }
      return nextTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be inside <ThemeProvider>");
  return context;
};
