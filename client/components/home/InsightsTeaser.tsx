"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { articles as fallbackArticles, type Article } from "@/lib/data/insights";
import { HoverPreview } from "@/components/ui/HoverPreview";
import { Reveal } from "@/components/ui/Reveal";

export function InsightsTeaser({
  articles,
  showHeader = true,
}: {
  articles?: Article[];
  showHeader?: boolean;
}) {
  const list = articles && articles.length > 0 ? articles : fallbackArticles;
  const [hovered, setHovered] = useState<string | null>(null);
  const [previewSlug, setPreviewSlug] = useState(list[0].slug);

  const handleHover = (slug: string | null) => {
    if (slug) setPreviewSlug(slug);
    setHovered(slug);
  };

  const preview = list.find((a) => a.slug === previewSlug) ?? list[0];

  return (
    <section className="border-t hairline-d px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1920px]">
        {showHeader && <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                <span className="meta-label text-smoke">Thinking / Making / Exploring</span>
              </div>
              <h2 className="display mt-6 text-[clamp(2rem,4.6vw,4.4rem)] text-paper">
                Notes from the studio
              </h2>
            </div>
            <Link
              href="/insights"
              data-cursor="link"
              className="group inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-paper"
            >
              <span className="link-sweep">All articles</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
            </Link>
          </div>
        </Reveal>}

        <ul className="mt-12">
          {list.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/insights/${article.slug}`}
                onMouseEnter={() => handleHover(article.slug)}
                onMouseLeave={() => handleHover(null)}
                data-cursor="view"
                className="group relative block border-t hairline-d transition-colors duration-500 last:border-b hover:bg-paper/[0.03]"
              >
                <div className="flex flex-col gap-3 py-7 transition-[padding] duration-500 group-hover:md:pl-3 md:py-9">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="meta-label text-acid">{article.category}</span>
                    <span className="h-1 w-1 rounded-full bg-paper/25" />
                    <span className="meta-label text-smoke">
                      {article.date} — {article.readingTime}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-6">
                    <span className="display text-[clamp(1.5rem,3.1vw,2.7rem)] leading-tight text-paper transition-transform duration-500 group-hover:translate-x-1">
                      {article.title}
                    </span>
                    <ArrowUpRight className="h-5 w-5 flex-none text-smoke transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-acid" />
                  </div>
                  <p className="max-w-2xl text-sm leading-relaxed text-smoke">{article.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <HoverPreview src={preview.art} alt={preview.title} active={hovered !== null} />
    </section>
  );
}
