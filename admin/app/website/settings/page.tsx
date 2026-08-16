"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api";
import { useSingleton } from "@/lib/singleton";
import { Button, Card, Field, Input, Spinner, useToast } from "@/components/ui";
import { ImageField } from "@/components/fields";
import { Plus, Trash2 } from "lucide-react";

type Social = { label: string; url: string; handle: string };

export default function SettingsPage() {
  const { data, setData, loading, saving, saved, save } = useSingleton<any>("settings");
  const { toast } = useToast();

  const [socials, setSocials] = useState<Social[]>([]);

  useEffect(() => {
    if (data) setSocials(data.socials ?? []);
  }, [data]);

  if (loading || !data) return <Spinner label="Loading settings" />;

  const set = (key: string, value: any) => setData((d: any) => ({ ...d, [key]: value }));

  const submit = async () => {
    const cleanSocials = socials.filter((s) => s.label.trim() || s.url.trim());
    // The server triggers targeted cache revalidation after a successful save.
    await save({ ...data, socials: cleanSocials });
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">General & branding</h1>
          <p className="mt-1 text-sm text-smoke">Identity, contact details and social profiles.</p>
        </div>
        <Button variant="primary" onClick={submit} loading={saving}>
          {saved ? "Saved ✓" : "Save changes"}
        </Button>
      </header>

      <Card title="Identity">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Site name">
            <Input value={data.name ?? ""} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Wordmark (with symbol)">
            <Input value={data.wordmark ?? ""} onChange={(e) => set("wordmark", e.target.value)} />
          </Field>
          <Field label="Legal name">
            <Input value={data.legal ?? ""} onChange={(e) => set("legal", e.target.value)} />
          </Field>
          <Field label="Site URL">
            <Input value={data.url ?? ""} onChange={(e) => set("url", e.target.value)} />
          </Field>
          <Field label="Tagline" className="md:col-span-2">
            <Input value={data.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={data.email ?? ""} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={data.location ?? ""} onChange={(e) => set("location", e.target.value)} />
          </Field>
          <Field label="Founded year">
            <Input type="number" value={data.founded ?? 2014} onChange={(e) => set("founded", Number(e.target.value))} />
          </Field>
        </div>
      </Card>

      <Card title="Logos & favicon">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Logo">
            <ImageField value={data.logo ?? ""} onChange={(v) => set("logo", v)} />
          </Field>
          <Field label="Logo (light background)">
            <ImageField value={data.logoDark ?? ""} onChange={(v) => set("logoDark", v)} />
          </Field>
          <Field label="Logo (mobile)">
            <ImageField value={data.logoMobile ?? ""} onChange={(v) => set("logoMobile", v)} />
          </Field>
          <Field label="Favicon">
            <ImageField value={data.favicon ?? ""} onChange={(v) => set("favicon", v)} />
          </Field>
        </div>
      </Card>

      <Card title="Social profiles">
        <div className="flex flex-col gap-3">
          {socials.map((s, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 border border-line bg-ink p-3 md:grid-cols-[1fr_2fr_1fr_auto]">
              <Input value={s.label} onChange={(e) => setSocials((arr) => arr.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)))} placeholder="Label (LinkedIn)" />
              <Input value={s.url} onChange={(e) => setSocials((arr) => arr.map((x, xi) => (xi === i ? { ...x, url: e.target.value } : x)))} placeholder="https://…" />
              <Input value={s.handle} onChange={(e) => setSocials((arr) => arr.map((x, xi) => (xi === i ? { ...x, handle: e.target.value } : x)))} placeholder="Handle (/kern-studio)" />
              <button type="button" onClick={() => setSocials((arr) => arr.filter((_, xi) => xi !== i))} className="flex h-10 w-10 items-center justify-center text-stone hover:text-red-400" aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setSocials((arr) => [...arr, { label: "", url: "", handle: "" }])}>
            <Plus className="h-3.5 w-3.5" /> Add social
          </Button>
        </div>
      </Card>
    </div>
  );
}
