"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import { projects as fallbackProjects, type Project } from "@/lib/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import type { CmsSection } from "@/lib/cms";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HorizontalProjects({
  projects,
  content,
}: {
  projects?: Project[];
  content?: CmsSection;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const list = projects && projects.length > 0 ? projects : fallbackProjects;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current;
        const section = sectionRef.current;
        if (!track || !section) return;

        const getDistance = () => track.scrollWidth - window.innerWidth;

        const tween = gsap.to(track, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getDistance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-t hairline-d bg-ink">
      <div
        ref={trackRef}
        className="flex w-full flex-col gap-10 px-5 pb-16 pt-20 md:h-screen md:w-max md:flex-row md:items-center md:gap-16 md:px-10 md:pb-0 md:pt-0"
      >
        {/* Intro panel */}
        <div className="flex w-full flex-col justify-center md:w-[36vw] md:flex-none">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-acid" />
              <span className="meta-label text-smoke">{content?.eyebrow ?? "Portfolio — in motion"}</span>
            </div>
            <h2 className="display mt-6 text-[clamp(2rem,4.6vw,4.2rem)] text-paper">
              {content?.heading ?? (
                <>
                  Fresh from
                  <br />
                  the studio
                </>
              )}
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-smoke">
              {content?.body ??
                "A rotating window into what we shipped this year — selected by the team, not by the algorithm."}
            </p>
            <p className="meta-label mt-10 hidden items-center gap-2 text-smoke md:flex">
              Scroll
              <ArrowUpRight className="h-4 w-4 text-acid" />
            </p>
          </Reveal>
        </div>

        {/* Project cards */}
        {list.map((p) => (
          <MiniCard key={p.slug} project={p} />
        ))}

        {/* End card */}
        <div className="flex w-full flex-none items-center justify-center py-6 md:w-[32vw] md:py-0">
          <Link
            href={content?.cta?.href ?? "/work"}
            data-cursor="open"
            className="group flex h-44 w-44 flex-col items-center justify-center gap-3 rounded-full border border-paper/25 text-center transition-colors duration-300 hover:border-acid hover:bg-acid hover:text-ink md:h-52 md:w-52"
          >
            <span className="display text-base tracking-wide">{content?.cta?.label ?? "All projects"}</span>
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
            <span className="meta-label text-[10px] opacity-60">0{list.length} — 2023 → 2026</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function MiniCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="view"
      className="group block w-full flex-none md:w-[42vw] lg:w-[38vw]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={project.art}
          alt={`${project.title} — ${project.category}`}
          fill
          sizes="(min-width: 768px) 42vw, 100vw"
          className="object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.06]"
        />
        <span className="meta-label absolute left-4 top-4 bg-ink/60 px-2.5 py-1.5 text-[10px] text-paper backdrop-blur-sm">
          {project.category}
        </span>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <span className="display text-2xl text-paper md:text-3xl">{project.title}</span>
        <span className="meta-label text-smoke">{project.year}</span>
      </div>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-smoke">{project.description}</p>
    </Link>
  );
}
