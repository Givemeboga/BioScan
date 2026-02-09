import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "bioscan_theme_mode"; // "light" | "dark"

export default function useThemeMode(defaultMode = "light") {
  const [mode, setMode] = useState(() => {
  
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved || defaultMode;
    } catch {
      return defaultMode;
    }
  });

  useEffect(() => {
    // set css class on <html> for global css theme
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark");
    root.classList.add(mode === "dark" ? "theme-dark" : "theme-light");
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode]);

  const toggle = useCallback(() => setMode((m) => (m === "dark" ? "light" : "dark")), []);

  return { mode, setMode, toggle };
}