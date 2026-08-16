import type { Service } from "@/lib/cms";
import type { Project } from "@/lib/cms";
import type { Article } from "@/lib/cms";
import type { Testimonial } from "@/lib/cms";
import type { ProcessStep } from "@/lib/cms";
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
import { CmsUnavailable } from "@/components/site/CmsUnavailable";
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
      const items = section.marquee ?? [];
      if (items.length === 0) return null;
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
  const { data: bootstrap, fromCms: bootstrapOk } = await getBootstrap();
  if (!bootstrapOk) return <CmsUnavailable />;
  const sections = bootstrap.homepage?.sections ?? [];

  const [servicesRes, projectsRes, testimonialsRes, processRes, clientsRes, articlesRes] = await Promise.all([
    getServices(),
    getProjects(),
    getTestimonials(),
    getProcessSteps(),
    getClients(),
    getArticles(),
  ]);

  if (
    !servicesRes.fromCms ||
    !projectsRes.fromCms ||
    !testimonialsRes.fromCms ||
    !processRes.fromCms ||
    !clientsRes.fromCms ||
    !articlesRes.fromCms
  ) {
    return <CmsUnavailable />;
  }

  const data: HomeData = {
    services: servicesRes.data,
    projects: projectsRes.data,
    testimonials: testimonialsRes.data,
    processSteps: processRes.data,
    clients: clientsRes.data,
    articles: articlesRes.data,
  };

  // CMS-driven home — sections can be reordered, disabled, and edited in the admin.
  return (
    <>
      {sections.map((section) => (
        <div key={section.key ?? section.type}>{renderSection(section, data)}</div>
      ))}
    </>
  );
}
