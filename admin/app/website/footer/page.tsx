"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useSingleton } from "@/lib/singleton";
import { Button, Card, Checkbox, Field, Input, Spinner } from "@/components/ui";

type FooterLink = { label: string; href: string };
type Column = { title: string; links: FooterLink[] };
type Social = { label: string; url: string; handle: string };

export default function FooterPage() {
  const { data, setData, loading, saving, saved, save } = useSingleton<any>("footer");

  if (loading || !data) return <Spinner label="Loading footer" />;

  const set = (key: string, value: any) => setData((d: any) => ({ ...d, [key]: value }));

  const columns: Column[] = data.columns ?? [];
  const socials: Social[] = data.socials ?? [];
  const contact = data.contact ?? {};

  const updateColumn = (i: number, column: Column) => set("columns", columns.map((c, ci) => (ci === i ? column : c)));
  const updateSocial = (i: number, social: Social) => set("socials", socials.map((s, si) => (si === i ? social : s)));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Footer</h1>
          <p className="mt-1 text-sm text-smoke">The site footer — columns, links and contact details.</p>
        </div>
        <Button variant="primary" onClick={() => save(data)} loading={saving}>
          {saved ? "Saved ✓" : "Save footer"}
        </Button>
      </header>

      <Card title="Brand block">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Description" className="md:col-span-2">
            <Input value={data.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Copyright text">
            <Input value={data.copyright ?? ""} onChange={(e) => set("copyright", e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card
        title={`Columns (${columns.length})`}
        actions={
          <Button size="sm" variant="outline" onClick={() => set("columns", [...columns, { title: "", links: [] }])}>
            <Plus className="h-3.5 w-3.5" /> Add column
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {columns.map((col, i) => (
            <div key={i} className="border border-line bg-ink p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Input value={col.title} onChange={(e) => updateColumn(i, { ...col, title: e.target.value })} placeholder="Column title (Sitemap)" className="max-w-xs" />
                <button type="button" onClick={() => set("columns", columns.filter((_, ci) => ci !== i))} className="text-stone hover:text-red-400" aria-label="Remove column">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {col.links.map((link, li) => (
                  <div key={li} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input value={link.label} onChange={(e) => updateColumn(i, { ...col, links: col.links.map((l, lxi) => (lxi === li ? { ...l, label: e.target.value } : l)) })} placeholder="Label" />
                    <Input value={link.href} onChange={(e) => updateColumn(i, { ...col, links: col.links.map((l, lxi) => (lxi === li ? { ...l, href: e.target.value } : l)) })} placeholder="/work" />
                    <button type="button" onClick={() => updateColumn(i, { ...col, links: col.links.filter((_, lxi) => lxi !== li) })} className="flex h-10 w-10 items-center justify-center text-stone hover:text-red-400" aria-label="Remove link">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" className="self-start" onClick={() => updateColumn(i, { ...col, links: [...col.links, { label: "", href: "" }] })}>
                  <Plus className="h-3 w-3" /> Add link
                </Button>
              </div>
            </div>
          ))}
          {columns.length === 0 && <p className="py-4 text-center text-sm text-stone">No columns yet.</p>}
        </div>
      </Card>

      <Card title="Contact">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Phone">
            <Input value={contact.phone ?? ""} onChange={(e) => set("contact", { ...contact, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input value={contact.email ?? ""} onChange={(e) => set("contact", { ...contact, email: e.target.value })} />
          </Field>
          <Field label="Address">
            <Input value={contact.address ?? ""} onChange={(e) => set("contact", { ...contact, address: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card title="Socials">
        <div className="flex flex-col gap-3">
          {socials.map((s, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_1fr_auto]">
              <Input value={s.label} onChange={(e) => updateSocial(i, { ...s, label: e.target.value })} placeholder="Label" />
              <Input value={s.url} onChange={(e) => updateSocial(i, { ...s, url: e.target.value })} placeholder="https://…" />
              <Input value={s.handle} onChange={(e) => updateSocial(i, { ...s, handle: e.target.value })} placeholder="Handle" />
              <button type="button" onClick={() => set("socials", socials.filter((_, si) => si !== i))} className="flex h-10 w-10 items-center justify-center text-stone hover:text-red-400" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => set("socials", [...socials, { label: "", url: "", handle: "" }])}>
            <Plus className="h-3.5 w-3.5" /> Add social
          </Button>
        </div>
      </Card>

      <Card title="Newsletter">
        <div className="flex flex-col gap-4">
          <Checkbox checked={data.newsletter?.enabled === true} onChange={(v) => set("newsletter", { ...(data.newsletter ?? {}), enabled: v })} label="Show newsletter signup in footer" />
          <Field label="Title">
            <Input value={data.newsletter?.title ?? ""} onChange={(e) => set("newsletter", { ...(data.newsletter ?? {}), title: e.target.value })} />
          </Field>
        </div>
      </Card>
    </div>
  );
}
