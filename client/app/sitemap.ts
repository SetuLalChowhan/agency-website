import type { MetadataRoute } from "next";
import { getBootstrap, getProjects, getArticles, getSiteUrl } from "@/lib/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [{ data: bootstrap }, { data: projects }, { data: articles }] = await Promise.all([
    getBootstrap(),
    getProjects(),
    getArticles(),
  ]);

  const base = bootstrap.settings?.url || getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = ["", "/work", "/services", "/about", "/insights", "/contact"].map(
    (route) => ({
      url: `${base}${route}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: route === "" ? 1 : 0.8,
    })
  );

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${base}/insights/${a.slug}`,
    lastModified: a.dateISO ? new Date(a.dateISO) : now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes, ...articleRoutes];
}
