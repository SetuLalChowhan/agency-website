import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPage,
  getServices,
  getProjects,
  getArticles,
  getTestimonials,
  getTeam,
  getFAQs,
  type CmsSection,
} from "@/lib/cms";
import { PageSectionRenderer } from "@/components/sections/PageSectionRenderer";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type DynamicPageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const { data: page } = await getPage(slugPath);

  if (!page) return { title: "Page Not Found" };

  const title = (page.seo as any)?.title || (page as any).title;
  const description = (page.seo as any)?.description || (page as any).description;
  const ogImage = (page.seo as any)?.ogImage;

  return {
    title,
    description,
    alternates: { canonical: `/${slugPath}` },
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function DynamicCustomPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  const slugPath = slug.join("/");

  // Fetch page data from CMS
  const { data: page, fromCms } = await getPage(slugPath);

  if (!page) {
    notFound();
  }

  // Fetch collections in parallel for dynamic section templates
  const [services, projects, articles, testimonials, team, faqs] = await Promise.all([
    getServices(),
    getProjects(),
    getArticles(),
    getTestimonials(),
    getTeam(),
    getFAQs(),
  ]);

  const sections = ((page as any).sections ?? []) as CmsSection[];

  return (
    <main className="min-h-screen">
      <PageSectionRenderer
        sections={sections}
        services={services.data}
        projects={projects.data}
        articles={articles.data}
        testimonials={testimonials.data}
        team={team.data}
        faqs={faqs.data}
      />
    </main>
  );
}
