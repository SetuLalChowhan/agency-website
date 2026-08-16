"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/cms";
import { HoverPreview } from "@/components/ui/HoverPreview";
import { cn } from "@/lib/utils/cn";

export function WorkList({
  projects,
  compact = false,
  className,
}: {
  projects: Project[];
  compact?: boolean;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);

  const handleHover = (slug: string | null) => {
    if (slug) setPreviewSlug(slug);
    setHovered(slug);
  };

  if (projects.length === 0) return null;

  const preview = projects.find((p) => p.slug === previewSlug) ?? projects[0];

  return (
    <div className={className}>
      <ul>
        {projects.map((p) => (
          <li key={p.slug}>
            <WorkRow project={p} compact={compact} onHover={handleHover} />
          </li>
        ))}
      </ul>
      <HoverPreview src={preview.art} alt={preview.title} active={hovered !== null} />
    </div>
  );
}

function WorkRow({
  project,
  compact,
  onHover,
}: {
  project: Project;
  compact: boolean;
  onHover: (slug: string | null) => void;
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      onMouseEnter={() => onHover(project.slug)}
      onMouseLeave={() => onHover(null)}
      data-cursor="view"
      className="group relative block border-t hairline-d transition-colors duration-500 last:border-b hover:bg-paper/[0.03]"
    >
      <div className="flex items-center gap-5 px-1 py-8 md:gap-10 md:py-11">
        <span className="meta-label w-8 flex-none text-smoke transition-colors duration-300 group-hover:text-acid">
          {project.index}
        </span>
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "display block truncate leading-none text-paper transition-all duration-500 group-hover:translate-x-2",
              compact ? "text-[clamp(1.7rem,3.6vw,3rem)]" : "text-[clamp(2rem,5vw,4.6rem)]"
            )}
          >
            {project.title}
          </span>
          <span className="meta-label mt-3 block text-smoke">
            {project.category} — {project.year}
          </span>
        </div>
        {!compact && (
          <span className="hidden max-w-[24ch] text-sm leading-relaxed text-smoke lg:block">
            {project.description}
          </span>
        )}
        <span className="relative flex h-10 w-10 flex-none items-center justify-center">
          <ArrowUpRight className="h-5 w-5 text-smoke transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-acid" />
        </span>
      </div>
      {/* Mobile art */}
      <div className="px-1 pb-8 md:hidden">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={project.art}
            alt={`${project.title} — ${project.category}`}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>
    </Link>
  );
}
