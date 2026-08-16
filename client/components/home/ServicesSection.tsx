"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Service } from "@/lib/cms";
import { EASE } from "@/lib/animations";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/ui/Reveal";

type SectionHeaderContent = {
  eyebrow?: string;
  index?: string;
  heading?: string;
  body?: string;
};

export function ServicesSection({
  showHeader = true,
  services,
  header,
}: {
  showHeader?: boolean;
  services?: Service[];
  header?: SectionHeaderContent;
}) {
  const [active, setActive] = useState(0);
  const list = services ?? [];
  if (list.length === 0) return null;

  const activeIndex = Math.min(active, list.length - 1);

  return (
    <section id="services" className="border-t hairline-panel bg-panel px-5 py-24 text-panel-ink md:px-10 md:py-36">
      <div className="mx-auto max-w-[1920px]">
        {showHeader && (
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-acid" />
              <span className="meta-label text-stone">{header?.eyebrow ?? "What we do"}</span>
              <span className="h-px w-8 bg-panel-ink/20" />
              <span className="meta-label text-stone">{header?.index ?? "04 capabilities"}</span>
            </div>
            <h2 className="display mt-6 text-[clamp(2rem,4.6vw,4.4rem)] text-panel-ink">
              {header?.heading ?? "One standard of obsession"}
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-stone">
              {header?.body ??
                "Four disciplines, one team. Pick a single capability or hand us the whole product — the bar is the same."}
            </p>
          </Reveal>
        )}

        <div className="mt-14 md:mt-20">
          {list.map((service, i) => {
            const isActive = activeIndex === i;
            return (
              <div key={service.title} className="relative">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-expanded={isActive}
                  className={cn(
                    "group block w-full border-t hairline-panel text-left transition-colors duration-500 last:border-b",
                    isActive ? "bg-ink text-paper" : "hover:bg-panel-2"
                  )}
                >
                  <div className="flex items-center gap-5 px-4 py-7 md:gap-10 md:py-9">
                    <span
                      className={cn(
                        "meta-label w-10 flex-none transition-colors duration-300",
                        isActive ? "text-acid" : "text-stone"
                      )}
                    >
                      {service.index}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "display block text-[clamp(1.9rem,4.4vw,3.8rem)] leading-none transition-transform duration-500",
                          isActive ? "translate-x-2" : "group-hover:translate-x-1"
                        )}
                      >
                        {service.title}
                      </span>
                      <span
                        className={cn(
                          "meta-label mt-3 block transition-colors duration-300",
                          isActive ? "text-smoke" : "text-stone"
                        )}
                      >
                        {service.tagline}
                      </span>
                    </span>
                    {/* Plus / minus */}
                    <span className="relative h-8 w-8 flex-none" aria-hidden="true">
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-px w-full bg-current transition-transform duration-500",
                          isActive && "rotate-45"
                        )}
                      />
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-px w-full bg-current transition-transform duration-500",
                          isActive && "-rotate-45"
                        )}
                      />
                    </span>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.55, ease: EASE }}
                      className="overflow-hidden bg-ink text-paper"
                    >
                      <div className="grid gap-8 px-4 pb-12 pt-3 md:grid-cols-12 md:gap-10 md:px-14 md:pb-16 md:pt-6">
                        <p className="text-[15px] leading-relaxed text-paper/75 md:col-span-5">
                          {service.description}
                        </p>
                        <div className="md:col-span-3">
                          <p className="meta-label mb-4 text-stone">Capabilities</p>
                          <ul className="space-y-2.5">
                            {service.items.map((item) => (
                              <li key={item} className="flex items-center gap-3 text-sm text-paper/90">
                                <span className="h-1 w-1 rounded-full bg-acid" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="md:col-span-3">
                          <p className="meta-label mb-4 text-stone">How we work</p>
                          <ul className="space-y-2.5">
                            {service.tools.map((tool) => (
                              <li key={tool} className="meta-label !text-[11px] text-smoke">
                                {tool}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
