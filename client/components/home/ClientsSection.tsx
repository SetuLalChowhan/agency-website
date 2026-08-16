"use client";

import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils/cn";

export function ClientsSection({
  clients,
  eyebrow,
}: {
  clients?: Array<{ name: string; mark?: string }>;
  eyebrow?: string;
}) {
  const list = clients ?? [];
  if (list.length === 0) return null;

  return (
    <section className="border-t hairline-panel bg-panel px-5 py-20 text-panel-ink md:px-10 md:py-28">
      <div className="mx-auto max-w-[1920px]">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-acid" />
            <span className="meta-label text-stone">{eyebrow ?? "Trusted by teams at"}</span>
          </div>
        </Reveal>

        <ul className="mt-12 grid grid-cols-2 md:grid-cols-4">
          {list.map((client, i) => (
            <li
              key={client.name}
              className={cn(
                "border-t hairline-panel",
                i % 2 === 0 && "border-r hairline-panel",
                i < 2 && "md:border-r hairline-panel",
                i === 3 && "md:border-r-0",
                i >= 4 && i % 2 === 0 && "md:border-r hairline-panel",
                i === 7 && "md:border-r-0"
              )}
            >
              <Reveal delay={i * 0.05} y={18}>
                <div
                  data-cursor="link"
                  className="group flex h-full cursor-pointer items-center justify-center gap-2 py-9 transition-colors duration-300 hover:bg-panel-ink md:py-12"
                >
                  <span className="display text-xl tracking-tight text-stone transition-colors duration-300 group-hover:text-acid md:text-2xl">
                    {client.name}
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
