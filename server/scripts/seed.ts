/* ------------------------------------------------------------------ */
/*  KERN CMS — seed script                                             */
/*  Creates the initial SUPER_ADMIN, site singletons and the content   */
/*  that mirrors the existing static frontend. Idempotent: run any     */
/*  time; it never overwrites existing records.                        */
/* ------------------------------------------------------------------ */
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

dotenv.config();

import { env } from "../src/config/env";
import { applyDnsServers } from "../src/db/connect";
import { logger } from "../src/lib/logger";
import { AdminUser } from "../src/models/user";
import {
  SiteSettings,
  ThemeSettings,
  Navigation,
  Footer,
  SeoDefaults,
  HomePage,
  Page,
} from "../src/models/settings";
import { Service, Project, Testimonial, TeamMember, FAQ } from "../src/models/content";
import { BlogPost, BlogCategory } from "../src/models/blog";

const { DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;

/* ------------------------------------------------------------------ */
/*  Defaults mirroring client/lib/data                                 */
/* ------------------------------------------------------------------ */

const SITE = {
  name: "KERN",
  wordmark: "KERN®",
  legal: "KERN Studio",
  tagline: "Independent digital studio crafting experiences people remember.",
  email: "hello@kern.studio",
  location: "Dhaka — Worldwide",
  founded: 2014,
  url: "https://kern.studio",
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com", handle: "/kern-studio" },
    { label: "Instagram", url: "https://www.instagram.com", handle: "@kern.studio" },
    { label: "Behance", url: "https://www.behance.net", handle: "/kernstudio" },
    { label: "Dribbble", url: "https://dribbble.com", handle: "/kern" },
  ],
};

