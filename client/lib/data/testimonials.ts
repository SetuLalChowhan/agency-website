export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "They didn't just redesign our website. They completely changed how people perceive our brand.",
    name: "Maya Rahman",
    role: "Founder & CEO",
    company: "AURA Labs",
  },
  {
    quote:
      "The rare studio where strategy survives contact with code. Everything they shipped looked exactly like what they promised — and felt even better.",
    name: "Daniel Osei",
    role: "VP of Product",
    company: "NOVA Intelligence",
  },
  {
    quote:
      "We've worked with agencies in three capitals. KERN is the only team we'd call back without a pitch.",
    name: "Elena Fischer",
    role: "Managing Partner",
    company: "FORM Architecture",
  },
  {
    quote:
      "They argued with us where it mattered and agreed with us where it didn't. The result made our investors ask who built it.",
    name: "Jonas Berg",
    role: "CMO",
    company: "KINETIC Footwear",
  },
];
