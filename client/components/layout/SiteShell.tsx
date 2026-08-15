"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LenisProvider } from "@/lib/lenis";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { NoiseOverlay } from "@/components/layout/NoiseOverlay";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Loader } from "@/components/overlay/Loader";

export function SiteShell({ children }: { children: ReactNode }) {
  const [cursorActive, setCursorActive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fine && !reduced) {
      const id = requestAnimationFrame(() => {
        document.documentElement.classList.add("kern-cursor");
        setCursorActive(true);
      });
      return () => {
        cancelAnimationFrame(id);
        document.documentElement.classList.remove("kern-cursor");
      };
    }
  }, []);

  return (
    <LenisProvider>
      {cursorActive && <CustomCursor />}
      <NoiseOverlay />
      <ScrollProgress />
      <Loader />
      {children}
    </LenisProvider>
  );
}
