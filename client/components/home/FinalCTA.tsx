"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/data/site";
import { ScrollWords } from "@/components/ui/ScrollWords";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import type { CmsSection } from "@/lib/cms";

const DEFAULT_STATEMENT = [
  { text: "Have" },
  { text: "a" },
  { text: "project" },
  { text: "worth" },
  { text: "building?" },
];

export function FinalCTA({ content }: { content?: CmsSection }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const statement = content?.items?.length
    ? content.items.map((item) => ({
        text: item.title ?? "",
        className: item.mark === "accent" ? "font-accent normal-case italic tracking-normal text-acid" : undefined,
      }))
    : DEFAULT_STATEMENT;
  const eyebrow = content?.eyebrow ?? "06 / New business";
  const cta = content?.cta ?? { label: "Let's talk", href: "/contact" };
  const ring =
    (content?.meta?.ring as string) ??
    "START A PROJECT • WE REPLY WITHIN 48H • START A PROJECT • WE REPLY WITHIN 48H •";
  const email = content?.meta?.email as string | undefined;

  // Cursor-following circle
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const circleX = useSpring(cx, { stiffness: 40, damping: 18, mass: 0.8 });
  const circleY = useSpring(cy, { stiffness: 40, damping: 18, mass: 0.8 });

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      cx.set(e.clientX - rect.left - rect.width / 2);
      cy.set(e.clientY - rect.top - rect.height / 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [cx, cy, reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t hairline-d px-5 py-32 md:px-10 md:py-48"
      aria-label="Start a project"
    >
      {/* Cursor circle */}
      <motion.div
        aria-hidden="true"
        style={{ x: circleX, y: circleY }}
        className="pointer-events-none absolute left-1/2 top-1/2 hidden md:block"
      >
        <motion.div
          className="h-[42vmin] w-[42vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-acid/40"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Soft glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-acid)_8%,transparent),transparent_65%)]"
      />

      <div className="relative z-10 mx-auto flex max-w-[1920px] flex-col items-center text-center">
        <Reveal>
          <span className="meta-label text-smoke">— {eyebrow} —</span>
        </Reveal>

        <ScrollWords
          className="display mt-8 block text-[clamp(2.4rem,7vw,7rem)] leading-[0.96] text-paper"
          words={statement}
        />

        <Reveal delay={0.15} className="mt-16">
          <Magnetic strength={0.45}>
            <Link
              href={cta.href ?? "/contact"}
              data-cursor="open"
              className="group relative inline-flex items-center gap-4 rounded-full border border-paper/30 px-10 py-5 transition-colors duration-300 hover:border-acid hover:bg-acid hover:text-ink md:px-12 md:py-6"
            >
              <span className="display text-xl md:text-2xl">{cta.label ?? "Let's talk"}</span>
              <ArrowUpRight className="h-6 w-6 transition-transform duration-300 group-hover:rotate-45" />
              {/* Rotating text ring */}
              <svg
                aria-hidden="true"
                viewBox="0 0 200 200"
                className="pointer-events-none absolute -inset-16 h-[280%] w-[280%] animate-spin-slower text-paper/35 transition-colors duration-300 group-hover:text-ink md:-inset-20"
              >
                <defs>
                  <path id="cta-ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
                </defs>
                <text fontSize="11.5" letterSpacing="3.5" fill="currentColor">
                  <textPath href="#cta-ring">{ring}</textPath>
                </text>
              </svg>
            </Link>
          </Magnetic>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="meta-label mt-12 text-smoke">
            Or write to{" "}
            <a href={`mailto:${email ?? site.email}`} data-cursor="link" className="link-sweep text-paper">
              {email ?? site.email}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
