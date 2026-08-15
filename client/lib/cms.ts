import "server-only";
import { cache } from "react";
import { site as fallbackSite } from "@/lib/data/site";
import { services as fallbackServices, type Service } from "@/lib/data/services";
import { projects as fallbackProjects, type Project } from "@/lib/data/projects";
import { articles as fallbackArticles, type Article } from "@/lib/data/insights";
import { testimonials as fallbackTestimonials, type Testimonial } from "@/lib/data/testimonials";
import { processSteps as fallbackProcess, type ProcessStep } from "@/lib/data/process";
import { clients as fallbackClients } from "@/lib/data/clients";

/* ------------------------------------------------------------------ */
/*  Environment + fetch helpers                                        */
/* ------------------------------------------------------------------ */

const API = process.env.NEXT_PUBLIC_API_URL ?? process.env.PUBLIC_API_URL ?? "http://localhost:4000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kern.studio";

const REVALIDATE = Number(process.env.CMS_REVALIDATE_SECONDS ?? (process.env.NODE_ENV === "development" ? 0 : 60));

type CmsResult<T> = { data: T; fromCms: boolean };

async function cmsFetch<T>(
  path: string,
  tags: string[],
  fallback: T,
  revalidate: number = REVALIDATE
): Promise<CmsResult<T>> {
  try {
    const fetchOptions: RequestInit = {
      signal: AbortSignal.timeout(3500),
    };
    if (revalidate === 0) {
      fetchOptions.cache = "no-store";
    } else {
      fetchOptions.next = { revalidate, tags };
    }
    const res = await fetch(`${API}${path}`, fetchOptions);
    if (!res.ok) {
      console.warn(`[cmsFetch] HTTP ${res.status} for ${path}`);
      return { data: fallback, fromCms: false };
    }
    const json = (await res.json()) as { success?: boolean; data?: T };
    if (!json.success || json.data === undefined || json.data === null) {
      console.warn(`[cmsFetch] Invalid data for ${path}:`, json);
      return { data: fallback, fromCms: false };
    }
    return { data: json.data, fromCms: true };
  } catch (err) {
    console.error(`[cmsFetch] Fetch error for ${path}:`, (err as Error).message);
    return { data: fallback, fromCms: false };
  }
}



/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type CmsNavItem = {
  _id?: string;
  label: string;
  href: string;
  type?: "internal" | "external";
  target?: "_self" | "_blank";
  enabled: boolean;
  order: number;
  children?: Array<{ label: string; href: string; type?: string; target?: string }>;
};

export type CmsSection = {
  _id?: string;
  type: string;
  key: string;
  label?: string;
  enabled: boolean;
  order: number;
  heading?: string;
  subheading?: string;
  body?: string;
  eyebrow?: string;
  index?: string;
  image?: string;
  cta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
  stats?: Array<{ value?: string; suffix?: string; label?: string }>;
  items?: Array<Record<string, string>>;
  clients?: Array<{ name?: string; mark?: string }>;
  marquee?: string[];
  meta?: Record<string, unknown>;
};

export type CmsTheme = {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  surface?: string;
  heading?: string;
  body?: string;
  muted?: string;
  border?: string;
  button?: string;
  buttonHover?: string;
  buttonText?: string;
  link?: string;
  selection?: string;
  ink?: string;
  ink2?: string;
  ink3?: string;
  paper?: string;
  paper2?: string;
  acid?: string;
  smoke?: string;
  stone?: string;
};

export type CmsSettings = {
  name?: string;
  wordmark?: string;
  legal?: string;
  tagline?: string;
  email?: string;
  location?: string;
  founded?: number;
  url?: string;
  favicon?: string;
  socials?: Array<{ label: string; url: string; handle: string }>;
  announcementBar?: { enabled?: boolean; text?: string; link?: string };
  globalCta?: { enabled?: boolean; label?: string; href?: string };
  maintenance?: { enabled?: boolean; message?: string };
};

export type CmsBootstrap = {
  settings?: CmsSettings;
  theme?: CmsTheme;
  navigation?: { items?: CmsNavItem[]; cta?: { label?: string; href?: string; enabled?: boolean } };
  footer?: {
    description?: string;
    columns?: Array<{ title?: string; links?: Array<{ label: string; href: string }> }>;
    socials?: Array<{ label: string; url: string; handle: string }>;
    contact?: { phone?: string; email?: string; address?: string };
    copyright?: string;
    newsletter?: { enabled?: boolean; title?: string };
  };
  seo?: {
    titleTemplate?: string;
    defaultTitle?: string;
    defaultDescription?: string;
    keywords?: string[];
    ogImage?: string;
    twitterHandle?: string;
    robots?: { index?: boolean; follow?: boolean };
    organizationSchema?: Record<string, unknown>;
  };
  homepage?: { sections?: CmsSection[] };
};

