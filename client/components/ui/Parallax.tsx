"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export function Parallax({
  children,
  className,
  speed = 0.1,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `-${speed * 100}%`]);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div style={reduced ? undefined : { y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
