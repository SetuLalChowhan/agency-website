"use client";

import { useEffect, useState } from "react";
import { GripVertical, ImagePlus, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { MediaItem } from "@/lib/types";
import { Button, Dialog, Field, Input, Spinner, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";

type Subfield = { key: string; label: string; type: "text" | "textarea" };

/* ------------------------------ Tags ------------------------------ */

export function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const text = value.join("\n");
  return (
    <Textarea
      value={text}
      rows={Math.min(Math.max(value.length, 2), 8)}
      onChange={(e) => onChange(e.target.value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean))}
      placeholder={placeholder ?? "One per line or comma-separated"}
    />
  );
}

/* ------------------------------ Rows ------------------------------ */

export function RowsEditor({
  value,
  subfields,
  onChange,
}: {
  value: Array<Record<string, string>>;
  subfields: Subfield[];
  onChange: (v: Array<Record<string, string>>) => void;
}) {
  const update = (i: number, key: string, v: string) => {
    onChange(value.map((row, ri) => (ri === i ? { ...row, [key]: v } : row)));
  };

  return (
    <div className="flex flex-col gap-3">
      {value.map((row, i) => (
        <div key={i} className="border border-line bg-ink p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="meta-label text-[10px] text-stone">
              <GripVertical className="mr-1 inline h-3 w-3" />
              Item {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, ri) => ri !== i))}
              className="text-stone transition-colors hover:text-red-400"
              aria-label={`Remove item ${i + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {subfields.map((sf) => (
              <label key={sf.key} className="flex flex-col gap-1">
                <span className="meta-label text-[10px] text-stone">{sf.label}</span>
                {sf.type === "textarea" ? (
                  <Textarea value={row[sf.key] ?? ""} onChange={(e) => update(i, sf.key, e.target.value)} rows={3} />
                ) : (
                  <Input value={row[sf.key] ?? ""} onChange={(e) => update(i, sf.key, e.target.value)} />
                )}
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => onChange([...value, {}])}>
        <Plus className="h-3.5 w-3.5" /> Add item
      </Button>
    </div>
  );
}

/* ------------------------------- Meta ------------------------------ */

export function MetaEditor({
  value,
  subfields,
  onChange,
}: {
  value: Record<string, unknown>;
  subfields: Subfield[];
  onChange: (v: Record<string, unknown>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {subfields.map((sf) => (
        <label key={sf.key} className="flex flex-col gap-1">
          <span className="meta-label text-[10px] text-stone">{sf.label}</span>
          {sf.type === "textarea" ? (
            <Textarea
              value={String(value[sf.key] ?? "")}
              onChange={(e) => onChange({ ...value, [sf.key]: e.target.value })}
              rows={3}
            />
          ) : (
            <Input value={String(value[sf.key] ?? "")} onChange={(e) => onChange({ ...value, [sf.key]: e.target.value })} />
          )}
        </label>
      ))}
    </div>
  );
}

/* --------------------------- Media picker -------------------------- */

export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    api<{ data: MediaItem[] }>(`/api/v1/admin/media?limit=60${q ? `&q=${encodeURIComponent(q)}` : ""}`)
      .then((r) => {
        if (!cancelled) setItems(r.data);
      })
      .catch(() => {
        if (!cancelled) toast("Could not load media", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, q, toast]);

  return (
    <Dialog open={open} onClose={onClose} title="Media library" wide>
      <div className="flex flex-col gap-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search assets…" autoFocus />
        {loading ? (
          <Spinner label="Loading media" />
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-stone">No assets found. Upload some in the Media library first.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
            {items.map((m) => (
              <button
                key={m._id}
                type="button"
                onClick={() => {
                  onSelect(m.secureUrl || m.url);
                  onClose();
                }}
                className="group flex aspect-square flex-col overflow-hidden border border-line bg-ink transition-colors hover:border-acid"
              >
                {m.resourceType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.secureUrl || m.url} alt={m.altText || m.caption || m.publicId} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-stone">video</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}

/* ------------------------------ Image ------------------------------ */

export function ImageField({ value, onChange, hint }: { value: string; onChange: (v: string) => void; hint?: string }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
        </div>
        <Button type="button" variant="outline" size="md" onClick={() => setPickerOpen(true)}>
          <ImagePlus className="h-4 w-4" /> Browse
        </Button>
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="Preview"
          className={cn("h-28 w-full border border-line object-cover", value.startsWith("http") ? "" : "bg-ink-3")}
        />
      )}
      {hint && <p className="text-xs text-stone">{hint}</p>}
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={onChange} />
    </div>
  );
}
