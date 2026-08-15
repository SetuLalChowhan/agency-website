import { site as fallbackSite } from "@/lib/data/site";
import type { Service } from "@/lib/data/services";
import type { Project } from "@/lib/data/projects";
import type { Article } from "@/lib/data/insights";
import type { Testimonial } from "@/lib/data/testimonials";
import type { ProcessStep } from "@/lib/data/process";
import {
  getBootstrap,
  getServices,
  getProjects,
  getTestimonials,
  getProcessSteps,
  getClients,
  getArticles,
  type CmsSection,
} from "@/lib/cms";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { SelectedWorkSection } from "@/components/site/SelectedWorkSection";
import { HorizontalProjects } from "@/components/home/HorizontalProjects";
import { ServicesSection } from "@/components/home/ServicesSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { AboutTeaser } from "@/components/home/AboutTeaser";
import { StatsSection, type StatItem } from "@/components/home/StatsSection";
import { Testimonials } from "@/components/home/Testimonials";
import { ClientsSection } from "@/components/home/ClientsSection";
import { InsightsTeaser } from "@/components/home/InsightsTeaser";
import { FinalCTA } from "@/components/home/FinalCTA";

type HomeData = {
  services: Service[];
  projects: Project[];
  testimonials: Testimonial[];
  processSteps: ProcessStep[];
  clients: Array<{ name: string; mark?: string }>;
  articles: Article[];
};

function renderSection(section: CmsSection, data: HomeData) {
  const { services, projects, testimonials, processSteps, clients, articles } = data;

  switch (section.type) {
    case "hero":
      return <Hero content={section} />;

    case "marquee": {
      const items = section.marquee?.length ? section.marquee : [...fallbackSite.marquee];
      return (
        <section className="border-t hairline-d" aria-label="What we do — overview">
          <p className="sr-only">{items.join(", ")}</p>
          <Marquee items={items} size="lg" className="py-7 md:py-10" />
          <div className="border-t hairline-d" />
          <Marquee items={[...items].reverse()} reverse size="sm" className="py-4 md:py-5" />
        </section>
      );
    }

    case "selected-work":
      return <SelectedWorkSection projects={projects} content={section} />;

    case "horizontal-projects":
      return <HorizontalProjects projects={projects} content={section} />;

    case "services":
      return (
        <ServicesSection
          services={services}
          header={{
            eyebrow: section.eyebrow,
            index: section.index,
            heading: section.heading,
            body: section.body,
          }}
        />
      );

    case "process":
      return (
        <ProcessSection steps={processSteps} eyebrow={section.eyebrow} heading={section.heading} />
      );

    case "about":
      return <AboutTeaser content={section} />;

    case "stats":
      return <StatsSection stats={(section.stats ?? []) as StatItem[]} />;

    case "testimonials":
      return <Testimonials items={testimonials} eyebrow={section.eyebrow} />;

    case "clients":
      return <ClientsSection clients={clients} />;

    case "insights":
      return <InsightsTeaser articles={articles} />;

    case "cta":
      return <FinalCTA content={section} />;

    default:
      return null;
  }
}

export default async function HomePage() {
  const { data: bootstrap } = await getBootstrap();
  const sections = bootstrap.homepage?.sections ?? [];

  const [{ data: services }, { data: projects }, { data: testimonials }, processSteps, { data: clients }, { data: articles }] =
    await Promise.all([
      getServices(),
      getProjects(),
      getTestimonials(),
      getProcessSteps(),
      getClients(),
      getArticles(),
    ]);

  const data: HomeData = { services, projects, testimonials, processSteps, clients, articles };

  // CMS-driven home — sections can be reordered, disabled, and edited in the admin.
  if (sections.length > 0) {
    return (
      <>
        {sections.map((section) => (
          <div key={section.key ?? section.type}>{renderSection(section, data)}</div>
        ))}
      </>
    );
  }

  // Fallback — the original hardcoded composition, fed by the same data
  // helpers (which themselves fall back to the bundled content when the
  // CMS is unreachable).
  return (
    <>
      <Hero />

      {/* Capabilities marquee */}
      <section className="border-t hairline-d" aria-label="What we do — overview">
        <p className="sr-only">
          Strategy, design, development, branding, AI and digital products.
        </p>
        <Marquee items={fallbackSite.marquee} size="lg" className="py-7 md:py-10" />
        <div className="border-t hairline-d" />
        <Marquee items={[...fallbackSite.marquee].reverse()} reverse size="sm" className="py-4 md:py-5" />
      </section>

      <SelectedWorkSection projects={projects} />
      <HorizontalProjects projects={projects} />
      <ServicesSection services={services} />
      <ProcessSection steps={processSteps} />
      <AboutTeaser />
      <StatsSection />
      <Testimonials items={testimonials} />
      <ClientsSection />
      <InsightsTeaser />
      <FinalCTA />
    </>
  );
}
