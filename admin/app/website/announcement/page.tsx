"use client";

import { useSingleton } from "@/lib/singleton";
import { Button, Card, Checkbox, Field, Input, Spinner } from "@/components/ui";

export default function AnnouncementPage() {
  const { data, setData, loading, saving, saved, save } = useSingleton<any>("settings");

  if (loading || !data) return <Spinner label="Loading settings" />;

  const set = (key: string, value: any) => setData((d: any) => ({ ...d, [key]: value }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Announcement & CTA</h1>
          <p className="mt-1 text-sm text-smoke">Site-wide banner, header call-to-action and maintenance mode.</p>
        </div>
        <Button variant="primary" onClick={() => save(data)} loading={saving}>
          {saved ? "Saved ✓" : "Save changes"}
        </Button>
      </header>

      <Card title="Announcement bar">
        <div className="flex flex-col gap-4">
          <Checkbox checked={data.announcementBar?.enabled === true} onChange={(v) => set("announcementBar", { ...(data.announcementBar ?? {}), enabled: v })} label="Show announcement bar" />
          <Field label="Text">
            <Input value={data.announcementBar?.text ?? ""} onChange={(e) => set("announcementBar", { ...(data.announcementBar ?? {}), text: e.target.value })} placeholder="Now booking Q3 — two slots left" />
          </Field>
          <Field label="Link (optional)">
            <Input value={data.announcementBar?.link ?? ""} onChange={(e) => set("announcementBar", { ...(data.announcementBar ?? {}), link: e.target.value })} placeholder="/contact" />
          </Field>
        </div>
      </Card>

      <Card title="Global CTA">
        <div className="flex flex-col gap-4">
          <Checkbox checked={data.globalCta?.enabled !== false} onChange={(v) => set("globalCta", { ...(data.globalCta ?? {}), enabled: v })} label="Show header CTA button" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Label">
              <Input value={data.globalCta?.label ?? ""} onChange={(e) => set("globalCta", { ...(data.globalCta ?? {}), label: e.target.value })} />
            </Field>
            <Field label="Href">
              <Input value={data.globalCta?.href ?? ""} onChange={(e) => set("globalCta", { ...(data.globalCta ?? {}), href: e.target.value })} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Maintenance mode">
        <div className="flex flex-col gap-4">
          <Checkbox checked={data.maintenance?.enabled === true} onChange={(v) => set("maintenance", { ...(data.maintenance ?? {}), enabled: v })} label="Put the site in maintenance mode" />
          <Field label="Message">
            <Input value={data.maintenance?.message ?? ""} onChange={(e) => set("maintenance", { ...(data.maintenance ?? {}), message: e.target.value })} />
          </Field>
        </div>
      </Card>
    </div>
  );
}
