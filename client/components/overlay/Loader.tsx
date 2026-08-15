"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import { Asterisk } from "@/components/ui/Asterisk";
import { EASE } from "@/lib/animations";

const READY_EVENT = "kern:ready";

export function dispatchReady() {
  window.dispatchEvent(new Event(READY_EVENT));
}

export function Loader() {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const seen = sessionStorage.getItem("kern:seen");
    if (reduced || seen) {
      // Defer to the next frame so the loader unmounts after first paint.
      const id = requestAnimationFrame(() => {
        setGone(true);
        dispatchReady();
      });
      return () => cancelAnimationFrame(id);
    }

    const controls = animate(0, 100, {
      duration: 1.55,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => {
        // Let the hero start as the curtain begins to lift.
        dispatchReady();
        setExiting(true);
      },
    });

    const safety = window.setTimeout(() => {
      if (!exiting) {
        dispatchReady();
        setExiting(true);
      }
    }, 4000);

    return () => {
      controls.stop();
      window.clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  if (gone) return null;

  return (
    <AnimatePresence onExitComplete={() => setGone(true)}>
      {!exiting && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink px-5 py-6 md:px-10 md:py-8"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {/* Center mark */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
              className="relative"
            >
              <Asterisk className="h-16 w-16 text-acid md:h-24 md:w-24" />
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.45 }}
                className="display absolute left-1/2 top-full mt-4 -translate-x-1/2 text-xl text-paper md:text-2xl"
              >
                KERN®
              </motion.span>
            </motion.div>
          </div>

          {/* Top row */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="meta-label z-10 text-smoke"
          >
            Independent digital studio
          </motion.p>

          {/* Bottom row */}
          <div className="z-10 flex items-end justify-between">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="meta-label text-smoke"
            >
              Loading experience
            </motion.p>
            <div className="flex flex-col items-end gap-3">
              <div className="display text-6xl leading-none tracking-tighter text-paper md:text-8xl">
                {String(count).padStart(2, "0")}
                <span className="text-acid">%</span>
              </div>
              <div className="h-px w-44 bg-paper/15">
                <motion.div
                  className="h-full bg-acid"
                  style={{ width: `${count}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
