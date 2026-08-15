export const site = {
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
  nav: [
    { label: "Work", href: "/work" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Insights", href: "/insights" },
  ],
  marquee: ["Strategy", "Design", "Development", "Branding", "AI", "Digital Products"],
  stats: [
    { value: 12, suffix: "+", label: "Years of experience" },
    { value: 80, suffix: "+", label: "Digital projects shipped" },
    { value: 24, suffix: "", label: "Countries served" },
    { value: 15, suffix: "", label: "Industries explored" },
  ],
} as const;

export type NavItem = (typeof site.nav)[number];