const NAV_ITEMS = [
  { label: "Work", href: "/work", type: "internal", target: "_self", enabled: true, order: 0 },
  { label: "Services", href: "/services", type: "internal", target: "_self", enabled: true, order: 1 },
  { label: "About", href: "/about", type: "internal", target: "_self", enabled: true, order: 2 },
  { label: "Insights", href: "/insights", type: "internal", target: "_self", enabled: true, order: 3 },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const SERVICES = [
  {
    title: "Strategy",
    tagline: "Decide what matters, then prove it.",
    description:
      "Before pixels and code there is a point of view. We research your market, pressure-test the brief and define the direction everything else hangs on.",
    items: ["Digital strategy", "Research & insights", "Product direction", "Positioning"],
    tools: ["Workshops", "Audits", "Analytics", "Prototyping"],
  },
  {
    title: "Design",
    tagline: "Interfaces with a point of view.",
    description:
      "We design systems, not screens. Typography-led, motion-native interfaces built on brand foundations that hold up across every touchpoint.",
    items: ["UX/UI", "Brand identity", "Art direction", "Design systems"],
    tools: ["Figma", "Motion studies", "Type systems", "Prototyping"],
  },
  {
    title: "Development",
    tagline: "Fast, correct, maintainable.",
    description:
      "Production-grade engineering on the modern stack. We ship performant applications that stay fast as they grow — and hand over code your team will actually enjoy.",
    items: ["Web applications", "Next.js", "Headless CMS", "API integrations"],
    tools: ["React / Next.js", "TypeScript", "Tailwind", "Vercel / Edge"],
  },
  {
    title: "AI & Automation",
    tagline: "Systems that do the tedious thinking.",
    description:
      "We turn repetitive workflows into intelligent systems — from AI products and agents to automations that quietly save your team hundreds of hours.",
    items: ["AI products", "AI agents", "Workflow automation", "Intelligent systems"],
    tools: ["LLM orchestration", "RAG pipelines", "n8n / custom", "Evaluation"],
  },
];

const PROJECTS = [
  {
    slug: "aura",
    title: "AURA",
    category: "Digital Experience",
    year: "2025",
    client: "AURA Labs — Skincare",
    description:
      "An immersive brand world built around light. E-commerce that feels less like a store and more like a ritual.",
    disciplines: ["Brand", "Web", "Development"],
    services: ["Strategy", "Brand identity", "Art direction", "Next.js build"],
    art: "/images/projects/aura.svg",
    outcomes: [
      { value: "+212%", label: "Conversion rate" },
      { value: "3.4×", label: "Longer sessions" },
      { value: "8", label: "Awwwards mentions" },
    ],
    narrative: [
      { heading: "A product people loved, a brand nobody could describe.", body: "AURA's serum was outselling competitors three to one — but the brand said nothing. We started with a single question: what does light feel like on skin? Everything we designed answered it." },
      { heading: "The whole experience became the packaging.", body: "We built a digital layer that behaves like the product: soft, gradual, precise. Custom easing curves, a light-scattering color system, and product pages that unfold like the brand's own ritual of application." },
      { heading: "Built to sell, designed to be felt.", body: "A headless commerce core with editorial storytelling on top. The result is a store that converts at 212% of the previous experience while making visitors feel they entered something intentional." },
    ],
    featured: true,
  },
  {
    slug: "nova",
    title: "NOVA",
    category: "AI Product",
    year: "2025",
    client: "NOVA Intelligence",
    description:
      "A research copilot that turns a wall of papers into a point of view. Strategy, UX and engineering for an AI product people actually trust.",
    disciplines: ["Strategy", "UX", "Development"],
    services: ["Product strategy", "UX/UI", "AI product", "Development"],
    art: "/images/projects/nova.svg",
    outcomes: [
      { value: "47%", label: "Time saved per researcher" },
      { value: "9.2/10", label: "Ease of use score" },
      { value: "120k", label: "Active researchers" },
    ],
    narrative: [
      { heading: "AI that answers, not just completes.", body: "NOVA processes thousands of research papers and answers in plain language — but only when it can show its work. The interface's core design principle: every claim is traceable to a source." },
      { heading: "Trust is a UX problem.", body: "We designed citation-first interactions — every generated insight opens its evidence chain. Skepticism was the product requirement. Confidence intervals, source previews and a 'why' on every answer." },
      { heading: "From prototype to platform.", body: "We shipped the product through three private betas, restructuring the architecture as the user base grew tenfold. Today NOVA is used daily by over 120,000 researchers." },
    ],
    featured: true,
  },
  {
    slug: "form",
    title: "FORM",
    category: "Architecture Platform",
    year: "2024",
    client: "FORM Architecture Studio",
    description:
      "A digital atelier for an architecture firm — a platform where buildings, drawings and ideas share one precise language.",
    disciplines: ["Digital Product", "3D", "Web"],
    services: ["Digital product", "3D experience", "Web development"],
    art: "/images/projects/form.svg",
    outcomes: [
      { value: "+180%", label: "Project inquiries" },
      { value: "6.1", label: "Avg. minutes per visit" },
      { value: "3", label: "FWA awards" },
    ],
    narrative: [
      { heading: "Buildings deserve better than a portfolio.", body: "FORM's work is about light, proportion and material. A flat gallery could never carry that. We designed a spatial browsing system — projects scale, layer and recede like plans on a drawing board." },
      { heading: "Drawings as interface.", body: "Floor plans become navigation. Every project opens from its own blueprint, and scrolling walks you through section, elevation and photograph. The building, not the website, is the hero." },
      { heading: "Precision in code.", body: "A 3D material explorer lets clients and press rotate through FORM's signature concrete and timber systems — rendered in-browser, at 60fps, on a laptop." },
    ],
    featured: true,
  },
  {
    slug: "motion",
    title: "MOTION",
    category: "Creative Technology",
    year: "2024",
    client: "MOTION Festival",
    description:
      "A living website for a festival of moving images — every year the site itself becomes another work in the program.",
    disciplines: ["Experience", "Development"],
    services: ["Creative technology", "Experience design", "Development"],
    art: "/images/projects/motion.svg",
    outcomes: [
      { value: "1.2M", label: "Festival visits" },
      { value: "+64%", label: "Ticket sales YoY" },
      { value: "4", label: "Years running" },
    ],
    narrative: [
      { heading: "A website that performs.", body: "MOTION asked us to build the festival's digital presence as one of its exhibits. The site animates, responds and transforms across the year — an archive in winter, a countdown in spring, a stage in summer." },
      { heading: "Motion with restraint.", body: "Every animation on the site follows the festival's own rules: one accent, one speed language, nothing decorative. Movement earns its place by carrying information." },
      { heading: "Built for the long run.", body: "A CMS-driven system lets the festival team reshape the site each edition. Four years in, the platform has outlived three redesign cycles elsewhere — and still feels ahead." },
    ],
    featured: true,
  },
  {
    slug: "kinetic",
    title: "KINETIC",
    category: "Commerce Platform",
    year: "2025",
    client: "KINETIC Footwear",
    description:
      "A performance-commerce experience for a running brand — engineered for speed in every sense of the word.",
    disciplines: ["Strategy", "Design", "Build"],
    services: ["Strategy", "UX/UI", "Headless commerce", "Development"],
    art: "/images/projects/kinetic.svg",
    outcomes: [
      { value: "+158%", label: "Mobile conversion" },
      { value: "0.8s", label: "Largest paint ready" },
      { value: "40ms", label: "Server response (edge)" },
    ],
    narrative: [
      { heading: "Speed as a brand value.", body: "KINETIC makes shoes for runners; we made their store as fast as the product. A 0.8s largest paint and predictive product pages that feel instant even on mid-range phones." },
      { heading: "Product as protagonist.", body: "Drop culture without the dark patterns — launch pages, colorways and sizing rendered as editorial spreads. Every asset is art-directed, every interaction earns the click." },
      { heading: "Commerce that ships.", body: "Headless commerce with a custom sizing engine, regionalized drops and an edge-deployed storefront. The team now runs launches in hours, not weeks." },
    ],
    featured: false,
  },
  {
    slug: "echo",
    title: "ECHO",
    category: "Brand System",
    year: "2023",
    client: "ECHO Records",
    description:
      "An identity in motion for an independent label — a brand system that bends, repeats and echoes across every release.",
    disciplines: ["Identity", "Motion", "Web"],
    services: ["Brand identity", "Motion system", "Web design"],
    art: "/images/projects/echo.svg",
    outcomes: [
      { value: "60+", label: "Releases with system art" },
      { value: "2×", label: "Streaming share" },
      { value: "5", label: "Design awards" },
    ],
    narrative: [
      { heading: "One system, infinite records.", body: "ECHO releases two records a month. Each needs cover art, web presence and social motion — impossible to art-direct by hand. We built a generative identity: a core glyph that echoes into endless variations." },
      { heading: "Rules that create surprise.", body: "Artists input three parameters — mood, tempo, era — and the system composes the artwork. No two releases look alike, yet every one is unmistakably ECHO." },
      { heading: "From identity to platform.", body: "The generative engine now powers the label's site, storefront and socials. ECHO's catalog finally looks like the label it always was." },
    ],
    featured: false,
  },
];

const INSIGHTS = [
  {
    slug: "the-death-of-the-landing-page",
    category: "Thinking",
    title: "The death of the landing page",
    dateISO: "2026-04-14",
    readingTime: "6 min read",
    excerpt:
      "The landing page was a compromise born in 2003. It's time to stop designing rooms for people who never arrive.",
    art: "/images/insights/landing.svg",
    pullQuote: "Nobody lands anymore. They arrive mid-conversation.",
    content: [
      { heading: "The origin of the compromise", paragraphs: ["The landing page assumes a visitor arrives at a doorway with no context, and that the doorway must sell the house in one glance. That assumption shaped two decades of web design: hero, three benefits, testimonial, form.", "But most traffic no longer arrives that way. People come from a link in a newsletter, a search result that already answered the easy questions, a colleague's Slack message with the punchline already attached. By the time they hit your URL, the pitch is half-made."] },
      { heading: "Design for arrival, not landing", paragraphs: ["The strongest sites we build now behave like a conversation already in progress. They confirm what the visitor already knows, skip what they've already heard, and go deep on the one question that remains.", "That means ruthless editing. Every section asks: who is this for, and what do they still not know? If a section can't answer, it goes. The result is shorter pages that convert better — and feel like they respect the visitor."] },
      { heading: "What replaces it", paragraphs: ["Not a new layout — a new standard. Pages structured around the visitor's actual journey, with information density that rises with their intent. The doorway disappears; the conversation begins."] },
    ],
  },
  {
    slug: "designing-for-attention-spans",
    category: "Making",
    title: "Designing for attention spans",
    dateISO: "2026-03-02",
    readingTime: "4 min read",
    excerpt:
      "Users don't have short attention spans. They have excellent spam filters. Design like they're filtering you.",
    art: "/images/insights/attention.svg",
    pullQuote: "The average attention span is a myth. The average relevance is the real problem.",
    content: [
      { heading: "Attention is not scarce — relevance is", paragraphs: ["People will watch a four-hour documentary and abandon a thirty-second video. The difference was never duration. It was whether the content justified itself within the first moments.", "When we audit a failing product, the problem is almost never 'the users don't read.' It's that the page makes them read six paragraphs before earning the one that matters."] },
      { heading: "The three-second contract", paragraphs: ["We design under a simple rule: within three seconds, a visitor should know what this is, whether it's for them, and where to go next. That contract is paid in typography, not in paragraphs — one honest headline, one clear action, zero decoration that competes."] },
      { heading: "Motion as a filter, not a garnish", paragraphs: ["Animation is powerful precisely because it's scarce. The sites that hold attention use motion to say one thing at a time — the scroll reveals the next idea only when the last one is understood."] },
    ],
  },
  {
    slug: "small-teams-big-products",
    category: "Exploring",
    title: "Small teams, big products",
    dateISO: "2026-02-10",
    readingTime: "5 min read",
    excerpt:
      "Fourteen people shipped six of the most-visited products in our portfolio this year. Here's how small teams beat big ones.",
    art: "/images/insights/small-teams.svg",
    pullQuote: "A small team isn't a limitation. It's a forcing function.",
    content: [
      { heading: "The size of the team vs. the size of the thinking", paragraphs: ["Every project in our studio runs on teams of three to five. Strategy, design and engineering sit in the same room, read the same research, and argue about the same pixels. Decisions that take a large organization three meetings take us one conversation.", "Small teams lose raw capacity and gain something more valuable: context. Nobody hands work 'over the wall' because there is no wall."] },
      { heading: "Opinionated by necessity", paragraphs: ["With limited people, you can't afford to build everything. Small teams are forced to be opinionated — and that opinion, stated clearly, is usually what the client actually needed.", "It's why our engagements start with a week of argument. Disagreement is cheap early; redesign is expensive late."] },
      { heading: "The compounding effect", paragraphs: ["Small teams that stay together compound knowledge. Our core team has shipped together for years, which means the twentieth project starts at the level most teams reach at launch."] },
    ],
  },
  {
    slug: "brand-toolkit-motion-systems",
    category: "Thinking",
    title: "The new brand toolkit: motion systems",
    dateISO: "2026-01-19",
    readingTime: "7 min read",
    excerpt:
      "Logos don't move, but brands do. A motion system is the difference between a brand that exists and a brand that behaves.",
    art: "/images/insights/motion-systems.svg",
    pullQuote: "A static brand is a brand that has already been archived.",
    content: [
      { heading: "Brands used to be pictures", paragraphs: ["The twentieth-century brand was a mark, a palette, a typeface — a still image to be stamped on things. The twenty-first century brand is behavior: it loads, it responds, it transitions, it breathes.", "Yet most rebrands still deliver a PDF of static guidelines. Then the website team improvises the motion, the product team improvises theirs, and the brand quietly fractures across every screen."] },
      { heading: "What a motion system actually is", paragraphs: ["It is not a library of animations. It is a set of rules with the same authority as a color palette: a speed language, an easing vocabulary, a hierarchy of movement, and a definition of what never moves.", "The best motion systems are small. One accent, one curve, three speeds — enough to feel intentional everywhere, few enough to be enforceable."] },
      { heading: "The measurable payoff", paragraphs: ["Consistent motion isn't decoration — it's wayfinding. Users learn a product's grammar in minutes and carry it across features. We've measured the difference: motion systems cut perceived load time, reduce support questions and lift brand recall by a wide margin."] },
    ],
  },
];

const TESTIMONIALS = [
  { quote: "They didn't just redesign our website. They completely changed how people perceive our brand.", name: "Maya Rahman", role: "Founder & CEO", company: "AURA Labs" },
  { quote: "The rare studio where strategy survives contact with code. Everything they shipped looked exactly like what they promised — and felt even better.", name: "Daniel Osei", role: "VP of Product", company: "NOVA Intelligence" },
  { quote: "We've worked with agencies in three capitals. KERN is the only team we'd call back without a pitch.", name: "Elena Fischer", role: "Managing Partner", company: "FORM Architecture" },
  { quote: "They argued with us where it mattered and agreed with us where it didn't. The result made our investors ask who built it.", name: "Jonas Berg", role: "CMO", company: "KINETIC Footwear" },
];

const HOME_SECTIONS = [
  {
    type: "hero",
    key: "hero",
    label: "Hero",
    enabled: true,
    order: 0,
    eyebrow: "Independent digital studio — Dhaka / Worldwide",
    items: [
      { index: "01", title: "We create" },
      { index: "02", title: "Digital experiences", mark: "accent" },
      { index: "03", title: "That move people." },
    ],
    body: "Strategy, design and technology for ambitious brands — from Dhaka to everywhere.",
    cta: { label: "Explore our work", href: "/work" },
    secondaryCta: { label: "Start a project", href: "/contact" },
    meta: {
      facts: [
        { label: "Location", value: "Dhaka — Worldwide" },
        { label: "Founded", value: "2014" },
        { label: "Team", value: "14 people" },
      ],
    },
  },
  {
    type: "marquee",
    key: "capabilities-marquee",
    label: "Capabilities marquee",
    enabled: true,
    order: 1,
    marquee: ["Strategy", "Design", "Development", "Branding", "AI", "Digital Products"],
  },
  {
    type: "selected-work",
    key: "selected-work",
    label: "Selected work",
    enabled: true,
    order: 2,
    heading: "Chosen, not everything",
    eyebrow: "Selected work",
    index: "2023 → 2026",
    meta: { right: "Hover a row to preview", ctaLabel: "View all projects" },
  },
  {
    type: "horizontal-projects",
    key: "horizontal-projects",
    label: "Fresh from the studio",
    enabled: true,
    order: 3,
    heading: "Fresh from the studio",
    body: "A rotating window into what we shipped this year — selected by the team, not by the algorithm.",
    cta: { label: "All projects", href: "/work" },
  },
  {
    type: "services",
    key: "services",
    label: "Services",
    enabled: true,
    order: 4,
    eyebrow: "What we do",
    index: "04 capabilities",
    heading: "One standard of obsession",
    body: "Four disciplines, one team. Pick a single capability or hand us the whole product — the bar is the same.",
  },
  {
    type: "process",
    key: "process",
    label: "Process",
    enabled: true,
    order: 5,
    eyebrow: "How we work",
    heading: "From brief to launch, in five steps.",
  },
  {
    type: "about",
    key: "about-teaser",
    label: "About teaser",
    enabled: true,
    order: 6,
    eyebrow: "About the studio",
    items: [
      { title: "We are a small, obsessive team building big digital experiences." },
      { body: "Fourteen people. No account managers, no handoffs, no PowerPoint-deck strategy. Designers, engineers and strategists sit in the same room and argue until the work is better — then argue some more." },
      { body: "We take on a handful of projects a year and stay until they perform. Most of our clients have been with us for three years or more; a few never really left." },
    ],
    cta: { label: "More about us", href: "/about" },
    image: "/images/studio/portrait.svg",
    meta: {
      facts: [
        { label: "Founded", value: "2014" },
        { label: "Team", value: "14 people" },
        { label: "Studios", value: "2 — Dhaka / Remote" },
        { label: "Timezone", value: "UTC+6, always on" },
      ],
    },
  },
  {
    type: "stats",
    key: "stats",
    label: "Stats",
    enabled: true,
    order: 7,
    stats: [
      { value: "12", suffix: "+", label: "Years of experience" },
      { value: "80", suffix: "+", label: "Digital projects shipped" },
      { value: "24", suffix: "", label: "Countries served" },
      { value: "15", suffix: "", label: "Industries explored" },
    ],
  },
  {
    type: "testimonials",
    key: "testimonials",
    label: "Testimonials",
    enabled: true,
    order: 8,
    eyebrow: "Client words",
  },
  {
    type: "clients",
    key: "clients",
    label: "Clients",
    enabled: true,
    order: 9,
    eyebrow: "Trusted by teams at",
    clients: [
      { name: "AURA", mark: "®" },
      { name: "NOVA", mark: "✦" },
      { name: "FORM", mark: "◼" },
      { name: "MOTION", mark: "→" },
      { name: "KINETIC", mark: "↗" },
      { name: "ECHO", mark: "◎" },
      { name: "HELIX", mark: "×" },
      { name: "MERIDIAN", mark: "✳" },
    ],
  },
  {
    type: "insights",
    key: "insights-teaser",
    label: "Insights teaser",
    enabled: true,
    order: 10,
    eyebrow: "Thinking / Making / Exploring",
    heading: "Notes from the studio",
    cta: { label: "All articles", href: "/insights" },
  },
  {
    type: "cta",
    key: "final-cta",
    label: "Final CTA",
    enabled: true,
    order: 11,
    eyebrow: "06 / New business",
    items: [
      { title: "Have" },
      { title: "a" },
      { title: "project" },
      { title: "worth" },
      { title: "building?" },
    ],
    cta: { label: "Let's talk", href: "/contact" },
    meta: { ring: "START A PROJECT • WE REPLY WITHIN 48H • START A PROJECT • WE REPLY WITHIN 48H •" },
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function upsertSingleton(model: any, data: Record<string, unknown>) {
  const existing = await model.findOne();
  if (existing) {
    logger.info(`Seed: ${model.modelName} exists — skipping`);
    return existing;
  }
  const doc = await model.create(data);
  logger.info(`Seed: created ${model.modelName}`);
  return doc;
}

async function upsertBySlug(model: any, docs: Array<Record<string, unknown>>) {
  let created = 0;
  for (const data of docs) {
    const exists = await model.findOne({ slug: (data as { slug: string }).slug });
    if (exists) continue;
    await model.create({
      ...data,
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: created,
    });
    created++;
  }
  logger.info(`Seed: ${model.modelName} — ${created} created, ${docs.length - created} existing`);
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function main() {
  if (!DATABASE_URL) {
    logger.error("DATABASE_URL is required (copy server/.env.example to server/.env)");
    process.exit(1);
  }
  applyDnsServers();
  await mongoose.connect(DATABASE_URL, { serverSelectionTimeoutMS: 5000 });
  logger.info("Connected to MongoDB");

  // Admin
  const adminEmail = (SEED_ADMIN_EMAIL ?? "admin@kern.studio").toLowerCase();
  const adminPassword = SEED_ADMIN_PASSWORD ?? "KernAdmin!2026";
  const existingAdmin = await AdminUser.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await AdminUser.create({
      name: "Studio Admin",
      email: adminEmail,
      role: "SUPER_ADMIN",
      active: true,
      passwordHash: await bcrypt.hash(adminPassword, 12),
    });
    logger.info(`Seed: created SUPER_ADMIN ${adminEmail}`);
  } else {
    logger.info("Seed: SUPER_ADMIN exists — skipping");
  }

  await upsertSingleton(SiteSettings, {
    ...SITE,
    loadingScreen: {
      enabled: true,
      title: "KERN®",
      subtitle: "Independent digital studio",
      loadingText: "Loading experience",
      showCounter: true,
      duration: 1.55,
    },
    announcementBar: { enabled: false, text: "", link: "" },
  });
  await upsertSingleton(ThemeSettings, {});
  await upsertSingleton(Navigation, { items: NAV_ITEMS, cta: { label: "Let's Talk", href: "/contact", enabled: true } });
  await upsertSingleton(Footer, {
    description: SITE.tagline,
    columns: [
      { title: "Sitemap", links: [{ label: "Work", href: "/work" }, { label: "Services", href: "/services" }, { label: "About", href: "/about" }, { label: "Insights", href: "/insights" }, { label: "Contact", href: "/contact" }] },
    ],
    socials: SITE.socials,
    contact: { phone: "", email: SITE.email, address: "Dhaka — Worldwide" },
    copyright: `© ${new Date().getFullYear()} ${SITE.legal}. All rights reserved.`,
    legalLinks: [],
    newsletter: { enabled: false, title: "Stay in the loop" },
  });
  await upsertSingleton(SeoDefaults, {
    defaultTitle: "KERN® — Digital Experience Studio",
    titleTemplate: "%s — KERN®",
    defaultDescription: SITE.tagline,
    keywords: ["digital agency", "creative studio", "web design", "Next.js development", "brand identity", "AI product design", "ux design"],
    ogImage: "/og.png",
    twitterHandle: "",
    robots: { index: true, follow: true },
    organizationSchema: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE.legal,
      url: SITE.url,
      email: SITE.email,
      slogan: SITE.tagline,
      foundingDate: "2014",
      address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
      sameAs: SITE.socials.map((s) => s.url),
    },
  });
  await upsertSingleton(HomePage, { sections: HOME_SECTIONS });

  const serviceDocs = SERVICES.map((s, i) => ({ ...s, slug: slugify(s.title), index: String(i + 1).padStart(2, "0") }));
  await upsertBySlug(Service, serviceDocs as unknown as Array<Record<string, unknown>>);
  await upsertBySlug(Project, PROJECTS as unknown as Array<Record<string, unknown>>);

  // Testimonials have no slug — upsert by name.
  let testimonialsCreated = 0;
  for (const t of TESTIMONIALS) {
    const exists = await Testimonial.findOne({ name: t.name });
    if (exists) continue;
    await Testimonial.create({ ...t, status: "PUBLISHED", order: testimonialsCreated });
    testimonialsCreated++;
  }
  logger.info(`Seed: Testimonial — ${testimonialsCreated} created`);

  // Blog categories + posts
  const categories = ["Thinking", "Making", "Exploring"];
  const catIds: Record<string, string> = {};
  for (const name of categories) {
    const slug = name.toLowerCase();
    let cat = await BlogCategory.findOne({ slug });
    if (!cat) cat = await BlogCategory.create({ name, slug });
    catIds[name] = String(cat._id);
  }

  let posts = 0;
  for (const article of INSIGHTS) {
    const exists = await BlogPost.findOne({ slug: article.slug });
    if (exists) continue;
    const [y, m, d] = article.dateISO.split("-").map(Number);
    const published = new Date(Date.UTC(y, m - 1, d));
    await BlogPost.create({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      art: article.art,
      author: "The KERN® editorial desk",
      category: catIds[article.category],
      readingTime: article.readingTime,
      pullQuote: article.pullQuote,
      featured: false,
      status: "PUBLISHED",
      publishedAt: published,
    });
    posts++;
  }
  logger.info(`Seed: BlogPost — ${posts} created`);

  // Team Members
  const TEAM_MEMBERS = [
    {
      name: "Alex Rivera",
      position: "Principal & Creative Director",
      bio: "Focusing on the intersection of typography, systems design and expressive interaction.",
      image: "/images/studio/portrait.svg",
      skills: ["Creative Direction", "Brand Systems", "Interaction Design"],
      order: 0,
      visible: true,
    },
    {
      name: "Elena Rostova",
      position: "Head of Engineering",
      bio: "Building high-performance web applications and resilient headless architectures.",
      image: "/images/studio/portrait.svg",
      skills: ["Next.js", "TypeScript", "Distributed Systems", "WebGL"],
      order: 1,
      visible: true,
    },
    {
      name: "Marcus Vance",
      position: "Design Systems Lead",
      bio: "Translating brand identities into scalable, tokenized multi-platform component systems.",
      image: "/images/studio/portrait.svg",
      skills: ["Design Systems", "UI/UX", "Motion Graphics"],
      order: 2,
      visible: true,
    },
    {
      name: "Sara Chen",
      position: "Director of Product Strategy",
      bio: "Bridging business positioning, user research and high-velocity digital execution.",
      image: "/images/studio/portrait.svg",
      skills: ["Product Strategy", "User Research", "Market Positioning"],
      order: 3,
      visible: true,
    },
  ];

  let teamCreated = 0;
  for (const m of TEAM_MEMBERS) {
    const exists = await TeamMember.findOne({ name: m.name });
    if (!exists) {
      await TeamMember.create(m);
      teamCreated++;
    }
  }
  logger.info(`Seed: TeamMember — ${teamCreated} created`);

  // FAQs
  const FAQS = [
    {
      question: "What is your typical project timeline?",
      answer: "Most core studio engagements range from 4 to 12 weeks depending on scope, complexity, and systems integration.",
      category: "Process",
      order: 0,
      enabled: true,
    },
    {
      question: "How do you structure engagements?",
      answer: "We work in dedicated sprint blocks or retained partnership models with clear weekly deliverables and direct team access.",
      category: "Pricing & Scope",
      order: 1,
      enabled: true,
    },
    {
      question: "Do you work with early-stage startups as well as enterprises?",
      answer: "Yes. We partner with high-growth seed/Series A startups redefining categories as well as global enterprise teams modernizing design systems.",
      category: "Clients",
      order: 2,
      enabled: true,
    },
    {
      question: "What technologies do you specialize in?",
      answer: "Next.js, React, TypeScript, Tailwind CSS, headless CMS architectures, Node.js microservices, and AI workflow automation.",
      category: "Technology",
      order: 3,
      enabled: true,
    },
  ];

  let faqsCreated = 0;
  for (const f of FAQS) {
    const exists = await FAQ.findOne({ question: f.question });
    if (!exists) {
      await FAQ.create(f);
      faqsCreated++;
    }
  }
  // Dynamic Custom Pages
  const DEMO_PAGES = [
    {
      title: "About Studio",
      slug: "about",
      description: "KERN is a small, obsessive team of fourteen — strategists, designers and engineers building digital experiences that matter.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 0,
      seo: { title: "About — KERN®", description: "Learn about the philosophy, values, and team behind KERN." },
      sections: [
        {
          type: "hero",
          key: "about-hero",
          label: "About Hero",
          enabled: true,
          order: 0,
          heading: "We are a small, obsessive team building big digital experiences.",
          eyebrow: "About the studio",
          cta: { label: "Our Capabilities", href: "/services" },
          secondaryCta: { label: "Get in touch", href: "/contact" },
        },
        {
          type: "text",
          key: "about-philosophy",
          label: "Philosophy Section",
          enabled: true,
          order: 1,
          heading: "Why we exist",
          eyebrow: "Philosophy",
          body: "Most digital products are designed to be safe. We design the ones people remember — which means opinions, restraint and a willingness to delete the mediocre.\n\nWe believe craft is a business strategy. The fastest way to be chosen is to be visibly better, and that starts with how the interface breathes, not just how it functions.\n\nAnd we believe small teams win. Fewer hands mean fewer handoffs, and fewer handoffs mean the work keeps its point of view from the first sketch to the final deploy.",
        },
        {
          type: "features",
          key: "about-values",
          label: "Four Rules / Values",
          enabled: true,
          order: 2,
          heading: "Four Rules",
          eyebrow: "Culture",
          subheading: "How we behave when nobody is looking.",
          items: [
            { index: "01", title: "Obsession", body: "We notice the 4px nobody asked about, and we fix it before you see it." },
            { index: "02", title: "Precision", body: "Words, spacing and data agree with each other — or we don't ship." },
            { index: "03", title: "Candor", body: "We tell you when an idea is bad. We've saved clients months doing it." },
            { index: "04", title: "Momentum", body: "Weekly builds, visible progress, no mystery. Velocity is a design material." },
          ],
        },
        {
          type: "team",
          key: "about-team",
          label: "Studio Team",
          enabled: true,
          order: 3,
          heading: "Leadership & Craft",
          eyebrow: "The People",
          body: "Fourteen people across strategy, design, engineering and AI. No account managers between you and the work.",
        },
        {
          type: "stats",
          key: "about-stats",
          label: "Impact Stats",
          enabled: true,
          order: 4,
          heading: "By the numbers",
          eyebrow: "Metrics",
          stats: [
            { value: "14", label: "Studio members" },
            { value: "06", label: "Active client teams" },
            { value: "04h", label: "Average sync overlap" },
            { value: "100%", label: "Senior craft" },
          ],
        },
        {
          type: "cta",
          key: "about-cta",
          label: "Final CTA",
          enabled: true,
          order: 5,
          heading: "Have a project worth building?",
          eyebrow: "06 / New business",
          cta: { label: "Let's talk", href: "/contact" },
        },
      ],
    },
    {
      title: "Services",
      slug: "services",
      description: "Strategy, design, development and AI — four disciplines under one roof, one standard of obsession.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 1,
      seo: { title: "Services — KERN®", description: "Our core capabilities in digital strategy, design, and engineering." },
      sections: [
        {
          type: "hero",
          key: "services-hero",
          label: "Services Hero",
          enabled: true,
          order: 0,
          heading: "What we do.",
          eyebrow: "04 Capabilities",
          subheading: "Strategy, design, engineering and AI under one roof. Pick a single discipline or hand us the whole product.",
          cta: { label: "Start a project", href: "/contact" },
        },
        {
          type: "services",
          key: "services-grid",
          label: "Capabilities Grid",
          enabled: true,
          order: 1,
          heading: "Core Capabilities",
          eyebrow: "What We Deliver",
        },
        {
          type: "features",
          key: "services-engagements",
          label: "Ways of Working",
          enabled: true,
          order: 2,
          heading: "Three ways in",
          eyebrow: "How we engage",
          items: [
            { index: "01", title: "The project", body: "A defined scope, a fixed team, a clear timeline. Most engagements run 8–16 weeks from kickoff to launch." },
            { index: "02", title: "The retainer", body: "An ongoing partnership — product iteration, design systems and engineering on tap, billed monthly." },
            { index: "03", title: "The sprint", body: "Two to four weeks of focused work on a single problem: a redesign, an AI prototype, a launch push." },
          ],
        },
        {
          type: "faqs",
          key: "services-faqs",
          label: "Services FAQs",
          enabled: true,
          order: 3,
          heading: "Frequently Asked Questions",
          eyebrow: "05 / Clarity",
          body: "Everything you need to know before partnering with us.",
        },
        {
          type: "marquee",
          key: "services-tech",
          label: "Technology Stack",
          enabled: true,
          order: 4,
          marquee: ["Next.js", "React", "TypeScript", "GSAP", "Tailwind", "Node.js", "Postgres", "Vercel", "OpenAI"],
        },
        {
          type: "cta",
          key: "services-cta",
          label: "Services CTA",
          enabled: true,
          order: 5,
          heading: "Ready to accelerate your product?",
          eyebrow: "Start Here",
          cta: { label: "Get in touch", href: "/contact" },
        },
      ],
    },
    {
      title: "Selected Work",
      slug: "work",
      description: "Case studies and products built by KERN studio.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 2,
      seo: { title: "Work — KERN®", description: "Explore selected digital products and brand platforms." },
      sections: [
        {
          type: "hero",
          key: "work-hero",
          label: "Work Hero",
          enabled: true,
          order: 0,
          heading: "Selected work.",
          eyebrow: "03 / Case Studies",
          subheading: "Digital products, design systems, and brand platforms built for clarity and speed.",
          cta: { label: "Start your project", href: "/contact" },
        },
        {
          type: "portfolio",
          key: "work-portfolio",
          label: "Projects Showcase",
          enabled: true,
          order: 1,
          heading: "All Case Studies",
          eyebrow: "Featured Work",
        },
        {
          type: "testimonials",
          key: "work-testimonials",
          label: "Client Testimonials",
          enabled: true,
          order: 2,
          heading: "What founders say",
          eyebrow: "Endorsements",
        },
        {
          type: "cta",
          key: "work-cta",
          label: "Work CTA",
          enabled: true,
          order: 3,
          heading: "Let's build your next benchmark.",
          eyebrow: "New Business",
          cta: { label: "Start a project", href: "/contact" },
        },
      ],
    },
    {
      title: "Studio Insights",
      slug: "insights",
      description: "Thinking, making, and exploring — notes from the studio on design, technology, and craft.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 3,
      seo: { title: "Insights — KERN®", description: "Articles and thinking on digital design and engineering." },
      sections: [
        {
          type: "hero",
          key: "insights-hero",
          label: "Insights Hero",
          enabled: true,
          order: 0,
          heading: "Notes from the studio.",
          eyebrow: "Thinking / Making / Exploring",
          subheading: "Opinions on interface design, engineering rigor, and digital product strategy.",
        },
        {
          type: "insights",
          key: "insights-grid",
          label: "Articles Grid",
          enabled: true,
          order: 1,
          heading: "Latest Publications",
          eyebrow: "Essays",
        },
        {
          type: "cta",
          key: "insights-cta",
          label: "Newsletter CTA",
          enabled: true,
          order: 2,
          heading: "Get new essays in your inbox.",
          eyebrow: "Studio Letter",
          cta: { label: "Subscribe", href: "/contact" },
        },
      ],
    },
    {
      title: "Studio Manifesto",
      slug: "manifesto",
      description: "Our philosophy on software engineering, visual craft, and deliberate restraint.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 4,
      seo: {
        title: "Manifesto — KERN® Digital Studio",
        description: "Our core principles on building exceptional digital experiences.",
      },
      sections: [
        {
          type: "hero",
          key: "manifesto-hero",
          label: "Hero Section",
          enabled: true,
          order: 0,
          heading: "Craft as a business strategy.",
          subheading: "In an era of generic templates and bloated abstractions, we choose precision, speed, and point of view.",
          eyebrow: "Our Manifesto",
          cta: { label: "Explore Work", href: "/work" },
          secondaryCta: { label: "Get in touch", href: "/contact" },
        },
        {
          type: "features",
          key: "manifesto-principles",
          label: "Core Principles",
          enabled: true,
          order: 1,
          heading: "How we build",
          eyebrow: "Principles",
          items: [
            { index: "01", title: "Obsessive Polish", body: "We notice the 4px micro-details and fix them before anyone asks." },
            { index: "02", title: "Zero Filler", body: "Every line of code and word of copy must earn its place on screen." },
            { index: "03", title: "Shared Velocity", body: "Direct collaboration between builders and founders without bureaucratic layers." },
            { index: "04", title: "Production Grade", body: "Accessibility, sub-second load times, and dynamic CMS synchronization out of the box." },
          ],
        },
        {
          type: "cta",
          key: "manifesto-cta",
          label: "Manifesto CTA",
          enabled: true,
          order: 2,
          heading: "Ready to partner?",
          eyebrow: "Collaboration",
          cta: { label: "Start a conversation", href: "/contact" },
        },
      ],
    },
    {
      title: "Careers",
      slug: "careers",
      description: "Join our dedicated team of designers, engineers, and digital craftsmen.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      order: 5,
      seo: {
        title: "Careers — KERN® Studio",
        description: "Open roles at KERN digital studio.",
      },
      sections: [
        {
          type: "hero",
          key: "careers-hero",
          label: "Careers Hero",
          enabled: true,
          order: 0,
          heading: "Do the best work of your career.",
          subheading: "We are always looking for obsessive designers, full-stack engineers, and motion specialists.",
          eyebrow: "Open Roles",
          cta: { label: "View Team", href: "/about" },
          secondaryCta: { label: "Contact Us", href: "/contact" },
        },
        {
          type: "team",
          key: "careers-team",
          label: "Meet the Team",
          enabled: true,
          order: 1,
          heading: "Meet your future teammates",
          eyebrow: "The Studio",
        },
        {
          type: "faqs",
          key: "careers-faqs",
          label: "Hiring FAQs",
          enabled: true,
          order: 2,
          heading: "Working at KERN",
          eyebrow: "FAQ",
          items: [
            { title: "Is the role remote or in-person?", body: "We operate a hybrid studio with our headquarters in Dhaka and distributed team members worldwide." },
            { title: "What is the interview process?", body: "A single technical/portfolio conversation followed by a paid 1-week collaborative trial sprint." },
          ],
        },
        {
          type: "cta",
          key: "careers-cta",
          label: "Careers CTA",
          enabled: true,
          order: 3,
          heading: "Don't see your role?",
          eyebrow: "General Inquiries",
          cta: { label: "Send your portfolio", href: "/contact" },
        },
      ],
    },
  ];

  let pagesCreated = 0;
  for (const p of DEMO_PAGES) {
    const exists = await Page.findOne({ slug: p.slug });
    if (!exists) {
      await Page.create(p);
      pagesCreated++;
    }
  }
  logger.info(`Seed: Page — ${pagesCreated} created`);

  await mongoose.disconnect();
  logger.info("Seed complete");
}

main().catch((err) => {
  logger.error("Seed failed", { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
