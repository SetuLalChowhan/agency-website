export type FieldDef = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "checkbox"
    | "number"
    | "slug"
    | "image"
    | "tags"
    | "rows"
    | "meta";
  placeholder?: string;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
  /** For rows: subfields of each row. */
  subfields?: Array<{ key: string; label: string; type: "text" | "textarea" }>;
  /** Skip in list view (summary). */
  listHidden?: boolean;
  /** Group label in the editor. */
  group?: string;
};

export type CollectionConfig = {
  key: string;
  label: string;
  singular: string;
  apiPath: string;
  fields: FieldDef[];
  /** Row shown in the list (title-ish field). */
  titleField: string;
  subtitleField?: string;
  statusField: "status" | "enabled" | "visible" | null;
  orderable: boolean;
};

export const COLLECTIONS: Record<string, CollectionConfig> = {
  services: {
    key: "services",
    label: "Services",
    singular: "Service",
    apiPath: "/api/v1/admin/content/services",
    titleField: "title",
    subtitleField: "tagline",
    statusField: "status",
    orderable: true,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug", type: "slug", hint: "Auto-generated from the title when left blank." },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "items", label: "Capabilities", type: "tags", hint: "One per line or comma-separated." },
      { key: "tools", label: "How we work", type: "tags" },
      { key: "icon", label: "Icon name", type: "text", hint: "Optional icon identifier." },
      { key: "featuredImage", label: "Featured image", type: "image" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" },
      ]},
      { key: "order", label: "Order", type: "number" },
      { key: "seo", label: "SEO", type: "meta", subfields: [
        { key: "title", label: "SEO title", type: "text" },
        { key: "description", label: "Meta description", type: "textarea" },
      ], hint: "Optional — falls back to global SEO.", listHidden: true },
    ],
  },

  projects: {
    key: "projects",
    label: "Projects",
    singular: "Project",
    apiPath: "/api/v1/admin/content/projects",
    titleField: "title",
    subtitleField: "category",
    statusField: "status",
    orderable: true,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug", type: "slug" },
      { key: "client", label: "Client", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "industry", label: "Industry", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "description", label: "Short description", type: "textarea" },
      { key: "art", label: "Cover image", type: "image" },
      { key: "disciplines", label: "Disciplines", type: "tags" },
      { key: "services", label: "Services", type: "tags" },
      { key: "technologies", label: "Technologies", type: "tags" },
      { key: "outcomes", label: "Outcomes / results", type: "rows", subfields: [
        { key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" },
      ]},
      { key: "narrative", label: "Narrative", type: "rows", subfields: [
        { key: "heading", label: "Heading", type: "text" }, { key: "body", label: "Body", type: "textarea" },
      ]},
      { key: "challenges", label: "Challenges", type: "textarea" },
      { key: "solution", label: "Solution", type: "textarea" },
      { key: "results", label: "Results", type: "textarea" },
      { key: "projectUrl", label: "Project URL", type: "text" },
      { key: "featured", label: "Featured", type: "checkbox" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" },
      ]},
      { key: "order", label: "Order", type: "number" },
      { key: "seo", label: "SEO", type: "meta", subfields: [
        { key: "title", label: "SEO title", type: "text" }, { key: "description", label: "Meta description", type: "textarea" },
      ], listHidden: true },
    ],
  },

  "case-studies": {
    key: "case-studies",
    label: "Case studies",
    singular: "Case study",
    apiPath: "/api/v1/admin/content/case-studies",
    titleField: "title",
    subtitleField: "client",
    statusField: "status",
    orderable: true,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug", type: "slug" },
      { key: "client", label: "Client", type: "text" },
      { key: "industry", label: "Industry", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "overview", label: "Overview", type: "textarea" },
      { key: "challenge", label: "Challenge", type: "textarea" },
      { key: "solution", label: "Solution", type: "textarea" },
      { key: "strategy", label: "Strategy", type: "textarea" },
      { key: "implementation", label: "Implementation", type: "textarea" },
      { key: "results", label: "Results", type: "textarea" },
      { key: "metrics", label: "Metrics", type: "rows", subfields: [
        { key: "value", label: "Value", type: "text" }, { key: "label", label: "Label", type: "text" },
      ]},
      { key: "technologies", label: "Technologies", type: "tags" },
      { key: "featuredImage", label: "Featured image", type: "image" },
      { key: "gallery", label: "Gallery", type: "tags", hint: "Image URLs, one per line." },
      { key: "featured", label: "Featured", type: "checkbox" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" },
      ]},
      { key: "order", label: "Order", type: "number" },
      { key: "seo", label: "SEO", type: "meta", subfields: [
        { key: "title", label: "SEO title", type: "text" }, { key: "description", label: "Meta description", type: "textarea" },
      ], listHidden: true },
    ],
  },

  testimonials: {
    key: "testimonials",
    label: "Testimonials",
    singular: "Testimonial",
    apiPath: "/api/v1/admin/content/testimonials",
    titleField: "name",
    subtitleField: "company",
    statusField: "status",
    orderable: true,
    fields: [
      { key: "quote", label: "Quote", type: "textarea" },
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "avatar", label: "Avatar", type: "image" },
      { key: "rating", label: "Rating (0–5)", type: "number" },
      { key: "project", label: "Project", type: "text" },
      { key: "featured", label: "Featured", type: "checkbox" },
      { key: "order", label: "Order", type: "number" },
      { key: "status", label: "Status", type: "select", options: [
        { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" },
      ]},
    ],
  },

  team: {
    key: "team",
    label: "Team",
    singular: "Team member",
    apiPath: "/api/v1/admin/content/team",
    titleField: "name",
    subtitleField: "position",
    statusField: "visible",
    orderable: true,
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "position", label: "Position", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "image", label: "Profile image", type: "image" },
      { key: "skills", label: "Skills", type: "tags" },
      { key: "socials", label: "Social links", type: "rows", subfields: [
        { key: "label", label: "Label", type: "text" }, { key: "url", label: "URL", type: "text" }, { key: "handle", label: "Handle", type: "text" },
      ]},
      { key: "order", label: "Order", type: "number" },
      { key: "visible", label: "Visible on site", type: "checkbox" },
    ],
  },

  faqs: {
    key: "faqs",
    label: "FAQs",
    singular: "FAQ",
    apiPath: "/api/v1/admin/content/faqs",
    titleField: "question",
    statusField: "enabled",
    orderable: true,
    fields: [
      { key: "question", label: "Question", type: "text" },
      { key: "answer", label: "Answer", type: "textarea" },
      { key: "category", label: "Category", type: "text" },
      { key: "order", label: "Order", type: "number" },
      { key: "enabled", label: "Enabled on site", type: "checkbox" },
    ],
  },

  "blog-categories": {
    key: "blog-categories",
    label: "Blog categories",
    singular: "Category",
    apiPath: "/api/v1/admin/content/blog-categories",
    titleField: "name",
    statusField: null,
    orderable: false,
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "slug", label: "Slug", type: "slug" },
    ],
  },

  "blog-tags": {
    key: "blog-tags",
    label: "Blog tags",
    singular: "Tag",
    apiPath: "/api/v1/admin/content/blog-tags",
    titleField: "name",
    statusField: null,
    orderable: false,
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "slug", label: "Slug", type: "slug" },
    ],
  },

  pages: {
    key: "pages",
    label: "Pages",
    singular: "Page",
    apiPath: "/api/v1/admin/content/pages",
    titleField: "title",
    subtitleField: "slug",
    statusField: "status",
    orderable: true,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug", type: "slug" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sections", label: "Sections", type: "rows", subfields: [
        { key: "type", label: "Type", type: "text" },
        { key: "heading", label: "Heading", type: "text" },
        { key: "body", label: "Body", type: "textarea" },
        { key: "image", label: "Image URL", type: "text" },
      ]},
      { key: "status", label: "Status", type: "select", options: [
        { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" }, { value: "ARCHIVED", label: "Archived" },
      ]},
      { key: "order", label: "Order", type: "number" },
      { key: "seo", label: "SEO", type: "meta", subfields: [
        { key: "title", label: "SEO title", type: "text" }, { key: "description", label: "Meta description", type: "textarea" },
      ], listHidden: true },
    ],
  },
};
