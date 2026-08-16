import "server-only";
import { cache } from "react";
import { headers } from "next/headers";

/* ------------------------------------------------------------------ */
/*  Environment + fetch helpers                                        */
/* ------------------------------------------------------------------ */
/*  The CMS API is the single source of truth for site content. The    */
/*  client NEVER substitutes bundled/static content for live CMS data — */
/*  if the API cannot be reached the page renders an explicit           */
/*  "content unavailable" state instead of showing stale content.       */
/*                                                                      */
/*  All reads go through the same-origin proxy route                    */
/*  app/api/cms/[...path], which resolves the CMS base URL server-side  */
/*  (PUBLIC_API_URL). The site never calls the Express server directly. */
/* ------------------------------------------------------------------ */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";

/** Direct CMS base URL — only used as a last-resort fallback below. */
const CMS_API_URL =
  process.env.PUBLIC_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "development" ? "http://localhost:4000" : "");

/**
 * Origin of this app for the current request — NEVER returns an empty string.
 * The CMS proxy route lives on the same origin (app/api/cms/[...path]) and
 * server-side `fetch` requires an absolute URL: a bare relative path throws
 * "Failed to parse URL" in Node's fetch, and Next's patched fetch can't
 * resolve it either.
 *
 * Resolution order: request host (correct in dev/previews/prod) → configured
 * site URL → dev default → hardcoded fallback.
 */
async function appOrigin(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "http";
      return `${proto}://${host}`;
    }
  } catch {
    /* headers() unavailable (e.g. prerender without a request) — fall back */
  }
  if (SITE_URL) return SITE_URL.replace(/\/+$/, "");
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return "https://kern.studio";
}

const REVALIDATE = Number(process.env.CMS_REVALIDATE_SECONDS ?? (process.env.NODE_ENV === "development" ? 0 : 60));

/** How long we wait for the CMS before retrying / giving up. */
const CMS_TIMEOUT_MS = 8000;
/** Max attempts per request (1 initial + 1 retry). */
const CMS_MAX_ATTEMPTS = 2;

export type CmsResult<T> = { data: T; fromCms: boolean };

function isRetryable(err: unknown): boolean {
  // Network failures, aborts (timeouts) and 5xx are worth retrying once.
  if (err instanceof Error) {
    const name = err.name;
    if (name === "TimeoutError" || name === "AbortError") return true;
  }
  return false;
}

async function cmsFetch<T>(
  path: string,
  tags: string[],
  empty: T,
  revalidate: number = REVALIDATE
): Promise<CmsResult<T>> {
  // /api/v1/... → /api/cms/... (same origin, proxied to the CMS server).
  // Guard against a relative URL ever reaching fetch: if the origin somehow
  // failed to resolve, call the CMS API directly instead.
  const proxyPath = `${await appOrigin()}${path.replace(/^\/api\/v1/, "/api/cms")}`;
  const url = /^https?:\/\//i.test(proxyPath)
    ? proxyPath
    : CMS_API_URL
      ? `${CMS_API_URL}${path}`
      : proxyPath;

  for (let attempt = 1; attempt <= CMS_MAX_ATTEMPTS; attempt += 1) {
    try {
      const fetchOptions: RequestInit = {
        signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
      };
      if (revalidate === 0) {
        fetchOptions.cache = "no-store";
      } else {
        fetchOptions.next = { revalidate, tags };
      }

      const res = await fetch(url, fetchOptions);
      if (!res.ok) {
        console.warn(`[cmsFetch] HTTP ${res.status} for ${path}`);
        return { data: empty, fromCms: false };
      }

      const json = (await res.json()) as { success?: boolean; data?: T };
      if (!json.success || json.data === undefined || json.data === null) {
        console.warn(`[cmsFetch] Invalid data for ${path}:`, json);
        return { data: empty, fromCms: false };
      }
      return { data: json.data, fromCms: true };
    } catch (err) {
      const lastAttempt = attempt === CMS_MAX_ATTEMPTS;
      console.error(
        lastAttempt ? `[cmsFetch] Fetch failed for ${path}` : `[cmsFetch] Retrying ${path}`,
        (err as Error).message
      );
      if (!isRetryable(err) || lastAttempt) {
        return { data: empty, fromCms: false };
      }
      // Small backoff before the retry.
      await new Promise((r) => setTimeout(r, 250 * attempt));
    }
  }
  return { data: empty, fromCms: false };
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

export type Service = {
  index: string;
  title: string;
  tagline: string;
  description: string;
  items: string[];
  tools: string[];
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  year: string;
  client: string;
  description: string;
  disciplines: string[];
  services: string[];
  art: string;
  outcomes: { value: string; label: string }[];
  narrative: { heading: string; body: string }[];
  featured: boolean;
};

export type Article = {
  slug: string;
  category: "Thinking" | "Making" | "Exploring";
  title: string;
  date: string;
  dateISO: string;
  readingTime: string;
  excerpt: string;
  art: string;
  body: { heading: string; paragraphs: string[] }[];
  pullQuote: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export type ProcessStep = {
  index: string;
  title: string;
  summary: string;
  detail: string;
  deliverables: string[];
};

/* ------------------------------------------------------------------ */
/*  Bootstrap                                                          */
/* ------------------------------------------------------------------ */

export const getBootstrap = cache(async (): Promise<CmsResult<CmsBootstrap>> => {
  return cmsFetch<CmsBootstrap>(
    "/api/v1/site/bootstrap",
    ["site", "settings", "theme", "navigation", "footer", "seo", "homepage"],
    {}
  );
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

function normalizeArticle(raw: RawArticle): Article {
  const catName =
    typeof raw.category === "object" && raw.category !== null
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
    []
  );
  if (!res.fromCms) return { data: [], fromCms: false };
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
  const res = await cmsFetch<Array<Partial<RawProject>>>("/api/v1/projects?limit=100", ["projects"], []);
  if (!res.fromCms) return { data: [], fromCms: false };
  const data = res.data
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p, i) => normalizeProject(p as RawProject, i));
  return { data, fromCms: true };
});

