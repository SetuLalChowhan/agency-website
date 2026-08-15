"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/data/site";
import { useLenis } from "@/lib/lenis";
import { cn } from "@/lib/utils/cn";
import { EASE } from "@/lib/animations";
import { Asterisk } from "@/components/ui/Asterisk";
import { Magnetic } from "@/components/ui/Magnetic";
import { ArrowUpRight, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/components/theme";
import type { CmsNavItem, CmsSettings } from "@/lib/cms";

const READY_EVENT = "kern:ready";

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div role="group" aria-label="Color theme" className={cn("items-center gap-0.5 rounded-full border border-paper/25 p-0.5", className)}>
      {THEME_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-label={`${opt.label} mode`}
            aria-pressed={active}
            title={`${opt.label} mode`}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-300",
              active ? "bg-acid text-ink" : "text-smoke hover:text-paper"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}

export type NavigationProps = {
  items?: CmsNavItem[];
  cta?: { label?: string; href?: string; enabled?: boolean };
  announcement?: { enabled?: boolean; text?: string; link?: string };
  settings?: CmsSettings;
};

export function Navigation({ items, cta, announcement, settings }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const reduced = useReducedMotion();

  const nav = (items && items.length > 0 ? items : (site.nav as unknown as CmsNavItem[])).filter(
    (item) => item.enabled !== false
  );
  const wordmark = settings?.wordmark ?? site.wordmark;
  const email = settings?.email || site.email;
  const location = settings?.location || site.location;
  const showAnnouncement = announcement?.enabled === true && !!announcement.text;

  // Reveal the bar once the loader hands over.
  useEffect(() => {
    const onReady = () => setReady(true);
    window.addEventListener(READY_EVENT, onReady);
    const fallback = window.setTimeout(onReady, 3400);
    return () => {
      window.removeEventListener(READY_EVENT, onReady);
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll while the menu is open.
  useEffect(() => {
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const ctaLink = cta?.enabled !== false
    ? { label: cta?.label || "Let's Talk", href: cta?.href || "/contact" }
    : null;

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[80] transition-[background-color,border-color,backdrop-filter] duration-500",
        open
          ? "border-b hairline-d bg-ink"
          : scrolled
            ? "border-b hairline-d bg-ink/85 backdrop-blur-md"
            : "border-b border-transparent"
      )}
    >
      {showAnnouncement && (
        <a
          href={announcement?.link || "/"}
          data-cursor="link"
          className={cn(
            "block border-b hairline-d bg-acid px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors",
            announcement?.link ? "hover:bg-paper" : "cursor-default"
          )}
        >
          {announcement?.text}
        </a>
      )}
      <motion.nav
        initial={reduced ? false : { y: -20, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: EASE }}
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-5 md:h-[76px] md:px-10"
      >
        <Link
          href="/"
          className="group relative z-[81] flex items-center gap-2.5"
          aria-label={`${wordmark.replace(/[®]/g, "")} — home`}
          data-cursor="link"
        >
          <Asterisk className="h-4 w-4 text-acid transition-transform duration-700 ease-expo group-hover:rotate-90" />
          <span className="display text-[15px] font-semibold tracking-tight text-paper">
            {wordmark.replace("®", "")}
            <span className="align-super text-[0.55em] text-acid">®</span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.target === "_blank" ? "_blank" : undefined}
              rel={item.target === "_blank" ? "noreferrer" : undefined}
              data-cursor="link"
              className={cn(
                "link-sweep meta-label relative py-1 transition-colors duration-300",
                isActive(item.href) ? "text-paper" : "text-smoke hover:text-paper"
              )}
            >
              <span
                className={cn(
                  "absolute -left-3.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-acid transition-opacity duration-300",
                  isActive(item.href) ? "opacity-100" : "opacity-0"
                )}
              />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-5">
          <ThemeToggle className="hidden md:flex" />

          {ctaLink && (
            <Magnetic className="hidden md:block">
              <Link
                href={ctaLink.href}
                data-cursor="open"
                className="group flex items-center gap-2 rounded-full border border-paper/25 px-5 py-2.5 transition-colors duration-300 hover:border-acid hover:bg-acid hover:text-ink"
              >
                <span className="meta-label !text-[11px] !tracking-[0.16em]">{ctaLink.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
              </Link>
            </Magnetic>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-controls="mobile-menu"
            className="relative z-[81] flex h-10 w-10 items-center justify-center md:hidden"
          >
            <span
              className={cn(
                "absolute h-px w-5 bg-paper transition-all duration-300",
                open ? "rotate-45" : "-translate-y-[3.5px]"
              )}
            />
            <span
              className={cn(
                "absolute h-px w-5 bg-paper transition-all duration-300",
                open ? "-rotate-45" : "translate-y-[3.5px]"
              )}
            />
          </button>
        </div>
      </motion.nav>

    </header>

    {/* Mobile fullscreen menu — a sibling of the header so the header's
        backdrop-filter can never constrain its fixed positioning. */}
    <AnimatePresence>
      {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[79] flex flex-col bg-ink md:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-28 text-paper/[0.04]">
              <Asterisk className="h-[26rem] w-[26rem] animate-spin-slower" />
            </div>

            <div className="flex flex-1 flex-col justify-center px-6 pt-16">
              {nav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ y: 54, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.65, ease: EASE, delay: 0.2 + i * 0.07 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline gap-4 border-b hairline-d py-4"
                    tabIndex={open ? 0 : -1}
                  >
                    <span className="meta-label text-acid">0{i + 1}</span>
                    <span className="display text-[13vw] leading-none tracking-tight text-paper transition-colors duration-300 group-active:text-acid">
                      {item.label}
                    </span>
                    <ArrowUpRight className="ml-auto h-5 w-5 text-smoke transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-acid" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex flex-col gap-6 px-6 pb-10"
            >
              <div className="flex items-center justify-between">
                <span className="meta-label text-smoke">Theme</span>
                <ThemeToggle className="flex" />
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <a href={`mailto:${email}`} className="meta-label !text-[11px] text-paper">
                    {email}
                  </a>
                  <p className="meta-label mt-2 text-smoke">{location}</p>
                </div>
                <a href={`mailto:${email}`} className="link-sweep meta-label text-acid">
                  Contact ↗
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
