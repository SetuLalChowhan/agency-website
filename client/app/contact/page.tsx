import type { Metadata } from "next";
import { getBootstrap } from "@/lib/cms";
import { site as fallbackSite } from "@/lib/data/site";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/site/ContactForm";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us about your project. We read every brief personally and reply within 48 hours.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const { data } = await getBootstrap();
  const settings = data.settings;

  const email = settings?.email || fallbackSite.email;
  const location = settings?.location || fallbackSite.location;
  const socials = settings?.socials && settings.socials.length > 0 ? settings.socials : fallbackSite.socials;

  return (
    <>
      <section className="px-5 pt-32 md:px-10 md:pt-44">
        <div className="mx-auto max-w-[1920px]">
          <SectionHeader label="New business" index="We reply within 48h" title="Tell us about it." />
          <Reveal className="mt-8">
            <p className="max-w-xl text-[15px] leading-relaxed text-smoke md:text-base">
              A few honest lines are enough — what you&apos;re building, why now, and what success
              looks like. If we&apos;re a fit, you&apos;ll hear from a senior person, not a
              scheduler.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid max-w-[1920px] gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <ContactForm />
          </div>

          <aside className="flex flex-col gap-12 md:col-span-4 md:col-start-9">
            <div>
              <p className="meta-label text-stone">Direct line</p>
              <a
                href={`mailto:${email}`}
                data-cursor="link"
                className="link-sweep mt-3 inline-block text-xl font-medium text-paper"
              >
                {email}
              </a>
              <p className="meta-label mt-3 text-smoke">{location}</p>
            </div>

            <div>
              <p className="meta-label text-stone">Social</p>
              <ul className="mt-3 space-y-2.5">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="link"
                      className="group inline-flex items-center gap-1.5 text-sm text-paper/80 transition-colors duration-300 hover:text-acid"
                    >
                      {s.label} — {s.handle}
                      <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="meta-label text-stone">Good to know</p>
              <ul className="mt-3 space-y-2.5 text-sm text-paper/80">
                <li className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-acid" /> Engagements from 8 weeks
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-acid" /> NDA-friendly from the first call
                </li>
                <li className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-acid" /> A handful of slots per quarter
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