export const getProject = cache(async (slug: string): Promise<CmsResult<Project | null>> => {
  const { data, fromCms } = await getProjects();
  const found = data.find((p) => p.slug === slug);
  if (found) return { data: found, fromCms: true };
  if (fromCms) {
    const res = await cmsFetch<RawProject>(`/api/v1/projects/${slug}`, ["projects"], null as unknown as RawProject, 30);
    if (res.fromCms && res.data) return { data: normalizeProject(res.data, 0), fromCms: true };
  }
  return { data: null, fromCms };
});

export const getArticles = cache(async (): Promise<CmsResult<Article[]>> => {
  const res = await cmsFetch<Array<Partial<RawArticle>>>("/api/v1/blog?limit=100", ["blog"], []);
  if (!res.fromCms) return { data: [], fromCms: false };
  const data = res.data
    .sort(
      (a, b) =>
        new Date((b.publishedAt as string) ?? 0).getTime() - new Date((a.publishedAt as string) ?? 0).getTime()
    )
    .map((a) => normalizeArticle(a as RawArticle));
  return { data, fromCms: true };
});

export const getArticle = cache(async (slug: string): Promise<CmsResult<Article | null>> => {
  const { data, fromCms } = await getArticles();
  const found = data.find((a) => a.slug === slug);
  if (found) return { data: found, fromCms: true };
  if (fromCms) {
    const res = await cmsFetch<RawArticle>(`/api/v1/blog/${slug}`, ["blog"], null as unknown as RawArticle, 30);
    if (res.fromCms && res.data) return { data: normalizeArticle(res.data), fromCms: true };
  }
  return { data: null, fromCms };
});

export const getTestimonials = cache(async (): Promise<CmsResult<Testimonial[]>> => {
  const res = await cmsFetch<Array<Partial<Testimonial> & { _id?: string; order?: number }>>(
    "/api/v1/testimonials?limit=50",
    ["testimonials"],
    []
  );
  if (!res.fromCms) return { data: [], fromCms: false };
  const data = res.data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((t) => ({
    quote: t.quote ?? "",
    name: t.name ?? "",
    role: t.role ?? "",
    company: t.company ?? "",
  }));
  return { data, fromCms: true };
});

/** Process steps come from the homepage "process" section when present. */
export const getProcessSteps = cache(async (): Promise<CmsResult<ProcessStep[]>> => {
  const { data, fromCms } = await getBootstrap();
  const processSection = data.homepage?.sections?.find((s) => s.type === "process");
  const items = processSection?.items;
  if (fromCms && items && items.length > 0) {
    return {
      data: items.map((item, i): ProcessStep => ({
        index: item.index ?? padIndex(i),
        title: item.title ?? `Step ${i + 1}`,
        summary: item.value ?? item.body ?? "",
        detail: item.body ?? item.value ?? "",
        // The admin stores deliverables as newline-separated text; tolerate
        // arrays (older seed data) and strings alike.
        deliverables: Array.isArray(item.paragraphs)
          ? item.paragraphs
          : typeof item.paragraphs === "string"
            ? item.paragraphs
                .split(/[\n,]/)
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
      })),
      fromCms: true,
    };
  }
  return { data: [], fromCms };
});

export const getClients = cache(
  async (): Promise<CmsResult<Array<{ name: string; mark?: string }>>> => {
    const { data, fromCms } = await getBootstrap();
    const clientsSection = data.homepage?.sections?.find((s) => s.type === "clients");
    if (fromCms && clientsSection?.clients && clientsSection.clients.length > 0) {
      return {
        data: clientsSection.clients.map((c) => ({ name: c.name ?? "", mark: c.mark ?? "" })),
        fromCms: true,
      };
    }
    return { data: [], fromCms };
  }
);

export const getFAQs = cache(
  async (): Promise<CmsResult<Array<{ question: string; answer: string; category?: string }>>> => {
    return cmsFetch<Array<{ question: string; answer: string; category?: string }>>(
      "/api/v1/faqs?limit=50",
      ["faqs"],
      []
    );
  }
);

export const getTeam = cache(async (): Promise<CmsResult<Array<Record<string, unknown>>>> => {
  return cmsFetch<Array<Record<string, unknown>>>("/api/v1/team?limit=50", ["team"], []);
});

export const getPage = cache(async (slug: string): Promise<CmsResult<Record<string, unknown> | null>> => {
  const res = await cmsFetch<Record<string, unknown>>(
    `/api/v1/pages/${slug}`,
    ["pages"],
    null as unknown as Record<string, unknown>,
    60
  );
  return { data: res.data ?? null, fromCms: res.fromCms };
});

/** Ordered, enabled homepage sections. */
export const getHomeSections = cache(async (): Promise<CmsResult<CmsSection[]>> => {
  const { data, fromCms } = await getBootstrap();
  const sections = data.homepage?.sections;
  if (fromCms && Array.isArray(sections)) {
    return {
      data: sections.filter((s) => s.enabled !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      fromCms: true,
    };
  }
  return { data: [], fromCms };
});

export const isMaintenanceMode = cache(async (): Promise<boolean> => {
  const { data } = await getBootstrap();
  return data.settings?.maintenance?.enabled === true;
});
