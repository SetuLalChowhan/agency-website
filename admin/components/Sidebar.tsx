"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  FileText,
  FolderKanban,
  Gauge,
  Home,
  Image as ImageIcon,
  Inbox,
  Layers,
  LayoutDashboard,
  Mail,
  Megaphone,
  MessageSquareQuote,
  Newspaper,
  Palette,
  Settings,
  Shield,
  Tags,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useState } from "react";

const GROUPS: Array<{ label: string; items: Array<{ href: string; label: string; icon: any }> }> = [
  {
    label: "Overview",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Website",
    items: [
      { href: "/website/settings", label: "General & Branding", icon: Settings },
      { href: "/website/theme", label: "Theme", icon: Palette },
      { href: "/website/navigation", label: "Navigation", icon: Workflow },
      { href: "/website/footer", label: "Footer", icon: Layers },
      { href: "/website/announcement", label: "Announcement & CTA", icon: Megaphone },
      { href: "/home", label: "Homepage sections", icon: Home },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/content/services", label: "Services", icon: Gauge },
      { href: "/content/projects", label: "Projects", icon: FolderKanban },
      { href: "/content/case-studies", label: "Case studies", icon: BookOpen },
      { href: "/content/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/content/team", label: "Team", icon: Users },
      { href: "/content/faqs", label: "FAQs", icon: MessageSquareQuote },
      { href: "/content/blog", label: "Blog posts", icon: Newspaper },
      { href: "/content/blog-categories", label: "Blog categories", icon: Tags },
      { href: "/content/blog-tags", label: "Blog tags", icon: Tags },
      { href: "/content/pages", label: "Pages", icon: FileText },
    ],
  },
  {
    label: "Media",
    items: [{ href: "/media", label: "Media library", icon: ImageIcon }],
  },
  {
    label: "Leads",
    items: [{ href: "/leads", label: "Inbox", icon: Inbox }],
  },
  {
    label: "System",
    items: [
      { href: "/users", label: "Admin users", icon: Shield },
      { href: "/activity", label: "Activity log", icon: Activity },
      { href: "/diagnostics", label: "Diagnostics", icon: Gauge },
    ],
  },
];

function FileTextIcon(props: any) {
  return <Newspaper {...props} />;
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-ink/70 backdrop-blur-sm lg:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-ink-2 transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="display-logo text-base font-semibold tracking-tight text-paper">
              KERN<span className="align-super text-[0.55em] text-acid">®</span>
            </span>
            <span className="meta-label ml-1 text-stone">/ admin</span>
          </Link>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center text-stone lg:hidden" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="meta-label px-3 pb-2 text-[10px] text-stone">{group.label}</p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-sm px-3 py-2 text-[13px] transition-colors",
                          active ? "bg-acid text-ink" : "text-smoke hover:bg-ink-3 hover:text-paper"
                        )}
                      >
                        <Icon className="h-4 w-4 flex-none" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-4">
          <a
            href={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}
            target="_blank"
            rel="noreferrer"
            className="meta-label flex items-center justify-between text-stone transition-colors hover:text-acid"
          >
            View public site
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </aside>
    </>
  );
}
