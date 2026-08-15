"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useSingleton } from "@/lib/singleton";
import { Button, Card, Checkbox, Dialog, Field, Input, Select, Spinner, useToast } from "@/components/ui";
import { ImageField, RowsEditor, TagsInput } from "@/components/fields";
import type { HomeSection } from "@/lib/types";
import { ApiError } from "@/lib/api";

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "marquee", label: "Capabilities marquee" },
  { value: "selected-work", label: "Selected work" },
  { value: "horizontal-projects", label: "Fresh from the studio" },
  { value: "services", label: "Services" },
  { value: "process", label: "Process" },
  { value: "about", label: "About teaser" },
  { value: "stats", label: "Stats" },
  { value: "testimonials", label: "Testimonials" },
  { value: "clients", label: "Clients" },
  { value: "insights", label: "Insights teaser" },
  { value: "cta", label: "Final CTA" },
];

export default function HomePage() {
  const { data, setData, loading, saving, saved, save } = useSingleton<any>("homepage");
  const { toast } = useToast();
  const [editing, setEditing] = useState<HomeSection | null>(null);
  const [creating, setCreating] = useState(false);

  if (loading || !data) return <Spinner label="Loading homepage sections" />;

  const sections: HomeSection[] = ((data.sections ?? []) as HomeSection[]).sort((a: HomeSection, b: HomeSection) => (a.order ?? 0) - (b.order ?? 0));
  const setSections = (next: HomeSection[]) => setData((d: any) => ({ ...d, sections: next.map((s, i) => ({ ...s, order: i })) }));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  };

  const toggle = (index: number) => {
    setSections(sections.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)));
  };

  const remove = async (index: number) => {
    if (!window.confirm("Remove this section from the homepage?")) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const duplicate = (index: number) => {
    const copy = { ...sections[index], key: `${sections[index].key}-copy`, label: `${sections[index].label} (copy)` };
    const next = [...sections];
    next.splice(index + 1, 0, copy);
    setSections(next);
  };

  const addSection = (type: string) => {
    setEditing({
      type,
      key: `${type}-${Date.now()}`,
      label: SECTION_TYPES.find((t) => t.value === type)?.label ?? type,
      enabled: true,
      order: sections.length,
      heading: "",
      body: "",
      eyebrow: "",
      items: [],
      stats: [],
      clients: [],
      marquee: [],
      meta: {},
    });
    setCreating(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Homepage sections</h1>
          <p className="mt-1 text-sm text-smoke">Enable, reorder and edit every section on the public homepage.</p>
        </div>
        <Button variant="primary" onClick={() => save({ sections })} loading={saving}>
          {saved ? "Saved ✓" : "Save homepage"}
        </Button>
      </header>

      <Card
        title={`Sections (${sections.length})`}
        actions={
          <div className="flex items-center gap-2">
            <Select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) addSection(e.target.value);
                e.target.value = "";
              }}
              className="w-56"
            >
              <option value="">Add section…</option>
              {SECTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>
        }
      >
        <ul className="divide-y divide-line">
          {sections.map((section, i) => (
            <li key={section.key} className="flex items-center gap-3 py-3">
              <div className="flex flex-col gap-0.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-stone hover:text-paper disabled:opacity-30" aria-label="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="text-stone hover:text-paper disabled:opacity-30" aria-label="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <Checkbox checked={section.enabled !== false} onChange={() => toggle(i)} />
              <button type="button" onClick={() => { setEditing({ ...section }); setCreating(false); }} className="min-w-0 flex-1 text-left">
                <span className={`block text-sm font-medium ${section.enabled === false ? "text-stone line-through" : "text-paper"}`}>
                  {section.label}
                  <span className="meta-label ml-2 text-[9px] text-stone">{section.type}</span>
                </span>
                <span className="meta-label block truncate text-[10px] text-stone">
                  {section.heading || section.eyebrow || section.key}
                </span>
              </button>
              <button type="button" onClick={() => duplicate(i)} className="text-stone hover:text-paper" aria-label="Duplicate">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => { setEditing({ ...section }); setCreating(false); }} className="text-stone hover:text-paper" aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => remove(i)} className="text-stone hover:text-red-400" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {sections.length === 0 && <li className="py-8 text-center text-sm text-stone">No sections — the homepage will only show the marquee defaults.</li>}
        </ul>
      </Card>

      <SectionDialog
        open={editing !== null}
        section={editing}
        creating={creating}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSave={(section) => {
          if (creating) setSections([...sections, section]);
          else setSections(sections.map((s) => (s.key === section.key ? section : s)));
          setEditing(null);
          setCreating(false);
          toast("Section updated — save the homepage to publish");
        }}
      />
    </div>
  );
}

