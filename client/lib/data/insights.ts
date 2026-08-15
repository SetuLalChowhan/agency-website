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

export const articles: Article[] = [
  {
    slug: "the-death-of-the-landing-page",
    category: "Thinking",
    title: "The death of the landing page",
    date: "April 2026",
    dateISO: "2026-04-14",
    readingTime: "6 min read",
    excerpt:
      "The landing page was a compromise born in 2003. It's time to stop designing rooms for people who never arrive.",
    art: "/images/insights/landing.svg",
    pullQuote: "Nobody lands anymore. They arrive mid-conversation.",
    body: [
      {
        heading: "The origin of the compromise",
        paragraphs: [
          "The landing page assumes a visitor arrives at a doorway with no context, and that the doorway must sell the house in one glance. That assumption shaped two decades of web design: hero, three benefits, testimonial, form.",
          "But most traffic no longer arrives that way. People come from a link in a newsletter, a search result that already answered the easy questions, a colleague's Slack message with the punchline already attached. By the time they hit your URL, the pitch is half-made.",
        ],
      },
      {
        heading: "Design for arrival, not landing",
        paragraphs: [
          "The strongest sites we build now behave like a conversation already in progress. They confirm what the visitor already knows, skip what they've already heard, and go deep on the one question that remains.",
          "That means ruthless editing. Every section asks: who is this for, and what do they still not know? If a section can't answer, it goes. The result is shorter pages that convert better — and feel like they respect the visitor.",
        ],
      },
      {
        heading: "What replaces it",
        paragraphs: [
          "Not a new layout — a new standard. Pages structured around the visitor's actual journey, with information density that rises with their intent. The doorway disappears; the conversation begins.",
        ],
      },
    ],
  },
  {
    slug: "designing-for-attention-spans",
    category: "Making",
    title: "Designing for attention spans",
    date: "March 2026",
    dateISO: "2026-03-02",
    readingTime: "4 min read",
    excerpt:
      "Users don't have short attention spans. They have excellent spam filters. Design like they're filtering you.",
    art: "/images/insights/attention.svg",
    pullQuote: "The average attention span is a myth. The average relevance is the real problem.",
    body: [
      {
        heading: "Attention is not scarce — relevance is",
        paragraphs: [
          "People will watch a four-hour documentary and abandon a thirty-second video. The difference was never duration. It was whether the content justified itself within the first moments.",
          "When we audit a failing product, the problem is almost never 'the users don't read.' It's that the page makes them read six paragraphs before earning the one that matters.",
        ],
      },
      {
        heading: "The three-second contract",
        paragraphs: [
          "We design under a simple rule: within three seconds, a visitor should know what this is, whether it's for them, and where to go next. That contract is paid in typography, not in paragraphs — one honest headline, one clear action, zero decoration that competes.",
        ],
      },
      {
        heading: "Motion as a filter, not a garnish",
        paragraphs: [
          "Animation is powerful precisely because it's scarce. The sites that hold attention use motion to say one thing at a time — the scroll reveals the next idea only when the last one is understood.",
        ],
      },
    ],
  },
  {
    slug: "small-teams-big-products",
    category: "Exploring",
    title: "Small teams, big products",
    date: "February 2026",
    dateISO: "2026-02-10",
    readingTime: "5 min read",
    excerpt:
      "Fourteen people shipped six of the most-visited products in our portfolio this year. Here's how small teams beat big ones.",
    art: "/images/insights/small-teams.svg",
    pullQuote: "A small team isn't a limitation. It's a forcing function.",
    body: [
      {
        heading: "The size of the team vs. the size of the thinking",
        paragraphs: [
          "Every project in our studio runs on teams of three to five. Strategy, design and engineering sit in the same room, read the same research, and argue about the same pixels. Decisions that take a large organization three meetings take us one conversation.",
          "Small teams lose raw capacity and gain something more valuable: context. Nobody hands work 'over the wall' because there is no wall.",
        ],
      },
      {
        heading: "Opinionated by necessity",
        paragraphs: [
          "With limited people, you can't afford to build everything. Small teams are forced to be opinionated — and that opinion, stated clearly, is usually what the client actually needed.",
          "It's why our engagements start with a week of argument. Disagreement is cheap early; redesign is expensive late.",
        ],
      },
      {
        heading: "The compounding effect",
        paragraphs: [
          "Small teams that stay together compound knowledge. Our core team has shipped together for years, which means the twentieth project starts at the level most teams reach at launch.",
        ],
      },
    ],
  },
  {
    slug: "brand-toolkit-motion-systems",
    category: "Thinking",
    title: "The new brand toolkit: motion systems",
    date: "January 2026",
    dateISO: "2026-01-19",
    readingTime: "7 min read",
    excerpt:
      "Logos don't move, but brands do. A motion system is the difference between a brand that exists and a brand that behaves.",
    art: "/images/insights/motion-systems.svg",
    pullQuote: "A static brand is a brand that has already been archived.",
    body: [
      {
        heading: "Brands used to be pictures",
        paragraphs: [
          "The twentieth-century brand was a mark, a palette, a typeface — a still image to be stamped on things. The twenty-first century brand is behavior: it loads, it responds, it transitions, it breathes.",
          "Yet most rebrands still deliver a PDF of static guidelines. Then the website team improvises the motion, the product team improvises theirs, and the brand quietly fractures across every screen.",
        ],
      },
      {
        heading: "What a motion system actually is",
        paragraphs: [
          "It is not a library of animations. It is a set of rules with the same authority as a color palette: a speed language, an easing vocabulary, a hierarchy of movement, and a definition of what never moves.",
          "The best motion systems are small. One accent, one curve, three speeds — enough to feel intentional everywhere, few enough to be enforceable.",
        ],
      },
      {
        heading: "The measurable payoff",
        paragraphs: [
          "Consistent motion isn't decoration — it's wayfinding. Users learn a product's grammar in minutes and carry it across features. We've measured the difference: motion systems cut perceived load time, reduce support questions and lift brand recall by a wide margin.",
        ],
      },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}
