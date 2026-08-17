"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  ExternalLink,
  Layers,
  Layout,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useSingleton } from "@/lib/singleton";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  Field,
  Input,
  Select,
  Spinner,
  Textarea,
  useConfirm,
  useToast,
} from "@/components/ui";
import { ImageField, RowsEditor, TagsInput } from "@/components/fields";
import { slugify } from "@/lib/slugify";

type PageSection = {
  _id?: string;
  type: string;
  key: string;
  label: string;
  enabled: boolean;
  order: number;
  heading?: string;
  subheading?: string;
  body?: string;
  eyebrow?: string;
  image?: string;
  cta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
  stats?: Array<{ value?: string; label?: string }>;
  items?: Array<{ index?: string; title?: string; body?: string; value?: string; label?: string }>;
  clients?: Array<{ name?: string; mark?: string }>;
  marquee?: string[];
  meta?: Record<string, any>;
};

type PageDoc = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  sections: PageSection[];
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
};

const SECTION_TEMPLATES = [
  {
    type: "hero",
    label: "Hero Header",
    description: "Editorial introduction with headline, eyebrow and call to action",
    defaultData: {
      heading: "Building what matters.",
      subheading: "Typography, layout, and motion systems built to scale.",
      eyebrow: "Studio",
      cta: { label: "Get in touch", href: "/contact" },
      secondaryCta: { label: "Learn more", href: "#content" },
    },
  },
  {
    type: "text",
    label: "Editorial Text Block",
    description: "Clean narrative section with headline and philosophy body",
    defaultData: {
      heading: "A point of view on digital craft.",
      eyebrow: "Philosophy",
      body: "We believe exceptional software is built by small, highly aligned teams with relentless attention to detail.",
    },
  },
  {
    type: "split",
    label: "Media + Text Split",
    description: "Side-by-side featured imagery with descriptive text and link",
    defaultData: {
      heading: "Crafted for speed & clarity.",
      eyebrow: "Our Approach",
      body: "Every decision is intentional. From initial system architecture to the final 4px alignment.",
      image: "/images/studio/portrait.svg",
      cta: { label: "Explore capabilities", href: "/services" },
    },
  },
  {
    type: "features",
    label: "Features / Values Grid",
    description: "Multi-column feature cards with index numbers and descriptions",
    defaultData: {
      heading: "Our Core Principles",
      eyebrow: "Values",
      items: [
        { index: "01", title: "Obsession", body: "We notice the 4px nobody asked about, and we fix it." },
        { index: "02", title: "Precision", body: "Words, spacing and data agree with each other — or we don't ship." },
        { index: "03", title: "Candor", body: "We tell you when an idea is bad to save months of effort." },
        { index: "04", title: "Momentum", body: "Weekly builds, visible progress, and zero mystery." },
      ],
    },
  },
  {
    type: "services",
    label: "Services Showcase",
    description: "Embed dynamic services from the CMS or custom capability grid",
    defaultData: {
      heading: "Full-Spectrum Digital Services",
      eyebrow: "What We Do",
      body: "From strategic positioning to production engineering and AI automation.",
      cta: { label: "All services", href: "/services" },
    },
  },
  {
    type: "portfolio",
    label: "Portfolio / Selected Work",
    description: "Showcase selected client case studies and digital products",
    defaultData: {
      heading: "Selected Case Studies",
      eyebrow: "Work",
      body: "Recent digital products, brand platforms, and web applications.",
      cta: { label: "View all work", href: "/work" },
    },
  },
  {
    type: "team",
    label: "Team Members Grid",
    description: "Display studio directors, leads, and engineers dynamically",
    defaultData: {
      heading: "The People Behind the Work",
      eyebrow: "Team",
      body: "A dedicated team of designers, engineers, and strategists.",
    },
  },
  {
    type: "testimonials",
    label: "Client Testimonials",
    description: "Showcase client endorsements and verified reviews",
    defaultData: {
      heading: "Trusted by forward-thinking teams",
      eyebrow: "Client Words",
    },
  },
  {
    type: "faqs",
    label: "FAQ Accordion",
    description: "Interactive frequently asked questions accordion",
    defaultData: {
      heading: "Frequently Asked Questions",
      eyebrow: "Clarity",
      body: "Everything you need to know before partnering with us.",
      items: [
        { title: "What is your typical project timeline?", body: "Engagements typically range from 4 to 12 weeks." },
        { title: "How do you structure sprints?", body: "We work in weekly iterative sprint blocks with direct team access." },
      ],
    },
  },
  {
    type: "stats",
    label: "Stats & Metrics",
    description: "Highlight key performance numbers and metrics",
    defaultData: {
      heading: "Impact in Numbers",
      eyebrow: "Metrics",
      stats: [
        { value: "10+", label: "Years of Craft" },
        { value: "48h", label: "Average Response Time" },
        { value: "100%", label: "Client Satisfaction" },
        { value: "14", label: "Studio Members" },
      ],
    },
  },
  {
    type: "insights",
    label: "Blog / Insights Grid",
    description: "Latest editorial articles, thinking, and essays",
    defaultData: {
      heading: "Notes from the Studio",
      eyebrow: "Insights",
      cta: { label: "All articles", href: "/insights" },
    },
  },
  {
    type: "cta",
    label: "Final Call to Action",
    description: "High-impact conversion section with action button",
    defaultData: {
      heading: "Have a project in mind?",
      eyebrow: "New Business",
      body: "Let's build something exceptional together.",
      cta: { label: "Start a conversation", href: "/contact" },
    },
  },
  {
    type: "contact",
    label: "Contact Inquiry Form",
    description: "Interactive project inquiry and lead capture form",
    defaultData: {
      heading: "Let's Talk",
      eyebrow: "Get In Touch",
      body: "Tell us about your project, timeline, and goals.",
    },
  },
  {
    type: "marquee",
    label: "Capabilities Marquee",
    description: "Infinite animated text ribbon of studio capabilities",
    defaultData: {
      marquee: ["STRATEGY", "DESIGN SYSTEMS", "NEXT.JS", "AI AUTOMATION", "MOTION", "BRANDING"],
    },
  },
];

