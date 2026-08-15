import type { MetadataRoute } from "next";
import { getBootstrap, getSiteUrl } from "@/lib/cms";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { data } = await getBootstrap();
  const base = data.settings?.url || getSiteUrl();
  const index = data.seo?.robots?.index ?? true;
  const follow = data.seo?.robots?.follow ?? true;

  return {
    rules: [
      {
        userAgent: "*",
        allow: index ? "/" : undefined,
        disallow: index ? undefined : "/",
        ...(follow ? {} : { noindex: true }),
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
