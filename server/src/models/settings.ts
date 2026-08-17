import mongoose, { Schema } from "mongoose";

const socialSchema = new Schema({ label: String, url: String, handle: String }, { _id: false });

/* ------------------------------------------------------------------ */
/*  Site settings (single document)                                    */
/* ------------------------------------------------------------------ */
const siteSettingsSchema = new Schema(
  {
    name: { type: String, default: "KERN" },
    wordmark: { type: String, default: "KERN®" },
    legal: { type: String, default: "KERN Studio" },
    tagline: { type: String, default: "" },
    email: { type: String, default: "" },
    location: { type: String, default: "Dhaka — Worldwide" },
    founded: { type: Number, default: 2014 },
    url: { type: String, default: "https://kern.studio" },
    socials: { type: [socialSchema], default: [] },
    logo: { type: String, default: "" },
    logoDark: { type: String, default: "" },
    logoMobile: { type: String, default: "" },
    favicon: { type: String, default: "" },
    loadingScreen: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      loadingText: { type: String, default: "Loading experience" },
      showCounter: { type: Boolean, default: true },
      duration: { type: Number, default: 1.55 },
    },
    announcementBar: {
      enabled: { type: Boolean, default: false },
      text: { type: String, default: "" },
      link: { type: String, default: "" },
    },
    globalCta: {
      enabled: { type: Boolean, default: true },
      label: { type: String, default: "Let's Talk" },
      href: { type: String, default: "/contact" },
    },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: { type: String, default: "We'll be right back." },
    },
    customScripts: { type: [String], default: [] },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Theme (single document)                                            */
/* ------------------------------------------------------------------ */
const themeSchema = new Schema(
  {
    primary: { type: String, default: "#d4ff47" }, // accent / brand
    secondary: { type: String, default: "#f1ede3" },
    accent: { type: String, default: "#d4ff47" },
    background: { type: String, default: "#0c0c0a" },
    surface: { type: String, default: "#121210" },
    heading: { type: String, default: "#f1ede3" },
    body: { type: String, default: "#f1ede3" },
    muted: { type: String, default: "#9b978a" },
    border: { type: String, default: "#3a382f" },
    button: { type: String, default: "#d4ff47" },
    buttonHover: { type: String, default: "#f1ede3" },
    buttonText: { type: String, default: "#0c0c0a" },
    link: { type: String, default: "#f1ede3" },
    selection: { type: String, default: "#d4ff47" },
    ink: { type: String, default: "#0c0c0a" },
    ink2: { type: String, default: "#121210" },
    ink3: { type: String, default: "#191914" },
    paper: { type: String, default: "#f1ede3" },
    paper2: { type: String, default: "#e6e1d3" },
    acid: { type: String, default: "#d4ff47" },
    smoke: { type: String, default: "#9b978a" },
    stone: { type: String, default: "#5c574b" },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Navigation (single document)                                       */
/* ------------------------------------------------------------------ */
const navItemSchema = new Schema(
  {
    label: { type: String, required: true },
    href: { type: String, required: true },
    type: { type: String, enum: ["internal", "external"], default: "internal" },
    target: { type: String, enum: ["_self", "_blank"], default: "_self" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    children: { type: [Schema.Types.Mixed], default: [] }, // { label, href, type, target }
  },
  { _id: true }
);

const navigationSchema = new Schema(
  {
    items: { type: [navItemSchema], default: [] },
    cta: {
      label: { type: String, default: "Let's Talk" },
      href: { type: String, default: "/contact" },
      enabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Footer (single document)                                           */
/* ------------------------------------------------------------------ */
const footerLinkSchema = new Schema({ label: String, href: String }, { _id: false });
const footerColumnSchema = new Schema(
  { title: String, links: { type: [footerLinkSchema], default: [] } },
  { _id: false }
);

const footerSchema = new Schema(
  {
    description: { type: String, default: "" },
    columns: { type: [footerColumnSchema], default: [] },
    socials: { type: [socialSchema], default: [] },
    contact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
    },
    copyright: { type: String, default: "" },
    legalLinks: { type: [footerLinkSchema], default: [] },
    newsletter: {
      enabled: { type: Boolean, default: false },
      title: { type: String, default: "Stay in the loop" },
    },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Home page sections (single document — ordered, enable/disable)     */
/* ------------------------------------------------------------------ */
const sectionItemSchema = new Schema(
  {
    index: String,
    title: String,
    body: String,
    value: String,
    suffix: String,
    label: String,
    name: String,
    mark: String,
    heading: String,
    paragraphs: { type: [String], default: [] },
  },
  { _id: false }
);

const ctaSchema = new Schema({ label: String, href: String }, { _id: false });

const homeSectionSchema = new Schema(
  {
    type: { type: String, required: true }, // hero | marquee | selected-work | horizontal-projects | services | process | about | stats | testimonials | clients | insights | cta
    key: { type: String, required: true },
    label: { type: String, default: "" },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    heading: { type: String, default: "" },
    subheading: { type: String, default: "" },
    body: { type: String, default: "" },
    image: { type: String, default: "" },
    eyebrow: { type: String, default: "" },
    cta: { type: ctaSchema, default: {} },
    secondaryCta: { type: ctaSchema, default: {} },
    stats: { type: [sectionItemSchema], default: [] },
    items: { type: [sectionItemSchema], default: [] },
    clients: { type: [sectionItemSchema], default: [] },
    marquee: { type: [String], default: [] },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const homePageSchema = new Schema(
  {
    sections: { type: [homeSectionSchema], default: [] },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Global SEO defaults (single document)                              */
/* ------------------------------------------------------------------ */
const seoDefaultsSchema = new Schema(
  {
    titleTemplate: { type: String, default: "%s — KERN®" },
    defaultTitle: { type: String, default: "KERN® — Digital Experience Studio" },
    defaultDescription: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    ogImage: { type: String, default: "/og.png" },
    twitterHandle: { type: String, default: "" },
    robots: {
      index: { type: Boolean, default: true },
      follow: { type: Boolean, default: true },
    },
    organizationSchema: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

/* ------------------------------------------------------------------ */
/*  Custom pages (static pages with structured sections)               */
/* ------------------------------------------------------------------ */
const pageSectionSchema = new Schema(
  {
    type: { type: String, default: "richtext" },
    heading: String,
    body: String,
    image: String,
    items: { type: [sectionItemSchema], default: [] },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: true }
);

const pageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    sections: { type: [pageSectionSchema], default: [] },
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" },
    publishedAt: { type: Date },
    seo: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
export const ThemeSettings = mongoose.model("ThemeSettings", themeSchema);
export const Navigation = mongoose.model("Navigation", navigationSchema);
export const Footer = mongoose.model("Footer", footerSchema);
export const HomePage = mongoose.model("HomePage", homePageSchema);
export const SeoDefaults = mongoose.model("SeoDefaults", seoDefaultsSchema);
export const Page = mongoose.model("Page", pageSchema);
