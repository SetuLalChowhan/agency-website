"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "kern-site-theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({ theme: "dark", setTheme: () => {} });

function isTheme(v: string | null): v is Theme {
  return v === "light" || v === "dark" || v === "system";
}

function getStored(): Theme {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return isTheme(v) ? v : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Apply the chosen theme to <html data-theme="..."> — the light palette in
  // globals.css keys off this attribute.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Hydrate React state from the stored preference after the first render.
  // Deferred a tick so the update lands outside the render/hydration pass
  // (the pre-paint script already applied <html data-theme> correctly).
  useEffect(() => {
    const adoptStored = () => setThemeState(getStored());
    const id = window.setTimeout(adoptStored, 0);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) adoptStored();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("storage", onStorage);
    };
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
