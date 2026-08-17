import type { Model } from "mongoose";
import {
  Service,
  Project,
  CaseStudy,
  Testimonial,
  TeamMember,
  FAQ,
} from "../models/content";
import { BlogPost, BlogCategory, BlogTag } from "../models/blog";
import { Page } from "../models/settings";

export type RegistryConfig = {
  /** Public API route segment, e.g. /api/v1/projects */
  key: string;
  label: string;
  model: Model<unknown>;
  /** Fields kept when listing/serving publicly. */
  publicFields: Record<string, 1 | 0>;
  /** Fields to search with ?q= */
  searchFields: string[];
  /** Fields allowed in ?sort= */
  sortable: string[];
  /** Show on public site (published only, by default) */
  public: boolean;
  /** Mongoose populate for list/detail (public + admin). */
  populate?: string;
  /** Revalidation tag used by the client. */
  tag: string;
};

function f(fields: string[]): Record<string, 1> {
  return Object.fromEntries(fields.map((k) => [k, 1])) as Record<string, 1>;
}

export const contentRegistry: RegistryConfig[] = [
  {
    key: "services",
    label: "Service",
    model: Service as unknown as Model<unknown>,
    publicFields: f(["title", "slug", "tagline", "description", "items", "tools", "icon", "featuredImage", "order", "updatedAt"]),
    searchFields: ["title", "tagline", "description"],
    sortable: ["order", "createdAt", "updatedAt", "title"],
    public: true,
    tag: "services",
  },
  {
    key: "projects",
    label: "Project",
    model: Project as unknown as Model<unknown>,
    publicFields: f([
      "title", "slug", "client", "category", "industry", "year", "description",
      "disciplines", "services", "technologies", "art", "gallery", "outcomes",
      "narrative", "challenges", "solution", "results", "projectUrl", "testimonial",
      "featured", "order", "updatedAt",
    ]),
    searchFields: ["title", "client", "category", "description"],
    sortable: ["order", "createdAt", "updatedAt", "title", "year"],
    public: true,
    tag: "projects",
  },
  {
    key: "case-studies",
    label: "Case study",
    model: CaseStudy as unknown as Model<unknown>,
    publicFields: f([
      "title", "slug", "client", "industry", "year", "overview", "challenge",
      "solution", "strategy", "implementation", "results", "metrics", "technologies",
      "gallery", "featuredImage", "testimonial", "cta", "featured", "order", "updatedAt",
    ]),
    searchFields: ["title", "client", "industry", "overview"],
    sortable: ["order", "createdAt", "updatedAt", "title", "year"],
    public: true,
    tag: "case-studies",
  },
  {
    key: "testimonials",
    label: "Testimonial",
    model: Testimonial as unknown as Model<unknown>,
    publicFields: f(["quote", "name", "role", "company", "avatar", "rating", "project", "featured", "order"]),
    searchFields: ["name", "company", "quote"],
    sortable: ["order", "createdAt", "name"],
    public: true,
    tag: "testimonials",
  },
  {
    key: "team",
    label: "Team member",
    model: TeamMember as unknown as Model<unknown>,
    publicFields: f(["name", "position", "bio", "image", "socials", "skills", "order"]),
    searchFields: ["name", "position", "bio"],
    sortable: ["order", "createdAt", "name"],
    public: true,
    tag: "team",
  },
  {
    key: "faqs",
    label: "FAQ",
    model: FAQ as unknown as Model<unknown>,
    publicFields: f(["question", "answer", "category", "order"]),
    searchFields: ["question", "answer", "category"],
    sortable: ["order", "createdAt", "question"],
    public: true,
    tag: "faqs",
  },
  {
    key: "blog",
    label: "Blog post",
    model: BlogPost as unknown as Model<unknown>,
    publicFields: f([
      "title", "slug", "excerpt", "content", "art", "author", "category", "tags",
      "readingTime", "pullQuote", "featured", "publishedAt", "updatedAt",
    ]),
    searchFields: ["title", "excerpt", "author"],
    sortable: ["publishedAt", "createdAt", "updatedAt", "title"],
    public: true,
    populate: "category tags",
    tag: "blog",
  },
  {
    key: "blog-categories",
    label: "Blog category",
    model: BlogCategory as unknown as Model<unknown>,
    publicFields: f(["name", "slug"]),
    searchFields: ["name"],
    sortable: ["name", "createdAt"],
    public: true,
    tag: "blog",
  },
  {
    key: "blog-tags",
    label: "Blog tag",
    model: BlogTag as unknown as Model<unknown>,
    publicFields: f(["name", "slug"]),
    searchFields: ["name"],
    sortable: ["name", "createdAt"],
    public: true,
    tag: "blog",
  },
  {
    key: "pages",
    label: "Page",
    model: Page as unknown as Model<unknown>,
    publicFields: f(["slug", "title", "description", "sections", "seo", "order", "showInNav", "showInFooter"]),
    searchFields: ["title", "slug", "description"],
    sortable: ["order", "createdAt", "updatedAt", "title"],
    public: true,
    tag: "pages",
  },
];

export function getRegistry(key: string): RegistryConfig | undefined {
  return contentRegistry.find((c) => c.key === key);
}