/* ------------------------------------------------------------------ */
/*  Bootstrap                                                          */
/* ------------------------------------------------------------------ */

export const getBootstrap = cache(async (): Promise<CmsResult<CmsBootstrap>> => {
  return cmsFetch<CmsBootstrap>("/api/v1/site/bootstrap", ["site", "settings", "theme", "navigation", "footer", "seo"], {});
});

export const getSiteUrl = () => SITE_URL;

/* ------------------------------------------------------------------ */
/*  Normalizers — API docs → existing frontend shapes                  */
/* ------------------------------------------------------------------ */

function padIndex(n: number): string {
  return String(n + 1).padStart(2, "0");
}

type RawProject = Project & {
  _id?: string;
  order?: number;
  status?: string;
};

function normalizeProject(raw: RawProject, index: number): Project {
  return {
    slug: raw.slug,
    index: raw.index ?? padIndex(index),
    title: raw.title,
    category: raw.category ?? "",
    year: raw.year ?? "",
    client: raw.client ?? "",
    description: raw.description ?? "",
    disciplines: raw.disciplines ?? [],
    services: raw.services ?? [],
    art: raw.art ?? "",
    outcomes: raw.outcomes ?? [],
    narrative: raw.narrative ?? [],
    featured: raw.featured ?? false,
  };
}

type RawArticle = Article & {
  _id?: string;
  category?: unknown;
  publishedAt?: string;
  content?: Array<{ heading: string; paragraphs: string[] }>;
  body?: Array<{ heading: string; paragraphs: string[] }>;
};

function normalizeArticle(raw: RawArticle, index: number): Article {
  const catName = typeof raw.category === "object" && raw.category !== null
    ? String((raw.category as { name?: string }).name ?? "Thinking")
    : String(raw.category ?? "Thinking");
  const cat = (["Thinking", "Making", "Exploring"] as const).includes(catName as never)
    ? (catName as Article["category"])
    : "Thinking";
  const published = raw.publishedAt ? new Date(raw.publishedAt) : null;
  return {
    slug: raw.slug,
    category: cat,
    title: raw.title,
    date: published
      ? published.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : raw.date ?? "",
    dateISO: published ? published.toISOString().slice(0, 10) : raw.dateISO ?? "",
    readingTime: raw.readingTime ?? "",
    excerpt: raw.excerpt ?? "",
    art: raw.art ?? "",
    body: raw.body ?? raw.content ?? [],
    pullQuote: raw.pullQuote ?? "",
  };
}

/* ------------------------------------------------------------------ */
/*  Collections                                                        */
/* ------------------------------------------------------------------ */

export const getServices = cache(async (): Promise<CmsResult<Service[]>> => {
  const res = await cmsFetch<Array<Partial<Service> & { _id?: string; order?: number }>>(
    "/api/v1/services?limit=50",
    ["services"],
    fallbackServices as unknown as Array<Partial<Service> & { _id?: string; order?: number }>
  );
  if (!res.fromCms) return res as CmsResult<Service[]>;
  const data = res.data
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s, i): Service => ({
      index: s.index ?? padIndex(i),
      title: s.title ?? "",
      tagline: s.tagline ?? "",
      description: s.description ?? "",
      items: s.items ?? [],
      tools: s.tools ?? [],
    }));
  return { data, fromCms: true };
});

export const getProjects = cache(async (): Promise<CmsResult<Project[]>> => {
  const res = await cmsFetch<Array<Partial<RawProject>>>(
    "/api/v1/projects?limit=100",
    ["projects"],
    fallbackProjects as unknown as Array<Partial<RawProject>>
  );
  if (!res.fromCms) return res as CmsResult<Project[]>;
  const data = res.data
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p, i) => normalizeProject(p as RawProject, i));
  return { data, fromCms: true };
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const { data, fromCms } = await getProjects();
  const found = data.find((p) => p.slug === slug);
  if (found) return found;
  if (fromCms) {
    const res = await cmsFetch<RawProject>(`/api/v1/projects/${slug}`, ["projects"], null as unknown as RawProject, 30);
    if (res.data) return normalizeProject(res.data, 0);
  }
  return null;
});