function SectionDialog({
  open,
  section,
  creating,
  onClose,
  onSave,
}: {
  open: boolean;
  section: HomeSection | null;
  creating: boolean;
  onClose: () => void;
  onSave: (section: HomeSection) => void;
}) {
  const [form, setForm] = useState<HomeSection | null>(null);

  useEffect(() => {
    if (open && section) setForm(JSON.parse(JSON.stringify(section)));
  }, [open, section]);

  if (!form) return null;

  const set = (key: string, value: any) => setForm((f) => (f ? { ...f, [key]: value } : f));

  return (
    <Dialog open={open} onClose={onClose} title={creating ? "New section" : `Edit section — ${form.label}`} wide>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Label (admin only)">
            <Input value={form.label ?? ""} onChange={(e) => set("label", e.target.value)} />
          </Field>
          <Field label="Key">
            <Input value={form.key ?? ""} onChange={(e) => set("key", e.target.value)} className="font-mono text-xs" />
          </Field>
          <Field label="Eyebrow / meta label">
            <Input value={form.eyebrow ?? ""} onChange={(e) => set("eyebrow", e.target.value)} />
          </Field>
          <Field label="Index (e.g. 04 capabilities)">
            <Input value={form.index ?? ""} onChange={(e) => set("index", e.target.value)} />
          </Field>
        </div>

        <Field label="Heading">
          <Input value={form.heading ?? ""} onChange={(e) => set("heading", e.target.value)} />
        </Field>
        <Field label="Body">
          <textarea
            className="w-full border border-line bg-ink-2 px-3 py-2 text-sm text-paper focus:border-acid focus:outline-none"
            rows={3}
            value={form.body ?? ""}
            onChange={(e) => set("body", e.target.value)}
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Image">
            <ImageField value={form.image ?? ""} onChange={(v) => set("image", v)} />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="CTA label">
            <Input value={form.cta?.label ?? ""} onChange={(e) => set("cta", { ...(form.cta ?? {}), label: e.target.value })} />
          </Field>
          <Field label="CTA href">
            <Input value={form.cta?.href ?? ""} onChange={(e) => set("cta", { ...(form.cta ?? {}), href: e.target.value })} />
          </Field>
          <Field label="Secondary CTA label">
            <Input value={form.secondaryCta?.label ?? ""} onChange={(e) => set("secondaryCta", { ...(form.secondaryCta ?? {}), label: e.target.value })} />
          </Field>
          <Field label="Secondary CTA href">
            <Input value={form.secondaryCta?.href ?? ""} onChange={(e) => set("secondaryCta", { ...(form.secondaryCta ?? {}), href: e.target.value })} />
          </Field>
        </div>

        {(form.type === "marquee" || form.type === "hero") && (
          <Field label="Marquee words" hint="One per line.">
            <TagsInput value={form.marquee ?? []} onChange={(v) => set("marquee", v)} />
          </Field>
        )}

        {(form.type === "stats") && (
          <Field label="Stats" hint="Value, suffix and label.">
            <RowsEditor
              value={(form.stats ?? []).map((s) => ({ ...s, value: s.value ?? "", suffix: s.suffix ?? "", label: s.label ?? "" }))}
              subfields={[
                { key: "value", label: "Value", type: "text" },
                { key: "suffix", label: "Suffix", type: "text" },
                { key: "label", label: "Label", type: "text" },
              ]}
              onChange={(v) => set("stats", v)}
            />
          </Field>
        )}

        {(form.type === "hero" || form.type === "cta") && (
          <Field label="Headline lines" hint="Each line is a row. Use the accent mark column to italicize a line.">
            <RowsEditor
              value={(form.items ?? []).map((it) => ({ ...it, index: it.index ?? "", title: it.title ?? "", mark: it.mark ?? "" }))}
              subfields={[
                { key: "title", label: "Line", type: "text" },
                { key: "mark", label: "Accent (accent = italic highlight)", type: "text" },
              ]}
              onChange={(v) => set("items", v)}
            />
          </Field>
        )}

        {form.type === "about" && (
          <Field label="Facts" hint="Label / value pairs (Founded 2014, Team 14 people…).">
            <RowsEditor
              value={(form.meta?.facts as Array<Record<string, string>>) ?? []}
              subfields={[
                { key: "label", label: "Label", type: "text" },
                { key: "value", label: "Value", type: "text" },
              ]}
              onChange={(v) => set("meta", { ...(form.meta ?? {}), facts: v })}
            />
          </Field>
        )}

        {form.type === "clients" && (
          <Field label="Client names" hint="Name + optional mark symbol.">
            <RowsEditor
              value={(form.clients ?? []).map((c) => ({ ...c, name: c.name ?? "", mark: c.mark ?? "" }))}
              subfields={[
                { key: "name", label: "Name", type: "text" },
                { key: "mark", label: "Mark", type: "text" },
              ]}
              onChange={(v) => set("clients", v)}
            />
          </Field>
        )}

        {(form.type === "cta") && (
          <Field label="Ring text" hint="Rotating text around the button.">
            <Input value={(form.meta?.ring as string) ?? ""} onChange={(e) => set("meta", { ...(form.meta ?? {}), ring: e.target.value })} />
          </Field>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(form)}>{creating ? "Add section" : "Save section"}</Button>
        </div>
      </div>
    </Dialog>
  );
}
