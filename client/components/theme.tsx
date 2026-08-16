"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "kern-site-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({ theme: "system", setTheme: () => {} });

function isTheme(v: string | null): v is Theme {
  return v === "light" || v === "dark" || v === "system";
}

function getStored(): Theme {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return isTheme(v) ? v : "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Lazy init from storage — the inline <script> in the layout already applied
  // it pre-paint to avoid a flash, so this matches on first render.
  const [theme, setThemeState] = useState<Theme>(() =>
    typeof window === "undefined" ? "system" : getStored()
  );

  // Apply the chosen theme to <html data-theme="..."> — the light palette in
  // globals.css keys off this attribute.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Keep tabs in sync when the preference changes elsewhere.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setThemeState(getStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, t);
    setThemeState(t);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