export const getArticles = cache(async (): Promise<CmsResult<Article[]>> => {
  const res = await cmsFetch<Array<Partial<RawArticle>>>(
    "/api/v1/blog?limit=100",
    ["blog"],
    fallbackArticles as unknown as Array<Partial<RawArticle>>
  );
  if (!res.fromCms) return res as CmsResult<Article[]>;
  const data = res.data
    .sort((a, b) => new Date((b.publishedAt as string) ?? 0).getTime() - new Date((a.publishedAt as string) ?? 0).getTime())
    .map((a, i) => normalizeArticle(a as RawArticle, i));
  return { data, fromCms: true };
});

export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  const { data, fromCms } = await getArticles();
  const found = data.find((a) => a.slug === slug);
  if (found) return found;
  if (fromCms) {
    const res = await cmsFetch<RawArticle>(`/api/v1/blog/${slug}`, ["blog"], null as unknown as RawArticle, 30);
    if (res.data) return normalizeArticle(res.data, 0);
  }
  return null;
});

export const getTestimonials = cache(async (): Promise<CmsResult<Testimonial[]>> => {
  const res = await cmsFetch<Array<Partial<Testimonial> & { _id?: string; order?: number }>>(
    "/api/v1/testimonials?limit=50",
    ["testimonials"],
    fallbackTestimonials as unknown as Array<Partial<Testimonial> & { _id?: string; order?: number }>
  );
  if (!res.fromCms) return res as CmsResult<Testimonial[]>;
  const data = res.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((t) => ({
    quote: t.quote ?? "",
    name: t.name ?? "",
    role: t.role ?? "",
    company: t.company ?? "",
  }));
  return { data, fromCms: true };
});

/** Process steps come from the homepage "process" section when present. */
export const getProcessSteps = cache(async (): Promise<ProcessStep[]> => {
  const { data, fromCms } = await getBootstrap();
  const processSection = data.homepage?.sections?.find((s) => s.type === "process");
  const items = processSection?.items;
  if (fromCms && items && items.length > 0) {
    return items.map((item, i): ProcessStep => ({
      index: item.index ?? padIndex(i),
      title: item.title ?? `Step ${i + 1}`,
      summary: item.value ?? item.body ?? "",
      detail: item.body ?? item.value ?? "",
      deliverables: Array.isArray(item.paragraphs) ? item.paragraphs : [],
    }));
  }
  return fallbackProcess;
});

export const getClients = cache(async (): Promise<CmsResult<Array<{ name: string; mark?: string }>>> => {
  const { data, fromCms } = await getBootstrap();
  const clientsSection = data.homepage?.sections?.find((s) => s.type === "clients");
  if (fromCms && clientsSection?.clients && clientsSection.clients.length > 0) {
    return {
      data: clientsSection.clients.map((c) => ({ name: c.name ?? "", mark: c.mark ?? "" })),
      fromCms: true,
    };
  }
  return { data: fallbackClients, fromCms: true };
});

export const getFAQs = cache(async (): Promise<CmsResult<Array<{ question: string; answer: string; category?: string }>>> => {
  return cmsFetch<Array<{ question: string; answer: string; category?: string }>>(
    "/api/v1/faqs?limit=50",
    ["faqs"],
    []
  );
});

export const getTeam = cache(async (): Promise<CmsResult<Array<Record<string, unknown>>>> => {
  return cmsFetch<Array<Record<string, unknown>>>("/api/v1/team?limit=50", ["team"], []);
});

export const getPage = cache(async (slug: string): Promise<Record<string, unknown> | null> => {
  const res = await cmsFetch<Record<string, unknown>>(`/api/v1/pages/${slug}`, ["pages"], null as unknown as Record<string, unknown>, 60);
  return res.data ?? null;
});

/** Ordered, enabled homepage sections. */
export const getHomeSections = cache(async (): Promise<CmsSection[]> => {
  const { data, fromCms } = await getBootstrap();
  const sections = data.homepage?.sections;
  if (fromCms && Array.isArray(sections)) {
    return sections
      .filter((s) => s.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
  return [];
});

export const isMaintenanceMode = cache(async (): Promise<boolean> => {
  const { data } = await getBootstrap();
  return data.settings?.maintenance?.enabled === true;
});
