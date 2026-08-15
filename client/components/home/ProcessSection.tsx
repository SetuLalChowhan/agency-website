"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll } from "framer-motion";
import { processSteps as fallbackSteps, type ProcessStep } from "@/lib/data/process";
import { EASE } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/ui/Reveal";

export function ProcessSection({
  steps,
  eyebrow,
  heading,
}: {
  steps?: ProcessStep[];
  eyebrow?: string;
  heading?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const list = steps && steps.length > 0 ? steps : fallbackSteps;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.7", "end 0.7"],
  });

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const unsub = scrollYProgress.on("change", (v) => {
      const idx = Math.min(list.length - 1, Math.max(0, Math.floor(v * list.length)));
      setActive(idx);
    });
    return unsub;
  }, [scrollYProgress, reduced, list.length]);

  return (
    <section ref={sectionRef} className="border-t hairline-d px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1920px] gap-16 md:grid-cols-12">
        {/* Sticky intro */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                <span className="meta-label text-smoke">{eyebrow ?? "How we work"}</span>
              </div>
              <h2 className="display mt-6 text-[clamp(2rem,4.2vw,3.8rem)] text-paper">
                {heading ??
                  (<>From brief<br />to launch,<br />in five steps.</>)}
              </h2>
            </Reveal>

            {/* Progress line */}
            <div className="relative mt-12 h-px bg-paper/15">
              <motion.div
                className="absolute inset-y-0 left-0 bg-acid"
                style={{ scaleX: reduced ? 1 : scrollYProgress, transformOrigin: "left" }}
              />
            </div>
            <p className="meta-label mt-5 text-smoke">
              Step {String(active + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")} —{" "}
              {list[active].title.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Steps */}
        <ol className="md:col-span-7">
          {list.map((step, i) => {
            const isActive = active === i;
            return (
              <li
                key={step.index}
                className={cn(
                  "relative border-t hairline-d py-10 transition-opacity duration-500 first:border-t-0 md:py-14",
                  isActive ? "opacity-100" : "opacity-40"
                )}
              >
                <div className="flex items-start gap-6 md:gap-10">
                  <span
                    className={cn(
                      "display flex-none text-5xl leading-none transition-colors duration-500 md:text-7xl",
                      isActive ? "text-acid" : "text-stroke"
                    )}
                  >
                    {step.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={cn(
                        "display text-3xl transition-all duration-500 md:text-5xl",
                        isActive ? "translate-x-2 text-paper" : "text-smoke"
                      )}
                    >
                      {step.title}
                    </h3>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.5, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-xl pt-4 text-[15px] leading-relaxed text-smoke">
                            {step.detail}
                          </p>
                          <p className="meta-label pt-5 text-acid">
                            Deliverables — {step.deliverables.join(" / ")}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
