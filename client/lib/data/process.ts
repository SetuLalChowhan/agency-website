export type ProcessStep = {
  index: string;
  title: string;
  summary: string;
  detail: string;
  deliverables: string[];
};

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Discover",
    summary: "We listen before we propose.",
    detail:
      "Stakeholder interviews, market scans and product teardowns. We find the gap between what your business says and what your users feel — that gap is the opportunity.",
    deliverables: ["Research synthesis", "Opportunity map"],
  },
  {
    index: "02",
    title: "Define",
    summary: "One direction, argued well.",
    detail:
      "Strategy crystallizes into a single product narrative. We agree on what we're building, what we're not, and how we'll measure success — in writing.",
    deliverables: ["Positioning", "Success metrics"],
  },
  {
    index: "03",
    title: "Design",
    summary: "Interfaces with a point of view.",
    detail:
      "Typography, motion and layout systems designed in the open. You see working prototypes early — because screens in a deck lie, and prototypes don't.",
    deliverables: ["Design system", "Interactive prototype"],
  },
  {
    index: "04",
    title: "Build",
    summary: "Engineering that respects the design.",
    detail:
      "Production-grade development in weekly sprints. Performance budgets, accessibility audits and continuous staging deploys — the design survives contact with code.",
    deliverables: ["Production app", "QA & performance"],
  },
  {
    index: "05",
    title: "Launch",
    summary: "Ship, measure, improve.",
    detail:
      "Coordinated release, analytics instrumentation and a post-launch optimization cycle. We stay past the launch party until the numbers tell the story we designed.",
    deliverables: ["Launch", "Optimization cycle"],
  },
];
