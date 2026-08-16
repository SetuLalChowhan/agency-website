import type { Metadata } from "next";
import { getBootstrap } from "@/lib/cms";
import { CmsUnavailable } from "@/components/site/CmsUnavailable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { RevealImage } from "@/components/ui/RevealImage";
import { Parallax } from "@/components/ui/Parallax";
import { ScrollWords } from "@/components/ui/ScrollWords";
import { StatsSection, type StatItem } from "@/components/home/StatsSection";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "KERN is a small, obsessive team of fourteen — strategists, designers and engineers building digital experiences that matter.",
  alternates: { canonical: "/about" },
};

const statement = [
  { text: "We" },
  { text: "are" },
  { text: "a" },
  { text: "small," },
  { text: "obsessive", className: "font-accent normal-case italic tracking-normal text-acid" },
  { text: "team" },
  { text: "building" },
  { text: "big" },
  { text: "digital" },
  { text: "experiences." },
];

const values = [
  { title: "Obsession", body: "We notice the 4px nobody asked about, and we fix it before you see it." },
  { title: "Precision", body: "Words, spacing and data agree with each other — or we don't ship." },
  { title: "Candor", body: "We tell you when an idea is bad. We've saved clients months doing it." },
  { title: "Momentum", body: "Weekly builds, visible progress, no mystery. Velocity is a design material." },
];

export default async function AboutPage() {
  const { data: bootstrap, fromCms } = await getBootstrap();
  if (!fromCms) return <CmsUnavailable />;
  const statsSection = bootstrap.homepage?.sections?.find((s) => s.type === "stats");
  const ctaSection = bootstrap.homepage?.sections?.find((s) => s.type === "cta");

  return (
    <>
      {/* Hero statement */}
      <section className="px-5 pt-36 md:px-10 md:pt-52">
        <div className="mx-auto max-w-[1920px]">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-acid" />
            <span className="meta-label text-smoke">About the studio</span>
          </div>
          <ScrollWords
            className="display mt-8 block max-w-[14ch] text-[clamp(2.3rem,6vw,5.8rem)] leading-[0.98] text-paper"
            words={statement}
          />
        </div>
      </section>

      {/* Philosophy */}
      <section className="px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1920px] gap-14 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionHeader label="Philosophy" title="Why we exist" />
          </div>
          <div className="md:col-span-7 md:col-start-6">
            {[
              [
                "Most digital products are designed to be safe. We design the ones people remember — which means opinions, restraint and a willingness to delete the mediocre.",
              ],
              [
                "We believe craft is a business strategy. The fastest way to be chosen is to be visibly better, and that starts with how the interface breathes, not just how it functions.",
              ],
              [
                "And we believe small teams win. Fewer hands mean fewer handoffs, and fewer handoffs mean the work keeps its point of view from the first sketch to the final deploy.",
              ],
            ].map(([text], i) => (
              <Reveal key={i}>
                <div className="border-t hairline-d py-8 first:border-t-0 first:pt-0">
                  <div className="flex items-start gap-8">
                    <span className="meta-label flex-none pt-1 text-stone">0{i + 1}</span>
                    <p className="max-w-2xl text-lg leading-relaxed text-paper/85">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t hairline-d px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1920px]">
          <SectionHeader label="Culture" index="How we behave" title="Four rules" />
          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.07}>
                <div className="border-t hairline-d pt-6">
                  <span className="meta-label text-acid">0{i + 1}</span>
                  <h3 className="display mt-4 text-2xl text-paper md:text-3xl">{v.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-smoke">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t hairline-d px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1920px] gap-14 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <Parallax speed={0.07}>
              <RevealImage
                src="/images/studio/studio-2.svg"
                alt="KERN studio wall — prints, sketches and shipping notes"
                className="aspect-[4/3] w-full"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            </Parallax>
          </div>
          <div className="flex flex-col justify-center md:col-span-6 md:col-start-7">
            <p className="meta-label text-stone">The people</p>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-paper/85">
              Fourteen people across strategy, design, engineering and AI. We hire for taste and
              train for craft — and we&apos;ve worked together long enough that the first draft of
              most decisions is already shared.
            </p>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-paper/85">
              No account managers between you and the work. When you write to us, you hear from the
              people who will actually build it.
            </p>
          </div>
        </div>
      </section>

      <StatsSection stats={(statsSection?.stats ?? []) as StatItem[]} />

      {/* Locations */}
      <section className="border-t hairline-panel bg-panel px-5 py-20 text-panel-ink md:px-10 md:py-28">
        <div className="mx-auto max-w-[1920px]">
          <SectionHeader label="Where we are" light title="Two homes, one studio" />
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            {[
              { city: "Dhaka", note: "Headquarters", body: "Our studio sits above a busy street in Dhanmondi — where the city's energy becomes the work's." },
              { city: "Worldwide", note: "Distributed", body: "The other half of the team ships from six timezones, overlapping at least four hours a day." },
            ].map((loc, i) => (
              <Reveal key={loc.city} delay={i * 0.08}>
                <div className="border-t hairline-panel pt-6">
                  <div className="flex items-baseline justify-between">
                    <h3 className="display text-3xl text-panel-ink md:text-4xl">{loc.city}</h3>
                    <span className="meta-label text-stone">{loc.note}</span>
                  </div>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-stone">{loc.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA content={ctaSection} />
    </>
  );
}
