"use client";

import { site } from "@/lib/data/site";
import { Counter } from "@/components/ui/Counter";
import { cn } from "@/lib/utils/cn";

export type StatItem = { value: number | string; suffix?: string; label: string };

const FALLBACK: StatItem[] = site.stats as unknown as StatItem[];

export function StatsSection({ stats }: { stats?: StatItem[] }) {
  const list = stats && stats.length > 0 ? stats : FALLBACK;

  return (
    <section className="border-t hairline-panel bg-panel text-panel-ink" aria-label="Studio statistics">
      <div className="mx-auto grid max-w-[1920px] grid-cols-2 md:grid-cols-4">
        {list.map((stat, i) => {
          const numeric = typeof stat.value === "number" ? stat.value : Number(String(stat.value).replace(/[^\d.-]/g, ""));
          return (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col gap-3 px-6 py-14 md:px-10 md:py-20",
                i % 2 === 1 && "border-l hairline-panel",
                i >= 2 && "border-t hairline-panel md:border-t-0",
                i === 1 && "md:border-l-0",
                i === 2 && "md:border-l hairline-panel"
              )}
            >
              <p className="display text-[clamp(2.6rem,5vw,4.4rem)] text-panel-ink">
                <Counter value={Number.isFinite(numeric) ? numeric : 0} suffix={stat.suffix ?? ""} />
              </p>
              <p className="meta-label text-stone">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
