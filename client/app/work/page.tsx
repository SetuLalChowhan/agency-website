import type { Metadata } from "next";
import { getProjects } from "@/lib/cms";
import { CmsUnavailable } from "@/components/site/CmsUnavailable";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { WorkList } from "@/components/projects/WorkList";
import { FinalCTA } from "@/components/home/FinalCTA";

export const metadata: Metadata = {
  title: "Work",
  description:
    "A curated index of recent collaborations — digital experiences, AI products, brand systems and platforms.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const { data: projects, fromCms } = await getProjects();
  if (!fromCms) return <CmsUnavailable />;

  return (
    <>
      <section className="px-5 pb-14 pt-32 md:px-10 md:pb-20 md:pt-44">
        <div className="mx-auto max-w-[1920px]">
          <SectionHeader
            label="Portfolio"
            index={`0${projects.length} projects`}
            title="Work"
          />
          <Reveal className="mt-8">
            <p className="max-w-xl text-[15px] leading-relaxed text-smoke md:text-base">
              Everything here shipped to real users in the last three years. We only show work we
              would happily do again.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 md:px-10">
        <WorkList projects={projects} />
      </section>

      <FinalCTA />
    </>
  );
}
