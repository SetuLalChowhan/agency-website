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

export const projects: Project[] = [
  {
    slug: "aura",
    index: "01",
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
      {
        heading: "A product people loved, a brand nobody could describe.",
        body: "AURA's serum was outselling competitors three to one — but the brand said nothing. We started with a single question: what does light feel like on skin? Everything we designed answered it.",
      },
      {
        heading: "The whole experience became the packaging.",
        body: "We built a digital layer that behaves like the product: soft, gradual, precise. Custom easing curves, a light-scattering color system, and product pages that unfold like the brand's own ritual of application.",
      },
      {
        heading: "Built to sell, designed to be felt.",
        body: "A headless commerce core with editorial storytelling on top. The result is a store that converts at 212% of the previous experience while making visitors feel they entered something intentional.",
      },
    ],
    featured: true,
  },
  {
    slug: "nova",
    index: "02",
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
      {
        heading: "AI that answers, not just completes.",
        body: "NOVA processes thousands of research papers and answers in plain language — but only when it can show its work. The interface's core design principle: every claim is traceable to a source.",
      },
      {
        heading: "Trust is a UX problem.",
        body: "We designed citation-first interactions — every generated insight opens its evidence chain. Skepticism was the product requirement. Confidence intervals, source previews and a 'why' on every answer.",
      },
      {
        heading: "From prototype to platform.",
        body: "We shipped the product through three private betas, restructuring the architecture as the user base grew tenfold. Today NOVA is used daily by over 120,000 researchers.",
      },
    ],
    featured: true,
  },
  {
    slug: "form",
    index: "03",
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
      {
        heading: "Buildings deserve better than a portfolio.",
        body: "FORM's work is about light, proportion and material. A flat gallery could never carry that. We designed a spatial browsing system — projects scale, layer and recede like plans on a drawing board.",
      },
      {
        heading: "Drawings as interface.",
        body: "Floor plans become navigation. Every project opens from its own blueprint, and scrolling walks you through section, elevation and photograph. The building, not the website, is the hero.",
      },
      {
        heading: "Precision in code.",
        body: "A 3D material explorer lets clients and press rotate through FORM's signature concrete and timber systems — rendered in-browser, at 60fps, on a laptop.",
      },
    ],
    featured: true,
  },
  {
    slug: "motion",
    index: "04",
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
      {
        heading: "A website that performs.",
        body: "MOTION asked us to build the festival's digital presence as one of its exhibits. The site animates, responds and transforms across the year — an archive in winter, a countdown in spring, a stage in summer.",
      },
      {
        heading: "Motion with restraint.",
        body: "Every animation on the site follows the festival's own rules: one accent, one speed language, nothing decorative. Movement earns its place by carrying information.",
      },
      {
        heading: "Built for the long run.",
        body: "A CMS-driven system lets the festival team reshape the site each edition. Four years in, the platform has outlived three redesign cycles elsewhere — and still feels ahead.",
      },
    ],
    featured: true,
  },
  {
    slug: "kinetic",
    index: "05",
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
      {
        heading: "Speed as a brand value.",
        body: "KINETIC makes shoes for runners; we made their store as fast as the product. A 0.8s largest paint and predictive product pages that feel instant even on mid-range phones.",
      },
      {
        heading: "Product as protagonist.",
        body: "Drop culture without the dark patterns — launch pages, colorways and sizing rendered as editorial spreads. Every asset is art-directed, every interaction earns the click.",
      },
      {
        heading: "Commerce that ships.",
        body: "Headless commerce with a custom sizing engine, regionalized drops and an edge-deployed storefront. The team now runs launches in hours, not weeks.",
      },
    ],
    featured: false,
  },
  {
    slug: "echo",
    index: "06",
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
      {
        heading: "One system, infinite records.",
        body: "ECHO releases two records a month. Each needs cover art, web presence and social motion — impossible to art-direct by hand. We built a generative identity: a core glyph that echoes into endless variations.",
      },
      {
        heading: "Rules that create surprise.",
        body: "Artists input three parameters — mood, tempo, era — and the system composes the artwork. No two releases look alike, yet every one is unmistakably ECHO.",
      },
      {
        heading: "From identity to platform.",
        body: "The generative engine now powers the label's site, storefront and socials. ECHO's catalog finally looks like the label it always was.",
      },
    ],
    featured: false,
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
