"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/ui/Reveal";

export function SectionHeader({
  label,
  index,
  title,
  right,
  className,
  light = false,
}: {
  label: string;
  index?: string;
  title?: ReactNode;
  right?: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      <Reveal>
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-acid" />
            <span className={cn("meta-label", light ? "text-stone" : "text-smoke")}>{label}</span>
            {index && (
              <>
                <span className={cn("h-px w-8", light ? "bg-panel-ink/20" : "bg-paper/15")} />
                <span className={cn("meta-label", light ? "text-stone" : "text-smoke")}>{index}</span>
              </>
            )}
          </div>
          {right && <div className={cn("hidden md:block", light ? "text-stone" : "text-smoke")}>{right}</div>}
        </div>
      </Reveal>
      {title && (
        <h2 className={cn("display mt-6 text-[clamp(2rem,4.6vw,4.4rem)]", light ? "text-panel-ink" : "text-paper")}>
          {title}
        </h2>
      )}
    </div>
  );
}