export default function UnifiedPageSectionsBuilder() {
  const { toast } = useToast();
  const { confirm } = useConfirm();

  // Active tab ("home" or page._id or page.slug)
  const [activeTab, setActiveTab] = useState<string>("home");

  // Home singleton data
  const homeSingleton = useSingleton<any>("homepage");

  // Custom pages from MongoDB
  const [pages, setPages] = useState<PageDoc[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);

  // Selected custom page (when activeTab !== "home")
  const [selectedPage, setSelectedPage] = useState<PageDoc | null>(null);
  const [pageSaving, setPageSaving] = useState(false);
  const [pageSaved, setPageSaved] = useState(false);

  // Section editing modal
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [pickingTemplate, setPickingTemplate] = useState(false);

  // New Page creation modal
  const [creatingPage, setCreatingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [newPageDesc, setNewPageDesc] = useState("");
  const [savingNewPage, setSavingNewPage] = useState(false);

  const loadPages = useCallback(async () => {
    setLoadingPages(true);
    try {
      const res = await api<{ data: PageDoc[] }>("/api/v1/admin/content/pages?limit=50&sort=order&dir=asc");
      setPages(res.data ?? []);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load pages", "error");
    } finally {
      setLoadingPages(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  // Sync selected custom page when activeTab changes
  useEffect(() => {
    if (activeTab === "home") {
      setSelectedPage(null);
    } else {
      const p = pages.find((page) => page._id === activeTab || page.slug === activeTab);
      if (p) setSelectedPage(p);
    }
  }, [activeTab, pages]);

  // Active sections based on tab
  const isHome = activeTab === "home";
  const rawSections: PageSection[] = isHome
    ? (homeSingleton.data?.sections ?? [])
    : (selectedPage?.sections ?? []);

  const sections: PageSection[] = [...rawSections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const setSections = (next: PageSection[]) => {
    const ordered = next.map((s, i) => ({ ...s, order: i }));
    if (isHome) {
      homeSingleton.setData((d: any) => ({ ...d, sections: ordered }));
    } else if (selectedPage) {
      setSelectedPage({ ...selectedPage, sections: ordered });
      setPages(pages.map((p) => (p._id === selectedPage._id ? { ...p, sections: ordered } : p)));
    }
  };

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  };

  const toggleSection = (index: number) => {
    setSections(sections.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)));
  };

  const duplicateSection = (index: number) => {
    const s = sections[index];
    const copy: PageSection = {
      ...s,
      key: `${s.type}-${Date.now()}`,
      label: `${s.label} (Copy)`,
      order: index + 1,
    };
    const next = [...sections];
    next.splice(index + 1, 0, copy);
    setSections(next);
    toast("Section duplicated");
  };

  const deleteSection = async (index: number) => {
    const ok = await confirm(`Remove section "${sections[index].label}" from this page?`);
    if (!ok) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const startAddSection = (tmpl: (typeof SECTION_TEMPLATES)[number]) => {
    const newSec: PageSection = {
      type: tmpl.type,
      key: `${tmpl.type}-${Date.now()}`,
      label: tmpl.label,
      enabled: true,
      order: sections.length,
      ...tmpl.defaultData,
    };
    setEditingSection(newSec);
    setIsCreatingSection(true);
    setPickingTemplate(false);
  };

  const saveEditingSection = (sec: PageSection) => {
    if (isCreatingSection) {
      setSections([...sections, sec]);
    } else {
      setSections(sections.map((s) => (s.key === sec.key ? sec : s)));
    }
    setEditingSection(null);
    setIsCreatingSection(false);
  };

  const handleSavePage = async () => {
    if (isHome) {
      homeSingleton.save({ sections });
    } else if (selectedPage) {
      setPageSaving(true);
      setPageSaved(false);
      try {
        const res = await api<{ data: PageDoc }>(`/api/v1/admin/content/pages/${selectedPage._id}`, {
          method: "PATCH",
          body: {
            title: selectedPage.title,
            slug: selectedPage.slug,
            description: selectedPage.description,
            status: selectedPage.status,
            seo: selectedPage.seo,
            sections,
          },
        });
        if (res.data) {
          setSelectedPage(res.data);
          setPages(pages.map((p) => (p._id === res.data._id ? res.data : p)));
        }
        setPageSaved(true);
        toast(`"${selectedPage.title}" sections saved to MongoDB ✓`);
        setTimeout(() => setPageSaved(false), 3000);
      } catch (err) {
        toast(err instanceof ApiError ? err.message : "Failed to save page", "error");
      } finally {
        setPageSaving(false);
      }
    }
  };

  const handleCreateNewPage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) {
      toast("Please enter a page title", "error");
      return;
    }
    setSavingNewPage(true);
    try {
      const slug = slugify(newPageSlug || newPageTitle);
      const res = await api<{ data: PageDoc }>("/api/v1/admin/content/pages", {
        method: "POST",
        body: {
          title: newPageTitle.trim(),
          slug,
          description: newPageDesc.trim(),
          status: "PUBLISHED",
          sections: [
            {
              type: "hero",
              key: `hero-${Date.now()}`,
              label: "Hero Section",
              enabled: true,
              order: 0,
              heading: newPageTitle.trim(),
              subheading: newPageDesc.trim() || "Dynamic page built with KERN CMS.",
              eyebrow: "Page",
              cta: { label: "Explore", href: "#content" },
            },
          ],
        },
      });
      toast("New page created and added to tabs ✓");
      setCreatingPage(false);
      setNewPageTitle("");
      setNewPageSlug("");
      setNewPageDesc("");
      await loadPages();
      if (res.data?._id) {
        setActiveTab(res.data._id);
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to create page", "error");
    } finally {
      setSavingNewPage(false);
    }
  };

  if (homeSingleton.loading || loadingPages) {
    return <Spinner label="Loading page sections hub..." />;
  }

  const activeLiveUrl = isHome
    ? "/"
    : `/${selectedPage?.slug ?? ""}`;

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Top Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Page Sections & Visual Builder</h1>
          <p className="mt-1 text-sm text-smoke">
            Manage, customize, and reorder dynamic sections for every website page from one unified hub.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" onClick={() => window.open(activeLiveUrl, "_blank")}>
            <ExternalLink className="h-3.5 w-3.5" /> View Live Page
          </Button>
          <Button
            variant="primary"
            onClick={handleSavePage}
            loading={isHome ? homeSingleton.saving : pageSaving}
          >
            {(isHome ? homeSingleton.saved : pageSaved) ? "Saved ✓" : `Save ${isHome ? "Homepage" : selectedPage?.title ?? "Page"}`}
          </Button>
        </div>
      </header>

      {/* Pages Tabs Navigation Bar */}
      <div className="flex items-center justify-between border-b border-line bg-ink pb-px overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "home"
                ? "border-acid text-paper bg-ink-2"
                : "border-transparent text-stone hover:text-paper"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-acid" />
            Home Page (/)
          </button>

          {pages.map((p) => (
            <button
              key={p._id}
              type="button"
              onClick={() => setActiveTab(p._id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === p._id || activeTab === p.slug
                  ? "border-acid text-paper bg-ink-2"
                  : "border-transparent text-stone hover:text-paper"
              }`}
            >
              <span className="font-mono text-[10px] text-stone">/{p.slug}</span>
              <span>{p.title}</span>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreatingPage(true)}
          className="my-1.5 mr-2 flex-none"
        >
          <Plus className="h-3.5 w-3.5 text-acid" /> Add Page
        </Button>
      </div>

      {/* Active Page Meta Bar (For custom pages) */}
      {!isHome && selectedPage && (
        <Card title="Page Configuration & SEO">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Page Title">
              <Input
                value={selectedPage.title}
                onChange={(e) =>
                  setSelectedPage({ ...selectedPage, title: e.target.value })
                }
              />
            </Field>
            <Field label="URL Slug">
              <Input
                value={selectedPage.slug}
                onChange={(e) =>
                  setSelectedPage({ ...selectedPage, slug: slugify(e.target.value) })
                }
              />
            </Field>
            <Field label="Publish Status">
              <Select
                value={selectedPage.status}
                onChange={(e) =>
                  setSelectedPage({ ...selectedPage, status: e.target.value as any })
                }
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </Field>
            <Field label="SEO Title (Optional)" className="md:col-span-1">
              <Input
                value={selectedPage.seo?.title ?? ""}
                onChange={(e) =>
                  setSelectedPage({
                    ...selectedPage,
                    seo: { ...selectedPage.seo, title: e.target.value },
                  })
                }
                placeholder={`${selectedPage.title} — KERN®`}
              />
            </Field>
            <Field label="Meta Description" className="md:col-span-2">
              <Input
                value={selectedPage.seo?.description ?? selectedPage.description ?? ""}
                onChange={(e) =>
                  setSelectedPage({
                    ...selectedPage,
                    description: e.target.value,
                    seo: { ...selectedPage.seo, description: e.target.value },
                  })
                }
                placeholder="Meta description for search results..."
              />
            </Field>
          </div>
        </Card>
      )}

      {/* Sections List Canvas */}
      <Card
        title={`${isHome ? "Homepage" : selectedPage?.title ?? "Page"} Sections (${sections.length})`}
        actions={
          <Button variant="primary" size="sm" onClick={() => setPickingTemplate(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Section
          </Button>
        }
      >
        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Layers className="h-10 w-10 text-stone" />
            <h3 className="mt-4 text-base font-medium text-paper">No sections added yet</h3>
            <p className="mt-1 max-w-sm text-xs text-smoke">
              Click &quot;Add Section&quot; to choose from Hero, Services, Team, FAQs, Split Media, and CTA templates.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPickingTemplate(true)}
              className="mt-5"
            >
              <Plus className="h-3.5 w-3.5" /> Add First Section
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sections.map((sec, i) => (
              <div
                key={sec.key || i}
                className={`flex items-center justify-between rounded border p-4 transition-all ${
                  sec.enabled
                    ? "border-line bg-ink hover:border-paper/40"
                    : "border-line/40 bg-ink/40 opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(i, -1)}
                      disabled={i === 0}
                      className="rounded p-1 text-stone hover:text-paper disabled:opacity-20"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-[10px] text-stone">{String(i + 1).padStart(2, "0")}</span>
                    <button
                      type="button"
                      onClick={() => moveSection(i, 1)}
                      disabled={i === sections.length - 1}
                      className="rounded p-1 text-stone hover:text-paper disabled:opacity-20"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-paper">{sec.label || sec.heading || sec.type}</span>
                      <span className="meta-label rounded border border-line bg-ink-2 px-1.5 py-0.5 text-[9px] text-acid">
                        {sec.type}
                      </span>
                    </div>
                    {sec.heading && <p className="text-xs text-smoke truncate max-w-md">{sec.heading}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={sec.enabled !== false}
                    onChange={() => toggleSection(i)}
                    label={sec.enabled ? "Active" : "Disabled"}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSection({ ...sec });
                      setIsCreatingSection(false);
                    }}
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => duplicateSection(i)}
                    className="rounded p-1.5 text-stone hover:text-paper"
                    aria-label="Duplicate section"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSection(i)}
                    className="rounded p-1.5 text-stone hover:text-red-400"
                    aria-label="Delete section"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Section Template Picker Dialog */}
      <Dialog
        open={pickingTemplate}
        onClose={() => setPickingTemplate(false)}
        title="Add a Visual Section"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[60vh] overflow-y-auto pr-1">
          {SECTION_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.type}
              type="button"
              onClick={() => startAddSection(tmpl)}
              className="group flex flex-col gap-1.5 rounded border border-line bg-ink p-3.5 text-left hover:border-acid hover:bg-ink-2 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-paper group-hover:text-acid">{tmpl.label}</span>
                <span className="meta-label text-[9px] text-stone uppercase">{tmpl.type}</span>
              </div>
              <p className="text-xs text-smoke">{tmpl.description}</p>
            </button>
          ))}
        </div>
      </Dialog>

      {/* Section Editor Modal */}
      {editingSection && (
        <Dialog
          open={Boolean(editingSection)}
          onClose={() => setEditingSection(null)}
          title={`Configure ${editingSection.label || editingSection.type}`}
        >
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Section Label">
                <Input
                  value={editingSection.label}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, label: e.target.value })
                  }
                  placeholder="e.g. Hero Banner"
                />
              </Field>
              <Field label="Eyebrow / Tag">
                <Input
                  value={editingSection.eyebrow ?? ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, eyebrow: e.target.value })
                  }
                  placeholder="e.g. 01 / Overview"
                />
              </Field>
            </div>

            <Field label="Headline / Title">
              <Input
                value={editingSection.heading ?? ""}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, heading: e.target.value })
                }
                placeholder="Main headline text"
              />
            </Field>

            <Field label="Subheading / Tagline">
              <Input
                value={editingSection.subheading ?? ""}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, subheading: e.target.value })
                }
                placeholder="Secondary descriptive headline"
              />
            </Field>

            <Field label="Body Copy / Content">
              <Textarea
                value={editingSection.body ?? ""}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, body: e.target.value })
                }
                rows={4}
                placeholder="Detailed narrative text..."
              />
            </Field>

            <Field label="Featured Image / Media">
              <ImageField
                value={editingSection.image ?? ""}
                onChange={(img) => setEditingSection({ ...editingSection, image: img })}
              />
            </Field>

            {/* CTAs */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-line pt-3">
              <Field label="Primary Button Label">
                <Input
                  value={editingSection.cta?.label ?? ""}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      cta: { ...editingSection.cta, label: e.target.value },
                    })
                  }
                  placeholder="e.g. Get Started"
                />
              </Field>
              <Field label="Primary Button Link">
                <Input
                  value={editingSection.cta?.href ?? ""}
                  onChange={(e) =>
                    setEditingSection({
                      ...editingSection,
                      cta: { ...editingSection.cta, href: e.target.value },
                    })
                  }
                  placeholder="e.g. /contact"
                />
              </Field>
            </div>

            {/* Repeatable Items (Features, FAQs, Process) */}
            {(editingSection.type === "features" ||
              editingSection.type === "faqs" ||
              editingSection.type === "process" ||
              editingSection.items?.length) && (
              <div className="border-t border-line pt-3">
                <label className="text-xs font-medium text-paper">Repeatable Items / FAQs / Steps</label>
                <RowsEditor
                  value={editingSection.items ?? []}
                  onChange={(items) => setEditingSection({ ...editingSection, items })}
                  subfields={[
                    { key: "index", label: "Index (e.g. 01)", type: "text" },
                    { key: "title", label: "Title / Question", type: "text" },
                    { key: "body", label: "Description / Answer", type: "textarea" },
                  ]}
                />
              </div>
            )}

            {/* Stats List */}
            {(editingSection.type === "stats" || editingSection.stats?.length) && (
              <div className="border-t border-line pt-3">
                <label className="text-xs font-medium text-paper">Statistics & Numbers</label>
                <RowsEditor
                  value={editingSection.stats ?? []}
                  onChange={(stats) => setEditingSection({ ...editingSection, stats })}
                  subfields={[
                    { key: "value", label: "Value (e.g. 10+)", type: "text" },
                    { key: "label", label: "Label (e.g. Years of Craft)", type: "text" },
                  ]}
                />
              </div>
            )}

            {/* Marquee Tags */}
            {(editingSection.type === "marquee" || editingSection.marquee?.length) && (
              <div className="border-t border-line pt-3">
                <label className="text-xs font-medium text-paper">Marquee Words</label>
                <TagsInput
                  value={editingSection.marquee ?? []}
                  onChange={(marquee) => setEditingSection({ ...editingSection, marquee })}
                  placeholder="Type word and press enter..."
                />
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => saveEditingSection(editingSection)}>
                Save Section
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Create New Page Dialog */}
      <Dialog
        open={creatingPage}
        onClose={() => setCreatingPage(false)}
        title="Add New Dynamic Page"
      >
        <form onSubmit={handleCreateNewPage} className="flex flex-col gap-4">
          <Field label="Page Title">
            <Input
              value={newPageTitle}
              onChange={(e) => {
                setNewPageTitle(e.target.value);
                if (!newPageSlug || newPageSlug === slugify(newPageTitle)) {
                  setNewPageSlug(slugify(e.target.value));
                }
              }}
              placeholder="e.g. Studio Culture, Manifesto, Partners"
              autoFocus
              required
            />
          </Field>
          <Field label="URL Slug" hint="Public URL path (e.g. /culture)">
            <Input
              value={newPageSlug}
              onChange={(e) => setNewPageSlug(slugify(e.target.value))}
              placeholder="culture"
              required
            />
          </Field>
          <Field label="Short Description">
            <Textarea
              value={newPageDesc}
              onChange={(e) => setNewPageDesc(e.target.value)}
              placeholder="Brief summary of this page..."
              rows={3}
            />
          </Field>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setCreatingPage(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={savingNewPage}>
              Create Page & Add Sections →
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
