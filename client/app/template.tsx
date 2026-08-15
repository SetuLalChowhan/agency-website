"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations";

// Module flag — persists across client navigations, so the wipe only plays
// on route changes, never on the initial load (the Loader owns that moment).
let firstLoad = true;

export default function Template({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const playWipe = !reduced && !firstLoad;

  useEffect(() => {
    firstLoad = false;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: playWipe ? 0.24 : 0 }}
    >
      {playWipe && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[94] bg-ink"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
        />
      )}
      {children}
    </motion.div>
  );
}
