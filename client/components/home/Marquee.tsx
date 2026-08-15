"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Asterisk } from "@/components/ui/Asterisk";
import { cn } from "@/lib/utils/cn";

export function Marquee({
  items,
  className,
  reverse = false,
  speed = 1,
  size = "lg",
}: {
  items: readonly string[];
  className?: string;
  reverse?: boolean;
  speed?: number;
  size?: "lg" | "sm";
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [copyWidth, setCopyWidth] = useState(0);
  const lastScroll = useRef(0);
  const hovering = useRef(false);
  const reduced = useReducedMotion();
  const displayX = useTransform(x, (v) => (reverse ? v : -v));

  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (el) setCopyWidth(el.scrollWidth / 2);
    };
    measure();
    const t = window.setTimeout(measure, 500); // re-measure after fonts settle
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduced || !copyWidth) return;
    const dt = Math.min(delta / 16.667, 3);
    const sy = window.scrollY;
    const vel = sy - lastScroll.current;
    lastScroll.current = sy;
    const boost = Math.min(Math.max(vel * 0.014, -1.3), 1.3);
    const factor = Math.max(hovering.current ? 0.12 : 1 + boost, 0.04);
    const dir = reverse ? 1 : -1;
    let v = x.get() + dir * 1.7 * speed * dt * factor;
    v = ((v % copyWidth) + copyWidth) % copyWidth;
    x.set(v);
  });

  const itemsToRender = size === "sm" ? [...items, ...items] : items;

  return (
    <div
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => (hovering.current = true)}
      onMouseLeave={() => (hovering.current = false)}
    >
      <motion.div ref={trackRef} style={{ x: displayX }} className="flex w-max">
        <RowContent items={itemsToRender} size={size} />
        <RowContent items={itemsToRender} size={size} />
      </motion.div>
    </div>
  );
}

function RowContent({ items, size }: { items: readonly string[]; size: "lg" | "sm" }) {
  return (
    <div className="flex w-max flex-none items-center" aria-hidden="true">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex items-center">
          <span
            className={cn(
              "display whitespace-nowrap leading-none",
              size === "lg" ? "text-[11vw] md:text-[5.2vw]" : "text-[6.5vw] md:text-[1.8vw]"
            )}
          >
            {item}
          </span>
          <Asterisk
            className={cn(
              "text-acid",
              size === "lg" ? "mx-8 h-5 w-5 md:mx-12 md:h-8 md:w-8" : "mx-5 h-3 w-3 md:mx-7 md:h-4 md:w-4"
            )}
          />
        </span>
      ))}
    </div>
  );
}
