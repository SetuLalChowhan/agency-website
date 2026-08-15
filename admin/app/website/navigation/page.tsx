"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useSingleton } from "@/lib/singleton";
import { Button, Card, Checkbox, Dialog, Field, Input, Select, Spinner } from "@/components/ui";
import type { NavItem } from "@/lib/types";

export default function NavigationPage() {
  const { data, setData, loading, saving, saved, save } = useSingleton<any>("navigation");
  const [editing, setEditing] = useState<{ item: NavItem; index: number } | null>(null);
  const [creating, setCreating] = useState(false);

  if (loading || !data) return <Spinner label="Loading navigation" />;

  const items: NavItem[] = data.items ?? [];
  const setItems = (next: NavItem[]) => setData((d: any) => ({ ...d, items: next }));

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next.map((item, i) => ({ ...item, order: i })));
  };

  const toggleEnabled = (index: number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item)));
  };

  const remove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const saveItem = (item: NavItem, index: number | null) => {
    const clean: NavItem = {
      label: item.label.trim() || "Untitled",
      href: item.href.trim() || "/",
      type: item.type ?? "internal",
      target: item.target ?? "_self",
      enabled: item.enabled ?? true,
      order: index ?? items.length,
      children: item.children ?? [],
    };
    if (index === null) setItems([...items, clean]);
    else setItems(items.map((x, i) => (i === index ? clean : x)));
    setEditing(null);
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Navigation</h1>
          <p className="mt-1 text-sm text-smoke">The public header menu — changes appear after save.</p>
        </div>
        <Button variant="primary" onClick={save} loading={saving}>
          {saved ? "Saved ✓" : "Save navigation"}
        </Button>
      </header>

      <Card title={`Menu items (${items.length})`} actions={
        <Button size="sm" variant="primary" onClick={() => { setEditing({ item: { label: "", href: "/", type: "internal", target: "_self", enabled: true, order: items.length }, index: items.length }); setCreating(true); }}>
          <Plus className="h-3.5 w-3.5" /> Add item
        </Button>
      }>
        <ul className="divide-y divide-line">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 py-3">
              <div className="flex flex-col gap-0.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-stone hover:text-paper disabled:opacity-30" aria-label="Move up">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-stone hover:text-paper disabled:opacity-30" aria-label="Move down">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <Checkbox checked={item.enabled !== false} onChange={() => toggleEnabled(i)} />
              <button type="button" onClick={() => { setEditing({ item, index: i }); setCreating(false); }} className="min-w-0 flex-1 text-left">
                <span className={`block truncate text-sm font-medium ${item.enabled === false ? "text-stone line-through" : "text-paper"}`}>{item.label}</span>
                <span className="meta-label block truncate text-[10px] text-stone">{item.href}</span>
              </button>
              <button type="button" onClick={() => setEditing({ item, index: i })} className="text-stone hover:text-paper" aria-label="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => remove(i)} className="text-stone hover:text-red-400" aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="py-6 text-center text-sm text-stone">No menu items yet.</li>}
        </ul>
      </Card>

      <Card title="Header CTA button">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Label">
            <Input value={data.cta?.label ?? ""} onChange={(e) => setData((d: any) => ({ ...d, cta: { ...(d.cta ?? {}), label: e.target.value } }))} />
          </Field>
          <Field label="Href">
            <Input value={data.cta?.href ?? ""} onChange={(e) => setData((d: any) => ({ ...d, cta: { ...(d.cta ?? {}), href: e.target.value } }))} />
          </Field>
          <div className="pt-6">
            <Checkbox checked={data.cta?.enabled !== false} onChange={(v) => setData((d: any) => ({ ...d, cta: { ...(d.cta ?? {}), enabled: v } }))} label="Show CTA button" />
          </div>
        </div>
      </Card>

      <NavItemDialog
        open={editing !== null}
        item={editing?.item}
        creating={creating}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSave={(item) => saveItem(item, editing?.index ?? null)}
      />
    </div>
  );
}

function NavItemDialog({
  open,
  item,
  creating,
  onClose,
  onSave,
}: {
  open: boolean;
  item?: NavItem;
  creating: boolean;
  onClose: () => void;
  onSave: (item: NavItem) => void;
}) {
  const [form, setForm] = useState<NavItem>({ label: "", href: "/", type: "internal", target: "_self", enabled: true, order: 0 });

  useEffect(() => {
    if (open && item) setForm({ ...item });
  }, [open, item]);

  return (
    <Dialog open={open} onClose={onClose} title={creating ? "New menu item" : "Edit menu item"}>
      <div className="flex flex-col gap-4">
        <Field label="Label">
          <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Work" autoFocus />
        </Field>
        <Field label="URL" hint="Internal links start with / — external links need https://">
          <Input value={form.href} onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))} placeholder="/work" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as "internal" | "external" }))}>
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </Select>
          </Field>
          <Field label="Open in">
            <Select value={form.target} onChange={(e) => setForm((f) => ({ ...f, target: e.target.value as "_self" | "_blank" }))}>
              <option value="_self">Same tab</option>
              <option value="_blank">New tab</option>
            </Select>
          </Field>
        </div>
        <Checkbox checked={form.enabled} onChange={(v) => setForm((f) => ({ ...f, enabled: v }))} label="Enabled" />
        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onSave(form)}>{creating ? "Add item" : "Save item"}</Button>
        </div>
      </div>
    </Dialog>
  );
}
