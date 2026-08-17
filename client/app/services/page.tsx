import type { Metadata } from "next";
import { getServices, getProcessSteps, getFAQs } from "@/lib/cms";
import { CmsUnavailable } from "@/components/site/CmsUnavailable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { Marquee } from "@/components/home/Marquee";
import { FinalCTA } from "@/components/home/FinalCTA";
import { PageSectionRenderer } from "@/components/sections/PageSectionRenderer";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Strategy, design, development and AI — four disciplines under one roof, one standard of obsession.",
  alternates: { canonical: "/services" },
};

const engagements = [
  {
    index: "01",
    title: "The project",
    body: "A defined scope, a fixed team, a clear timeline. Most engagements run 8–16 weeks from kickoff to launch.",
  },
  {
    index: "02",
    title: "The retainer",
    body: "An ongoing partnership — product iteration, design systems and engineering on tap, billed monthly.",
  },
  {
    index: "03",
    title: "The sprint",
    body: "Two to four weeks of focused work on a single problem: a redesign, an AI prototype, a launch push.",
  },
];

const tech = ["Next.js", "React", "TypeScript", "GSAP", "Tailwind", "Node.js", "Postgres", "Vercel", "Sanity", "OpenAI"];

export default async function ServicesPage() {
  const { data: services, fromCms } = await getServices();
  const { data: processSteps, fromCms: processOk } = await getProcessSteps();
  const { data: faqs } = await getFAQs();
  if (!fromCms || !processOk) return <CmsUnavailable />;

  return (
    <>
      <section className="px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44">
        <div className="mx-auto max-w-[1920px]">
          <SectionHeader label="Services" index="04 capabilities" title="What we do" />
          <Reveal className="mt-8">
            <p className="max-w-xl text-[15px] leading-relaxed text-smoke md:text-base">
              Strategy, design, engineering and AI under one roof. Pick a single discipline or hand
              us the whole product — the standard doesn&apos;t change.
            </p>
          </Reveal>
        </div>
      </section>

      <ServicesSection showHeader={false} services={services} />

      {/* Engagement models */}
      <section className="border-t hairline-d px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1920px]">
          <SectionHeader label="How we engage" index="Ways of working" title="Three ways in" />
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {engagements.map((e, i) => (
              <Reveal key={e.index} delay={i * 0.08}>
                <div className="border-t hairline-d pt-6">
                  <span className="meta-label text-acid">{e.index}</span>
                  <h3 className="display mt-4 text-2xl text-paper md:text-3xl">{e.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-smoke">{e.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ProcessSection steps={processSteps} />

      {/* Live FAQs Section from CMS */}
      {faqs && faqs.length > 0 && (
        <PageSectionRenderer
          sections={[
            {
              type: "faqs",
              key: "services-faqs",
              label: "FAQs",
              enabled: true,
              order: 0,
              heading: "Frequently Asked Questions",
              eyebrow: "05 / Clarity",
              body: "Everything you need to know about working with our team.",
            },
          ]}
          faqs={faqs}
        />
      )}

      {/* Tech marquee */}
      <section className="border-t hairline-d py-6" aria-label="Technologies we ship with">
        <p className="sr-only">Next.js, React, TypeScript, GSAP, Tailwind, Node.js, Postgres, Vercel, Sanity, OpenAI</p>
        <Marquee items={tech} size="sm" className="mask-fade-x py-3" />
      </section>

      <FinalCTA />
    </>
  );
}
