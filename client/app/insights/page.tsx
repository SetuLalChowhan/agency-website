import type { Metadata } from "next";
import { getArticles } from "@/lib/cms";
import { CmsUnavailable } from "@/components/site/CmsUnavailable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { InsightsTeaser } from "@/components/home/InsightsTeaser";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Thinking, making and exploring — essays from the studio on digital craft, attention, small teams and motion systems.",
  alternates: { canonical: "/insights" },
};

export default async function InsightsPage() {
  const { data: articles, fromCms } = await getArticles();
  if (!fromCms) return <CmsUnavailable />;

  return (
    <>
      <section className="px-5 pb-16 pt-32 md:px-10 md:pb-24 md:pt-44">
        <div className="mx-auto max-w-[1920px]">
          <SectionHeader
            label="The journal"
            index="04 essays"
            title="Thinking / Making / Exploring"
          />
          <Reveal className="mt-8">
            <p className="max-w-xl text-[15px] leading-relaxed text-smoke md:text-base">
              Field notes from the studio — on craft, attention, small teams and the systems that
              make brands move. Written by the people doing the work.
            </p>
          </Reveal>
        </div>
      </section>

      <InsightsTeaser articles={articles} showHeader={false} />

      <FinalCTA />
    </>
  );
}
