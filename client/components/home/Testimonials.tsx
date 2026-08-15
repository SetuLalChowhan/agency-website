"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { testimonials as fallbackTestimonials, type Testimonial } from "@/lib/data/testimonials";
import { EASE } from "@/lib/animations";
import { Reveal } from "@/components/ui/Reveal";

export function Testimonials({ items, eyebrow }: { items?: Testimonial[]; eyebrow?: string }) {
  const testimonials = items && items.length > 0 ? items : fallbackTestimonials;
  const [[index, dir], setIndex] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  const paginate = useCallback((d: number) => {
    setIndex(([i]) => [(i + d + testimonials.length) % testimonials.length, d]);
  }, [testimonials.length]);

  // Autoplay
  useEffect(() => {
    if (paused || reduced) return;
    const t = window.setInterval(() => paginate(1), 9000);
    return () => window.clearInterval(t);
  }, [paused, reduced, paginate, index]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paginate(-1);
      if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paginate]);

  const t = testimonials[index];
  const initials = t.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <section
      className="border-t hairline-d px-5 py-24 md:px-10 md:py-36"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1920px]">
        <div className="flex items-center justify-between gap-6">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-acid" />
              <span className="meta-label text-smoke">{eyebrow ?? "Client words"}</span>
            </div>
          </Reveal>
          <div className="hidden items-center gap-6 md:flex">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous testimonial"
              data-cursor="link"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper transition-colors duration-300 hover:border-acid hover:bg-acid hover:text-ink"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
            </button>
            <span className="meta-label text-smoke">
              {String(index + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next testimonial"
              data-cursor="link"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper transition-colors duration-300 hover:border-acid hover:bg-acid hover:text-ink"
            >
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        <div className="mt-14 md:mt-20" data-cursor="drag">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.figure
              key={index}
              custom={dir}
              initial={reduced ? false : { opacity: 0, x: dir * 70 }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -70 }}
              transition={{ duration: 0.65, ease: EASE }}
              drag={reduced ? undefined : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.1}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) paginate(1);
                else if (info.offset.x > 60) paginate(-1);
              }}
              className="max-w-5xl select-none"
            >
              <blockquote>
                <span aria-hidden="true" className="display block text-acid">
                  “
                </span>
                <p className="display -mt-6 text-[clamp(1.5rem,3.4vw,2.9rem)] leading-[1.12] text-paper">
                  {t.quote}
                </p>
              </blockquote>
              <figcaption className="mt-12 flex items-center gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-paper/20 font-mono text-xs text-acid">
                  {initials}
                </span>
                <span>
                  <span className="block text-sm font-medium text-paper">{t.name}</span>
                  <span className="meta-label mt-1 block text-smoke">
                    {t.role} — {t.company}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Mobile controls */}
        <div className="mt-10 flex items-center justify-between md:hidden">
          <span className="meta-label text-smoke">
            {String(index + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/25"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next testimonial"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/25"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
