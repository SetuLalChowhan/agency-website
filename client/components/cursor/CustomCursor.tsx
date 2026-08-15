"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

type CursorMode = "default" | "view" | "open" | "drag" | "link";

const LABELS: Record<string, string> = {
  view: "VIEW",
  open: "OPEN",
  drag: "DRAG",
};

const MODE_SIZE: Record<CursorMode, number> = {
  default: 36,
  link: 52,
  view: 88,
  open: 88,
  drag: 88,
};

export function CustomCursor() {
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const ringX = useSpring(mx, { stiffness: 260, damping: 26, mass: 0.6 });
  const ringY = useSpring(my, { stiffness: 260, damping: 26, mass: 0.6 });
  const dotX = useSpring(mx, { stiffness: 900, damping: 40, mass: 0.2 });
  const dotY = useSpring(my, { stiffness: 900, damping: 40, mass: 0.2 });

  const [mode, setMode] = useState<CursorMode>("default");
  const [label, setLabel] = useState("");
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const val = (el?.getAttribute("data-cursor") as CursorMode) || "default";
      setMode(val);
      setLabel(el ? LABELS[val] ?? el.getAttribute("data-cursor-label") ?? "" : "");
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [mx, my]);

  const size = MODE_SIZE[mode];
  const filled = mode === "view" || mode === "open" || mode === "drag";

  return (
    <>
      {/* Ring */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[95] flex items-center justify-center rounded-full border"
        style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0 }}
        animate={{
          width: size,
          height: size,
          backgroundColor: filled ? "var(--color-acid)" : "rgba(212, 255, 71, 0)",
          borderColor: "var(--color-acid)",
          scale: pressed ? 0.82 : 1,
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink"
          style={{ opacity: label ? 1 : 0 }}
        >
          {label}
        </span>
      </motion.div>

      {/* Dot */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[95] h-1.5 w-1.5 rounded-full bg-acid"
        style={{ x: dotX, y: dotY, opacity: visible ? 1 : 0 }}
        animate={{ scale: filled ? 0 : 1, opacity: filled ? 0 : visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </>
  );
}
