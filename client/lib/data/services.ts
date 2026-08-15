export type Service = {
  index: string;
  title: string;
  tagline: string;
  description: string;
  items: string[];
  tools: string[];
};

export const services: Service[] = [
  {
    index: "01",
    title: "Strategy",
    tagline: "Decide what matters, then prove it.",
    description:
      "Before pixels and code there is a point of view. We research your market, pressure-test the brief and define the direction everything else hangs on.",
    items: ["Digital strategy", "Research & insights", "Product direction", "Positioning"],
    tools: ["Workshops", "Audits", "Analytics", "Prototyping"],
  },
  {
    index: "02",
    title: "Design",
    tagline: "Interfaces with a point of view.",
    description:
      "We design systems, not screens. Typography-led, motion-native interfaces built on brand foundations that hold up across every touchpoint.",
    items: ["UX/UI", "Brand identity", "Art direction", "Design systems"],
    tools: ["Figma", "Motion studies", "Type systems", "Prototyping"],
  },
  {
    index: "03",
    title: "Development",
    tagline: "Fast, correct, maintainable.",
    description:
      "Production-grade engineering on the modern stack. We ship performant applications that stay fast as they grow — and hand over code your team will actually enjoy.",
    items: ["Web applications", "Next.js", "Headless CMS", "API integrations"],
    tools: ["React / Next.js", "TypeScript", "Tailwind", "Vercel / Edge"],
  },
  {
    index: "04",
    title: "AI & Automation",
    tagline: "Systems that do the tedious thinking.",
    description:
      "We turn repetitive workflows into intelligent systems — from AI products and agents to automations that quietly save your team hundreds of hours.",
    items: ["AI products", "AI agents", "Workflow automation", "Intelligent systems"],
    tools: ["LLM orchestration", "RAG pipelines", "n8n / custom", "Evaluation"],
  },
];
