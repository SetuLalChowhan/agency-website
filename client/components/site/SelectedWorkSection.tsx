import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/cms";
import { WorkList } from "@/components/projects/WorkList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { CmsSection } from "@/lib/cms";

export function SelectedWorkSection({
  projects,
  content,
}: {
  projects?: Project[];
  content?: CmsSection;
}) {
  const list = projects ?? [];
  if (list.length === 0) return null;
  const featured = list.filter((p) => p.featured);
  const right = content?.meta?.right as string | undefined;

  return (
    <section className="border-t hairline-d px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1920px]">
        <SectionHeader
          label={content?.eyebrow ?? "Selected work"}
          index={content?.index ?? `0${featured.length} — 2023 → 2026`}
          title={content?.heading ?? "Chosen, not everything"}
          right={right ? <span className="meta-label">{right}</span> : undefined}
        />
        <WorkList projects={featured} compact className="mt-12 md:mt-16" />
        <div className="mt-14">
          <Link
            href="/work"
            data-cursor="link"
            className="group inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.15em] text-paper"
          >
            <span className="link-sweep">View all projects — 0{list.length}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
          </Link>
        </div>
      </div>
    </section>
  );
}
