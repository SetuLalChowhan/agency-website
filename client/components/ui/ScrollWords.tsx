"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export type ScrollWord = { text: string; className?: string };

/**
 * Statement whose words brighten sequentially as the section
 * scrolls through the viewport — a reading rhythm, not a fade.
 */
export function ScrollWords({
  words,
  className,
  start = 0.1,
  end = 0.9,
}: {
  words: ScrollWord[];
  className?: string;
  start?: number;
  end?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.88", "end 0.45"] });

  if (reduced) {
    return (
      <span className={className}>
        {words.map((w, i) => (
          <span key={i} className={w.className}>
            {w.text}{" "}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span ref={ref} className={className} aria-label={words.map((w) => w.text).join(" ")}>
      {words.map((w, i) => {
        const r0 = start + ((end - start) * i) / words.length;
        const r1 = start + ((end - start) * (i + 1)) / words.length;
        return <Word key={i} word={w} progress={scrollYProgress} range={[r0, r1]} />;
      })}
    </span>
  );
}

function Word({
  word,
  progress,
  range,
}: {
  word: ScrollWord;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.13, 1]);
  const y = useTransform(progress, range, [16, 0]);

  return (
    <motion.span style={{ opacity, y }} className={cn("inline-block will-change-transform", word.className)} aria-hidden="true">
      {word.text}
      {"\u00A0"}
    </motion.span>
  );
}
