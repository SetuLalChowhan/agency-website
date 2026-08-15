"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { EASE } from "@/lib/animations";

/**
 * A fixed-position image that follows the pointer while a list
 * row is hovered. Rendered once per list, driven by `active`.
 * Parents should keep `src` stable (the last hovered row) so the
 * fade-out never flashes empty.
 */
export function HoverPreview({ src, alt, active }: { src: string; alt: string; active: boolean }) {
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const x = useSpring(mx, { stiffness: 130, damping: 22, mass: 0.5 });
  const y = useSpring(my, { stiffness: 130, damping: 22, mass: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[55] hidden lg:block"
      style={{ x, y, opacity: active ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="-translate-x-1/2 -translate-y-1/2"
        animate={{ rotate: active ? 0 : -5, scale: active ? 1 : 0.85 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="relative aspect-[4/3] w-[26rem] overflow-hidden border border-paper/15 bg-ink-2">
          <Image src={src} alt={alt} fill sizes="26rem" className="object-cover" />
          <div className="absolute inset-0 bg-ink/10" />
        </div>
        <div className="mx-auto mt-2 flex w-max items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-acid" />
          <span className="meta-label text-[10px] text-smoke">{alt}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
