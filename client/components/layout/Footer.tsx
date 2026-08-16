"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { site } from "@/lib/data/site";
import { useLenis } from "@/lib/lenis";
import { Logo } from "@/components/ui/Logo";
import { Magnetic } from "@/components/ui/Magnetic";
import { EASE } from "@/lib/animations";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import type { CmsNavItem, CmsSettings } from "@/lib/cms";

export type FooterProps = {
  nav?: CmsNavItem[];
  settings?: CmsSettings;
  footer?: {
    description?: string;
    columns?: Array<{ title?: string; links?: Array<{ label: string; href: string }> }>;
    socials?: Array<{ label: string; url: string; handle: string }>;
    contact?: { phone?: string; email?: string; address?: string };
    copyright?: string;
    newsletter?: { enabled?: boolean; title?: string };
  };
};

export function Footer({ nav, settings, footer }: FooterProps) {
  const lenis = useLenis();

  const navItems = (nav ?? []).filter((item) => item.enabled !== false);
  const withContact = [...navItems, { label: "Contact", href: "/contact" }];
  const columns = footer?.columns && footer.columns.length > 0 ? footer.columns : null;
  const socials =
    footer?.socials && footer.socials.length > 0 ? footer.socials : (settings?.socials ?? []);
  const email = footer?.contact?.email || settings?.email || site.email;
  const location = settings?.location || site.location;
  const wordmark = settings?.wordmark ?? site.wordmark;
  const tagline = footer?.description || settings?.tagline || site.tagline;
  const copyright = footer?.copyright || settings?.legal || site.legal;
  const founded = settings?.founded ?? site.founded;

  const backToTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.6 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative overflow-hidden border-t hairline-d bg-ink-2">
      <div className="mx-auto max-w-[1920px] px-5 pt-16 md:px-10 md:pt-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" data-cursor="link" className="inline-block">
              <Logo />
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-smoke">{tagline}</p>
            <p className="meta-label mt-8 text-stone">
              Est. {founded} — {location}
            </p>
          </div>

          {/* Sitemap */}
          <nav className="md:col-span-3" aria-label="Footer">
            <p className="meta-label mb-6 text-stone">
              {columns?.[0]?.title ?? "Sitemap"}
            </p>
            <ul className="space-y-3">
              {(columns?.[0]?.links && columns[0].links.length > 0 ? columns[0].links : withContact).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} data-cursor="link" className="link-sweep text-[15px] text-paper/75 transition-colors duration-300 hover:text-paper">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div className="md:col-span-2">
            <p className="meta-label mb-6 text-stone">{columns?.[1]?.title ?? "Social"}</p>
            <ul className="space-y-3">
              {(columns?.[1]?.links && columns[1].links.length > 0
                ? columns[1].links.map((l) => ({ label: l.label, url: l.href, handle: "" }))
                : socials
              ).map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="link"
                    className="group inline-flex items-center gap-1.5 text-[15px] text-paper/75 transition-colors duration-300 hover:text-acid"
                  >
                    {s.label}
                    <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <p className="meta-label mb-6 text-stone">{columns?.[2]?.title ?? "New business"}</p>
            {columns?.[2]?.links && columns[2].links.length > 0 ? (
              <ul className="space-y-3">
                {columns[2].links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      data-cursor="link"
                      className="link-sweep inline-block break-all text-lg font-medium text-paper"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <a href={`mailto:${email}`} data-cursor="link" className="link-sweep inline-block break-all text-lg font-medium text-paper">
                  {email}
                </a>
                <p className="meta-label mt-4 text-smoke">We reply within 48h</p>
              </>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col gap-6 border-t hairline-d pb-10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="meta-label text-stone">© 2026 {copyright}. All rights reserved.</p>
          <p className="meta-label text-smoke">{location}</p>
          <Magnetic className="self-start md:self-auto">
            <button
              type="button"
              onClick={backToTop}
              data-cursor="link"
              aria-label="Back to top"
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-paper/25 text-paper transition-colors duration-300 hover:border-acid hover:bg-acid hover:text-ink"
            >
              <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </button>
          </Magnetic>
        </div>
      </div>

      {/* Giant wordmark */}
      <div aria-hidden="true" className="relative mt-6 overflow-hidden pb-2">
        <motion.div
          initial={{ opacity: 0, y: "32%" }}
          whileInView={{ opacity: 1, y: "0%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: EASE }}
          className="flex justify-center"
        >
          <span className="display text-stroke-ghost select-none whitespace-nowrap text-[23vw] leading-[0.82] tracking-[-0.04em]">
            {wordmark}
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
