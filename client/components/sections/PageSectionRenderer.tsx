"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { RevealImage } from "@/components/ui/RevealImage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Magnetic } from "@/components/ui/Magnetic";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Marquee } from "@/components/home/Marquee";
import { StatsSection, type StatItem } from "@/components/home/StatsSection";
import type { CmsSection, Service, Project, Article, Testimonial } from "@/lib/cms";

type PageSectionRendererProps = {
  sections?: CmsSection[];
  services?: Service[];
  projects?: Project[];
  articles?: Article[];
  testimonials?: Testimonial[];
  team?: Array<any>;
  faqs?: Array<{ question: string; answer: string; category?: string }>;
};

/* ------------------------------------------------------------------ */
/*  Interactive FAQ Accordion Item Component                          */
/* ------------------------------------------------------------------ */
function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="border-b hairline-d transition-colors">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-6 text-left"
        aria-expanded={open}
      >
        <span className="display text-lg text-paper md:text-xl">{question}</span>
        <div
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border hairline-d transition-transform duration-300 ${
            open ? "rotate-180 border-acid text-acid" : "text-smoke"
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>
      {open && (
        <div className="pb-6 pr-8 text-sm leading-relaxed text-smoke animate-in fade-in slide-in-from-top-1 duration-200">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Interactive Inline Contact Form Component                         */
/* ------------------------------------------------------------------ */
function InlineContactForm({ heading, body }: { heading?: string; body?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error("Failed to send inquiry");
      setSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1920px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeader
              label="06 / Connect"
              title={heading || "Start a project"}
            />
            {body && <p className="mt-4 text-sm text-smoke">{body}</p>}
          </div>
          <div className="lg:col-span-7">
            {sent ? (
              <div className="flex flex-col items-center justify-center rounded border hairline-d bg-ink-2 p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-acid text-ink">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="display mt-4 text-2xl text-paper">Message received</h3>
                <p className="mt-2 text-sm text-smoke">
                  Thank you for reaching out. We reply to all inquiries within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded border hairline-d bg-ink-2 p-8 md:p-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="meta-label text-stone">Your name</span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Rivera"
                      className="border-b hairline-d bg-transparent py-2 text-paper focus:border-acid focus:outline-none"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="meta-label text-stone">Email address</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@company.com"
                      className="border-b hairline-d bg-transparent py-2 text-paper focus:border-acid focus:outline-none"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="meta-label text-stone">Project details</span>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the project, scope, and target launch..."
                    className="border-b hairline-d bg-transparent py-2 text-paper focus:border-acid focus:outline-none"
                  />
                </label>
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 flex w-max items-center gap-2 rounded bg-acid px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Submit Inquiry"} <ArrowUpRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Universal Page Section Renderer                              */
/* ------------------------------------------------------------------ */
export function PageSectionRenderer({
  sections = [],
  services = [],
  projects = [],
  articles = [],
  testimonials = [],
  team = [],
  faqs = [],
}: PageSectionRendererProps) {
  const activeSections = sections.filter((s) => s.enabled !== false);

  if (activeSections.length === 0) {
    return null;
  }

  return (
    <>
      {activeSections.map((sec, idx) => {
        const key = sec.key || `${sec.type}-${idx}`;

        switch (sec.type) {
          /* ---------------------------------------------------------------- */
          /*  HERO SECTION                                                    */
          /* ---------------------------------------------------------------- */
          case "hero": {
            return (
              <section key={key} className="relative overflow-hidden px-5 pt-36 pb-20 md:px-10 md:pt-52 md:pb-32">
                <div className="mx-auto max-w-[1920px]">
                  {sec.eyebrow && (
                    <div className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-acid" />
                      <span className="meta-label text-smoke">{sec.eyebrow}</span>
                    </div>
                  )}

                  <h1 className="display mt-6 max-w-[16ch] text-[clamp(2.5rem,7vw,6.5rem)] leading-[0.94] text-paper">
                    {sec.heading || "Digital experiences that scale."}
                  </h1>

                  {sec.subheading && (
                    <p className="mt-8 max-w-2xl text-lg leading-relaxed text-smoke md:text-xl">
                      {sec.subheading}
                    </p>
                  )}

                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    {sec.cta?.label && (
                      <Magnetic>
                        <Link
                          href={sec.cta.href || "/contact"}
                          className="flex items-center gap-2 rounded bg-acid px-6 py-4 text-xs font-semibold uppercase tracking-wider text-ink transition-transform hover:scale-[1.02]"
                        >
                          {sec.cta.label} <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Magnetic>
                    )}
                    {sec.secondaryCta?.label && (
                      <Link
                        href={sec.secondaryCta.href || "#content"}
                        className="flex items-center gap-2 rounded border hairline-d px-6 py-4 text-xs font-semibold uppercase tracking-wider text-paper hover:border-acid hover:text-acid transition-colors"
                      >
                        {sec.secondaryCta.label}
                      </Link>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  EDITORIAL TEXT SECTION                                          */
          /* ---------------------------------------------------------------- */
          case "text": {
            return (
              <section key={key} className="px-5 py-24 md:px-10 md:py-36 border-t hairline-d">
                <div className="mx-auto max-w-[1920px]">
                  <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                      <SectionHeader
                        label={sec.eyebrow || "Philosophy"}
                        title={sec.heading || "A point of view"}
                      />
                    </div>
                    <div className="lg:col-span-7">
                      <div className="prose prose-invert max-w-none text-base leading-relaxed text-smoke md:text-lg">
                        <p className="whitespace-pre-line">{sec.body}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  SPLIT MEDIA + TEXT SECTION                                      */
          /* ---------------------------------------------------------------- */
          case "split":
          case "about": {
            return (
              <section key={key} className="px-5 py-24 md:px-10 md:py-36 border-t hairline-d bg-ink-2">
                <div className="mx-auto max-w-[1920px]">
                  <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-6">
                      <RevealImage
                        src={sec.image || "/images/studio/portrait.svg"}
                        alt={sec.heading || "Studio media"}
                        className="aspect-[4/3] w-full rounded border hairline-d"
                      />
                    </div>
                    <div className="lg:col-span-6 flex flex-col gap-6">
                      <SectionHeader
                        label={sec.eyebrow || "02 / Overview"}
                        title={sec.heading || "Crafted with intent"}
                      />
                      <p className="text-base leading-relaxed text-smoke md:text-lg whitespace-pre-line">
                        {sec.body}
                      </p>
                      {sec.cta?.label && (
                        <div className="pt-2">
                          <Link
                            href={sec.cta.href || "/services"}
                            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-acid hover:underline"
                          >
                            {sec.cta.label} →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  FEATURES / VALUES GRID                                          */
          /* ---------------------------------------------------------------- */
          case "features": {
            const items = sec.items || [];
            return (
              <section key={key} className="px-5 py-24 md:px-10 md:py-36 border-t hairline-d">
                <div className="mx-auto max-w-[1920px]">
                  <SectionHeader
                    label={sec.eyebrow || "Values"}
                    title={sec.heading || "How we think"}
                  />
                  {sec.subheading && <p className="mt-4 text-sm text-smoke">{sec.subheading}</p>}
                  <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((it, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-between rounded border hairline-d bg-ink-2 p-8 hover:border-acid/60 transition-colors duration-300"
                      >
                        <span className="font-mono text-xs text-acid">{it.index || `0${i + 1}`}</span>
                        <div className="mt-12 flex flex-col gap-2">
                          <h3 className="display text-xl text-paper">{it.title}</h3>
                          <p className="text-xs leading-relaxed text-smoke">{it.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  SERVICES SHOWCASE                                               */
          /* ---------------------------------------------------------------- */
          case "services": {
            return (
              <section key={key} className="px-5 py-24 md:px-10 md:py-36 border-t hairline-d bg-ink-2">
                <div className="mx-auto max-w-[1920px]">
                  <SectionHeader
                    label={sec.eyebrow || "03 / Capabilities"}
                    title={sec.heading || "Capabilities"}
                  />
                  {sec.body && <p className="mt-4 text-sm text-smoke">{sec.body}</p>}
                  <div className="mt-16 grid grid-cols-1 gap-px bg-paper/15 sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((srv, i) => (
                      <div key={srv.index || i} className="flex flex-col justify-between bg-ink p-8 hover:bg-ink-3 transition-colors">
                        <div>
                          <span className="font-mono text-xs text-stone">{srv.index || `0${i + 1}`}</span>
                          <h3 className="display mt-6 text-2xl text-paper">{srv.title}</h3>
                          <p className="mt-2 text-xs text-acid">{srv.tagline}</p>
                          <p className="mt-4 text-xs leading-relaxed text-smoke">{srv.description}</p>
                        </div>
                        {srv.items && srv.items.length > 0 && (
                          <div className="mt-8 border-t hairline-d pt-4">
                            <ul className="flex flex-col gap-1.5 text-xs text-smoke">
                              {srv.items.slice(0, 4).map((it, j) => (
                                <li key={j} className="flex items-center gap-2">
                                  <span className="h-1 w-1 rounded-full bg-acid" />
                                  <span>{it}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  PORTFOLIO / WORK SHOWCASE                                       */
          /* ---------------------------------------------------------------- */
          case "portfolio":
          case "selected-work": {
            return (
              <section key={key} className="px-5 py-24 md:px-10 md:py-36 border-t hairline-d">
                <div className="mx-auto max-w-[1920px]">
                  <SectionHeader
                    label={sec.eyebrow || "04 / Work"}
                    title={sec.heading || "Selected work"}
                  />
                  {sec.body && <p className="mt-4 text-sm text-smoke">{sec.body}</p>}
                  <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((prj, i) => (
                      <Link
                        key={prj.slug || i}
                        href={`/work/${prj.slug}`}
                        className="group flex flex-col gap-4"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded border hairline-d bg-ink-2">
                          <RevealImage
                            src={prj.art || "/images/studio/portrait.svg"}
                            alt={prj.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="display text-xl text-paper group-hover:text-acid transition-colors">
                              {prj.title}
                            </h3>
                            <p className="text-xs text-smoke">{prj.client} — {prj.category}</p>
                          </div>
                          <span className="font-mono text-xs text-stone">{prj.year || "2026"}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  TEAM MEMBERS GRID                                               */
          /* ---------------------------------------------------------------- */
          case "team": {
            return (
              <section key={key} className="px-5 py-24 md:px-10 md:py-36 border-t hairline-d bg-ink-2">
                <div className="mx-auto max-w-[1920px]">
                  <SectionHeader
                    label={sec.eyebrow || "Team"}
                    title={sec.heading || "The team"}
                  />
                  {sec.body && <p className="mt-4 text-sm text-smoke">{sec.body}</p>}
                  <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {team.map((m, i) => (
                      <div key={i} className="flex flex-col gap-4 rounded border hairline-d bg-ink p-6">
                        <div className="relative aspect-square w-full overflow-hidden rounded bg-ink-3">
                          <RevealImage
                            src={m.image || "/images/studio/portrait.svg"}
                            alt={m.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="display text-lg text-paper">{m.name}</h3>
                          <p className="text-xs text-acid">{m.position}</p>
                          {m.bio && <p className="mt-2 text-xs leading-relaxed text-smoke">{m.bio}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  TESTIMONIALS SECTION                                            */
          /* ---------------------------------------------------------------- */
          case "testimonials": {
            return (
              <section key={key} className="px-5 py-24 md:px-10 md:py-36 border-t hairline-d">
                <div className="mx-auto max-w-[1920px]">
                  <SectionHeader
                    label={sec.eyebrow || "Endorsements"}
                    title={sec.heading || "Client words"}
                  />
                  <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {testimonials.map((t, i) => (
                      <div key={i} className="flex flex-col justify-between rounded border hairline-d bg-ink-2 p-8 md:p-10">
                        <p className="display text-xl leading-relaxed text-paper md:text-2xl">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                        <div className="mt-8 flex items-center gap-3">
                          <div>
                            <p className="text-sm font-semibold text-paper">{t.name}</p>
                            <p className="text-xs text-smoke">{t.role}, {t.company}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  FAQS ACCORDION SECTION                                          */
          /* ---------------------------------------------------------------- */
          case "faqs": {
            const faqList = sec.items && sec.items.length > 0 ? sec.items : faqs;
            return (
              <section key={key} className="px-5 py-24 md:px-10 md:py-36 border-t hairline-d bg-ink-2">
                <div className="mx-auto max-w-[1920px]">
                  <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                      <SectionHeader
                        label={sec.eyebrow || "FAQ"}
                        title={sec.heading || "Common questions"}
                      />
                      {sec.body && <p className="mt-4 text-sm text-smoke">{sec.body}</p>}
                    </div>
                    <div className="lg:col-span-7 flex flex-col divide-y divide-line">
                      {faqList.map((f, i) => (
                        <FaqItem
                          key={i}
                          index={i}
                          question={(f as any).question || (f as any).title || ""}
                          answer={(f as any).answer || (f as any).body || ""}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  STATS & NUMBERS                                                 */
          /* ---------------------------------------------------------------- */
          case "stats": {
            const statItems = (sec.stats || []).map((st): StatItem => ({
              value: st.value || "0",
              label: st.label || "",
            }));
            return <StatsSection key={key} stats={statItems} />;
          }

          /* ---------------------------------------------------------------- */
          /*  INSIGHTS / BLOG GRID                                            */
          /* ---------------------------------------------------------------- */
          case "insights": {
            return (
              <section key={key} className="px-5 py-24 md:px-10 md:py-36 border-t hairline-d">
                <div className="mx-auto max-w-[1920px]">
                  <SectionHeader
                    label={sec.eyebrow || "Insights"}
                    title={sec.heading || "Notes from the studio"}
                  />
                  <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {articles.slice(0, 3).map((art, i) => (
                      <Link
                        key={art.slug || i}
                        href={`/insights/${art.slug}`}
                        className="group flex flex-col gap-4"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden rounded border hairline-d bg-ink-2">
                          <RevealImage
                            src={art.art || "/images/studio/portrait.svg"}
                            alt={art.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                        <span className="meta-label text-[10px] text-acid">{art.category}</span>
                        <h3 className="display text-xl text-paper group-hover:text-acid transition-colors">
                          {art.title}
                        </h3>
                        <p className="text-xs leading-relaxed text-smoke line-clamp-2">{art.excerpt}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          /* ---------------------------------------------------------------- */
          /*  FINAL CTA BANNER                                                */
          /* ---------------------------------------------------------------- */
          case "cta": {
            return <FinalCTA key={key} content={sec} />;
          }

          /* ---------------------------------------------------------------- */
          /*  CONTACT FORM SECTION                                            */
          /* ---------------------------------------------------------------- */
          case "contact": {
            return <InlineContactForm key={key} heading={sec.heading} body={sec.body} />;
          }

          /* ---------------------------------------------------------------- */
          /*  MARQUEE SECTION                                                 */
          /* ---------------------------------------------------------------- */
          case "marquee": {
            const words = sec.marquee && sec.marquee.length > 0
              ? sec.marquee
              : ["STRATEGY", "DESIGN SYSTEMS", "NEXT.JS", "AI AUTOMATION", "MOTION", "BRANDING"];
            return <Marquee key={key} items={words} size="sm" className="mask-fade-x py-3" />;
          }

          default:
            return null;
        }
      })}
    </>
  );
}
