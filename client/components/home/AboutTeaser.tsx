"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ScrollWords } from "@/components/ui/ScrollWords";
import { RevealImage } from "@/components/ui/RevealImage";
import { Parallax } from "@/components/ui/Parallax";
import { Reveal } from "@/components/ui/Reveal";
import type { CmsSection } from "@/lib/cms";

const DEFAULT_STATEMENT = [
  { text: "We" },
  { text: "are" },
  { text: "a" },
  { text: "small," },
  { text: "obsessive", className: "font-accent normal-case italic tracking-normal text-panel-ink" },
  { text: "team" },
  { text: "building" },
  { text: "big" },
  { text: "digital" },
  { text: "experiences." },
];

const DEFAULT_FACTS: Array<[string, string]> = [
  ["Founded", "2014"],
  ["Team", "14 people"],
  ["Studios", "2 — Dhaka / Remote"],
  ["Timezone", "UTC+6, always on"],
];

export function AboutTeaser({ content }: { content?: CmsSection }) {
  const statementTitle = content?.items?.find((i) => i.title)?.title;
  const statement = statementTitle
    ? statementTitle.split(" ").map((word) => ({
        text: word,
        className:
          word.toLowerCase().replace(/[^a-z]/g, "") === "obsessive"
            ? "font-accent normal-case italic tracking-normal text-panel-ink"
            : undefined,
      }))
    : DEFAULT_STATEMENT;

  const paragraphs = content?.items?.filter((i) => i.body).map((i) => i.body as string);
  const bodyParagraphs = paragraphs && paragraphs.length > 0 ? paragraphs : null;

  const rawFacts = content?.meta?.facts as Array<{ label?: string; value?: string }> | undefined;
  const facts: Array<[string, string]> =
    rawFacts && rawFacts.length > 0
      ? rawFacts.map((f) => [f.label ?? "", f.value ?? ""] as [string, string])
      : DEFAULT_FACTS;

  const image = content?.image ?? "/images/studio/portrait.svg";
  const cta = content?.cta ?? { label: "More about us", href: "/about" };

  return (
    <section className="border-t hairline-panel bg-panel px-5 py-24 text-panel-ink md:px-10 md:py-36">
      <div className="mx-auto max-w-[1920px]">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-acid" />
            <span className="meta-label text-stone">{content?.eyebrow ?? "About the studio"}</span>
          </div>
        </Reveal>

        <ScrollWords
          className="display mt-8 block max-w-[16ch] text-[clamp(2.1rem,5.2vw,5rem)] leading-[0.98] text-panel-ink"
          words={statement}
        />

        <div className="mt-20 grid gap-14 md:mt-28 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Parallax speed={0.07}>
              <RevealImage
                src={image}
                alt="Inside the KERN studio — the team around a shared table"
                className="aspect-[4/5] w-full"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </Parallax>
          </div>

          <div className="flex flex-col justify-between gap-12 md:col-span-6 md:col-start-7">
            <div className="max-w-xl">
              {(bodyParagraphs ?? []).length > 0 ? (
                bodyParagraphs!.map((p, i) => (
                  <p key={i} className={`text-[17px] leading-relaxed text-panel-ink/85 ${i > 0 ? "mt-6" : ""}`}>
                    {p}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-[17px] leading-relaxed text-panel-ink/85">
                    Fourteen people. No account managers, no handoffs, no PowerPoint-deck strategy.
                    Designers, engineers and strategists sit in the same room and argue until the work
                    is better — then argue some more.
                  </p>
                  <p className="mt-6 text-[17px] leading-relaxed text-panel-ink/85">
                    We take on a handful of projects a year and stay until they perform. Most of our
                    clients have been with us for three years or more; a few never really left.
                  </p>
                </>
              )}
              <div className="mt-10">
                <Link
                  href={cta.href ?? "/about"}
                  data-cursor="link"
                  className="group inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.15em] text-panel-ink"
                >
                  <span className="link-sweep">{cta.label ?? "More about us"}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                </Link>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-x-8 gap-y-6 border-t hairline-panel pt-8">
              {facts.map(([k, v]) => (
                <li key={k} className="flex flex-col gap-1">
                  <span className="meta-label text-stone">{k}</span>
                  <span className="text-[15px] font-medium text-panel-ink">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
