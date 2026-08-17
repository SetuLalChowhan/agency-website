"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  ExternalLink,
  Layers,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
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
    description: "Full-bleed or editorial page introduction with headline & CTAs",
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
    description: "Clean typography section with headline and narrative body",
    defaultData: {
      heading: "A point of view on digital craft.",
      eyebrow: "Philosophy",
      body: "We believe exceptional software is built by small, highly aligned teams with relentless attention to detail.",
    },
  },
  {
    type: "split",
    label: "Media + Text Split",
    description: "Side-by-side layout with image on one side and content on the other",
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
    label: "Features / Value Grid",
    description: "Multi-column grid showcasing core features, values or principles",
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
    description: "Embed dynamic services from the CMS or display custom offerings",
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
    description: "Showcase client reviews and verified endorsements",
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
    description: "Highlight key performance numbers, growth metrics, and facts",
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
    description: "Latest editorial articles, thinking, and engineering notes",
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
    description: "Infinite animated text ribbon of studio capabilities or clients",
    defaultData: {
      marquee: ["STRATEGY", "DESIGN SYSTEMS", "NEXT.JS", "AI AUTOMATION", "MOTION", "BRANDING"],
    },
  },
];

export default function PageBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [page, setPage] = useState<PageDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Section modal states
  const [pickingTemplate, setPickingTemplate] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [isCreatingSection, setIsCreatingSection] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api<{ data: PageDoc }>(`/api/v1/admin/content/pages/${resolvedParams.id}`);
      setPage(res.data);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load page", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [resolvedParams.id]);

  if (loading || !page) return <Spinner label="Loading page builder..." />;

  const sections: PageSection[] = (page.sections ?? []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const setSections = (next: PageSection[]) => {
    setPage((p) => (p ? { ...p, sections: next.map((s, i) => ({ ...s, order: i })) } : p));
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

  const savePage = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await api<{ data: PageDoc }>(`/api/v1/admin/content/pages/${page._id}`, {
        method: "PATCH",
        body: {
          title: page.title,
          slug: page.slug,
          description: page.description,
          status: page.status,
          seo: page.seo,
          sections,
        },
      });
      if (res.data) setPage(res.data);
      setSaved(true);
      toast("Page changes saved to MongoDB ✓");
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to save page", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Top Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/content/pages"
            className="flex h-9 w-9 items-center justify-center rounded border border-line bg-ink-2 text-smoke hover:text-paper"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="display text-2xl text-paper">{page.title}</h1>
              <Badge value={page.status} />
            </div>
            <p className="font-mono text-xs text-stone">/{page.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" onClick={() => window.open(`/${page.slug}`, "_blank")}>
            <ExternalLink className="h-3.5 w-3.5" /> Preview live
          </Button>
          <Button variant="primary" onClick={savePage} loading={saving}>
            {saved ? "Saved ✓" : "Save changes"}
          </Button>
        </div>
      </header>

      {/* Page Configuration Bar */}
      <Card title="Page Settings & SEO">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Page Title">
            <Input
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
            />
          </Field>
          <Field label="URL Slug">
            <Input
              value={page.slug}
              onChange={(e) => setPage({ ...page, slug: slugify(e.target.value) })}
            />
          </Field>
          <Field label="Publish Status">
            <Select
              value={page.status}
              onChange={(e) => setPage({ ...page, status: e.target.value as any })}
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
          <Field label="SEO Title (Optional)" className="md:col-span-1">
            <Input
              value={page.seo?.title ?? ""}
              onChange={(e) =>
                setPage({ ...page, seo: { ...page.seo, title: e.target.value } })
              }
              placeholder={`${page.title} — KERN®`}
            />
          </Field>
          <Field label="SEO Meta Description" className="md:col-span-2">
            <Input
              value={page.seo?.description ?? page.description ?? ""}
              onChange={(e) =>
                setPage({
                  ...page,
                  description: e.target.value,
                  seo: { ...page.seo, description: e.target.value },
                })
              }
              placeholder="Short description for search engines and social shares..."
            />
          </Field>
        </div>
      </Card>

      {/* Section Builder Canvas */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="display text-xl text-paper">Sections ({sections.length})</h2>
            <p className="text-xs text-smoke">
              Add, reorder, and configure dynamic visual components for this page.
            </p>
          </div>
          <Button variant="primary" onClick={() => setPickingTemplate(true)}>
            <Plus className="h-4 w-4" /> Add Section
          </Button>
        </div>

        {sections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded border border-line bg-ink p-12 text-center">
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
              <Plus className="h-3.5 w-3.5" /> Choose template
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
      </div>

      {/* Add Section Template Picker Modal */}
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

      {/* Detailed Section Editor Dialog */}
      {editingSection && (
        <Dialog
          open={Boolean(editingSection)}
          onClose={() => setEditingSection(null)}
          title={`Configure ${editingSection.label || editingSection.type}`}
        >
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Section Label / Title">
                <Input
                  value={editingSection.label}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, label: e.target.value })
                  }
                  placeholder="e.g. Hero Banner"
                />
              </Field>
              <Field label="Eyebrow / Category Tag">
                <Input
                  value={editingSection.eyebrow ?? ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, eyebrow: e.target.value })
                  }
                  placeholder="e.g. 01 / Overview"
                />
              </Field>
            </div>

            <Field label="Heading">
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

            {/* Items List (if applicable) */}
            {(editingSection.type === "features" ||
              editingSection.type === "faqs" ||
              editingSection.type === "process" ||
              editingSection.items?.length) && (
              <div className="border-t border-line pt-3">
                <label className="text-xs font-medium text-paper">Repeatable Items / Steps / FAQs</label>
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

            {/* Stats List (if applicable) */}
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

            {/* Marquee Tags (if applicable) */}
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
    </div>
  );
}
