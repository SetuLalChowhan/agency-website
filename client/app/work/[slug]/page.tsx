import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProject as getCmsProject, getProjects } from "@/lib/cms";
import { CmsUnavailable } from "@/components/site/CmsUnavailable";
import { RevealImage } from "@/components/ui/RevealImage";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCTA } from "@/components/home/FinalCTA";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { data } = await getProjects();
  return data.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: project } = await getCmsProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${project.category}`,
    description: project.description,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: `${project.title} — ${project.category}`,
      description: project.description,
      images: [{ url: project.art, width: 1600, height: 1000, alt: project.title }],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const [projectRes, listRes] = await Promise.all([getCmsProject(slug), getProjects()]);
  if (!projectRes.fromCms || !listRes.fromCms) return <CmsUnavailable />;
  const project = projectRes.data;
  if (!project) notFound();

  const projects = listRes.data;
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length] ?? projects[0];

  return (
    <article>
      {/* Header */}
      <header className="px-5 pt-32 md:px-10 md:pt-44">
        <div className="mx-auto max-w-[1920px]">
          <Link
            href="/work"
            data-cursor="link"
            className="group inline-flex items-center gap-2 meta-label text-smoke transition-colors duration-300 hover:text-paper"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            All work
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="meta-label text-acid">{project.index}</span>
            <span className="meta-label text-smoke">{project.category}</span>
            <span className="meta-label text-smoke">{project.year}</span>
          </div>
          <h1 className="display mt-4 text-[clamp(3rem,10vw,9.5rem)] text-paper">{project.title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-smoke md:text-lg">
            {project.description}
          </p>
        </div>
      </header>

      {/* Cover */}
      <div className="mt-12 px-5 md:mt-16 md:px-10">
        <RevealImage
          src={project.art}
          alt={`${project.title} — ${project.category}`}
          className="aspect-[16/9] w-full"
          sizes="100vw"
          priority
        />
      </div>

      {/* Meta + narrative */}
      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1920px] gap-14 md:grid-cols-12 md:gap-10">
          <dl className="space-y-6 md:col-span-4">
            {[
              ["Client", project.client],
              ["Year", project.year],
              ["Category", project.category],
              ["Disciplines", project.disciplines.join(" / ")],
              ["Services", project.services.join(" / ")],
            ].map(([k, v]) => (
              <div key={k} className="border-t hairline-d pt-4">
                <dt className="meta-label text-stone">{k}</dt>
                <dd className="mt-2 text-sm text-paper/90">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="md:col-span-7 md:col-start-6">
            {project.narrative.map((block, i) => (
              <div key={i} className="border-t hairline-d py-10 first:border-t-0 first:pt-0">
                <div className="flex items-start gap-8">
                  <span className="meta-label flex-none pt-2 text-smoke">0{i + 1}</span>
                  <div>
                    <h2 className="display text-2xl text-paper md:text-3xl">{block.heading}</h2>
                    <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-smoke">
                      {block.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="border-t hairline-d px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-[1920px]">
          <Reveal>
            <p className="meta-label text-smoke">What changed</p>
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {project.outcomes.map((o, i) => (
              <Reveal key={o.label} delay={i * 0.08}>
                <div className="border-t hairline-d pt-6">
                  <p className="display text-[clamp(2.2rem,4.5vw,3.8rem)] text-acid">{o.value}</p>
                  <p className="meta-label mt-3 text-smoke">{o.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Next project */}
      <section className="border-t hairline-d">
        <Link
          href={`/work/${next.slug}`}
          data-cursor="view"
          className="group block px-5 py-20 md:px-10 md:py-28"
        >
          <div className="mx-auto max-w-[1920px]">
            <p className="meta-label text-smoke">Next project — 0{next.index}</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
              <h2 className="display text-[clamp(2.6rem,8vw,7rem)] text-paper transition-colors duration-500 group-hover:text-acid">
                {next.title}
              </h2>
              <ArrowUpRight className="h-10 w-10 text-smoke transition-all duration-500 group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:text-acid" />
            </div>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-smoke">{next.description}</p>
          </div>
        </Link>
      </section>

      <FinalCTA />
    </article>
  );
}
