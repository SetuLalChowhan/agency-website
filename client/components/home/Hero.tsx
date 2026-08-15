"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EASE } from "@/lib/animations";
import { Asterisk } from "@/components/ui/Asterisk";
import { Magnetic } from "@/components/ui/Magnetic";
import type { CmsSection } from "@/lib/cms";

const READY_EVENT = "kern:ready";

type HeroLine = { title?: string; mark?: string };

export function Hero({ content }: { content?: CmsSection }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onReady = () => setReady(true);
    window.addEventListener(READY_EVENT, onReady);
    const fallback = window.setTimeout(onReady, 3200);
    return () => {
      window.removeEventListener(READY_EVENT, onReady);
      window.clearTimeout(fallback);
    };
  }, []);

  const anim = ready && !reduced;

  const lines: HeroLine[] = content?.items?.length
    ? (content.items as HeroLine[])
    : [
        { title: "We create" },
        { title: "Digital experiences", mark: "accent" },
        { title: "That move people." },
      ];
  const eyebrow = content?.eyebrow ?? "Independent digital studio — Dhaka / Worldwide";
  const body =
    content?.body ??
    "Strategy, design and technology for ambitious brands — from Dhaka to everywhere.";
  const cta = content?.cta ?? { label: "Explore our work", href: "/work" };
  const secondaryCta = content?.secondaryCta ?? { label: "Start a project", href: "/contact" };
  const facts = (content?.meta?.facts as Array<{ label?: string; value?: string }> | undefined) ?? [
    { label: "Location", value: "Dhaka — Worldwide" },
    { label: "Founded", value: "2014" },
    { label: "Team", value: "14 people" },
  ];

  // Pointer parallax — subtle drift of the background art.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 36, damping: 20, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 36, damping: 20, mass: 0.6 });
  const artX = useTransform(sx, (v) => v * 1.4);
  const artY = useTransform(sy, (v) => v * 1.4);
  const accentX = useTransform(sx, (v) => v * -2.2);
  const accentY = useTransform(sy, (v) => v * -2.2);

  // Scroll parallax — headline drifts up and fades as you leave the hero.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const headY = useTransform(scrollYProgress, [0, 1], [0, -110]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);
  const sideY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      px.set((e.clientX / window.innerWidth - 0.5) * 26);
      py.set((e.clientY / window.innerHeight - 0.5) * 26);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [px, py, reduced]);

  return (
    <section
      ref={sectionRef}
      aria-label="Introduction"
      className="relative flex flex-col justify-start overflow-hidden px-5 pb-16 pt-24 md:min-h-svh md:justify-end md:pb-14 md:pt-40"
    >
      {/* --- Background --- */}
      <div aria-hidden="true" className="absolute inset-0">
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_74%_16%,color-mix(in_srgb,var(--color-acid)_9%,transparent),transparent_65%)]"
          initial={anim ? { opacity: 0 } : false}
          animate={anim ? { opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <div className="absolute inset-y-0 left-0 right-0 mx-auto hidden max-w-[1600px] md:block">
          {[25, 50, 75].map((p) => (
            <div key={p} className="absolute inset-y-0 w-px bg-paper/[0.05]" style={{ left: `${p}%` }} />
          ))}
        </div>
        <motion.div style={{ x: artX, y: artY }} className="absolute -right-20 -top-24 md:right-[4%] md:top-0">
          <motion.div
            initial={anim ? { opacity: 0, scale: 0.9, rotate: -30 } : false}
            animate={anim ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 1.6, ease: EASE, delay: 0.15 }}
          >
            <Asterisk className="h-[42vw] w-[42vw] max-h-[30rem] max-w-[30rem] animate-spin-slower text-paper/[0.045]" />
          </motion.div>
        </motion.div>
      </div>

      {/* --- Content --- */}
      <div className="relative z-10 mx-auto w-full max-w-[1920px]">
        {/* Label */}
        <motion.div
          initial={anim ? { opacity: 0, y: 16 } : false}
          animate={anim ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: EASE, delay: 0.18 }}
          className="flex items-center gap-3"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-acid" />
          <span className="meta-label text-smoke">{eyebrow}</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          style={reduced ? { lineHeight: 1.08 } : { y: headY, opacity: headOpacity, lineHeight: 1.08 }}
          className="display mt-8 text-[clamp(1.7rem,8.4vw,9.8rem)]"
        >
          {lines.map((line, i) => (
            <Line key={i} show={anim} delay={0.3 + i * 0.12}>
              {line.mark === "accent" ? (
                <em className="font-accent normal-case italic tracking-normal text-acid">{line.title}</em>
              ) : (
                line.title
              )}
            </Line>
          ))}
        </motion.h1>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col gap-10 md:mt-20 md:flex-row md:items-end md:justify-between">
          <motion.div
            initial={anim ? { opacity: 0, y: 30 } : false}
            animate={anim ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.78 }}
            className="max-w-md"
          >
            <p className="text-[15px] leading-relaxed text-smoke md:text-base">{body}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-5">
              <Magnetic strength={0.35}>
                <Link
                  href={cta.href ?? "/work"}
                  data-cursor="open"
                  className="group inline-flex items-center gap-2.5 bg-acid px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-paper"
                >
                  {cta.label ?? "Explore our work"}
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                </Link>
              </Magnetic>
              <Link
                href={secondaryCta.href ?? "/contact"}
                data-cursor="link"
                className="link-sweep py-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-paper/85 transition-colors duration-300 hover:text-paper"
              >
                {secondaryCta.label ?? "Start a project"}
              </Link>
            </div>
          </motion.div>

          <motion.ul
            style={reduced ? undefined : { y: sideY }}
            initial={anim ? { opacity: 0, y: 30 } : false}
            animate={anim ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.92 }}
            className="hidden shrink-0 flex-col gap-2.5 border-l border-paper/15 pl-6 md:flex"
          >
            {facts.map((fact) => (
              <li key={fact.label} className="flex items-baseline gap-4">
                <span className="meta-label w-16 text-stone">{fact.label}</span>
                <span className="text-sm text-paper/85">{fact.value}</span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Floating accent signature */}
        <motion.div
          style={{ x: accentX, y: accentY }}
          initial={anim ? { opacity: 0, scale: 0, rotate: -120 } : false}
          animate={anim ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 1.2, ease: EASE, delay: 0.66 }}
          className="pointer-events-none absolute -right-2 bottom-6 hidden md:block"
        >
          <motion.div
            animate={anim ? { y: [0, -8, 0] } : {}}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
          >
            <Asterisk className="h-10 w-10 text-acid" />
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={anim ? { opacity: 0 } : false}
        animate={anim ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="absolute bottom-8 right-8 z-10 hidden flex-col items-center gap-4 lg:flex"
      >
        <span className="meta-label text-[10px] text-smoke [writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-16 w-px overflow-hidden bg-paper/15">
          {anim && (
            <motion.span
              className="absolute left-0 top-0 h-5 w-px bg-acid"
              animate={{ y: [0, 64] }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
            />
          )}
        </span>
      </motion.div>
    </section>
  );
}

function Line({ show, delay, children }: { show: boolean; delay: number; children: ReactNode }) {
  return (
    <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
      <motion.span
        className="block will-change-transform"
        initial={show ? { y: "115%", rotate: 3, filter: "blur(8px)" } : false}
        animate={show ? { y: "0%", rotate: 0, filter: "blur(0px)" } : {}}
        transition={{ duration: 1.2, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}
