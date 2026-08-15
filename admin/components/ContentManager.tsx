"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Pagination as PaginationInfo } from "@/lib/types";
import type { CollectionConfig } from "@/lib/collections";
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  EmptyState,
  Field,
  Input,
  Pagination,
  Select,
  Spinner,
  Textarea,
  useConfirm,
  useToast,
} from "@/components/ui";
import { ImageField, MetaEditor, RowsEditor, TagsInput } from "@/components/fields";
import { cn } from "@/lib/cn";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
];

export function ContentManager({ config }: { config: CollectionConfig }) {
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [rows, setRows] = useState<Array<Record<string, any>>>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 25, total: 0, pages: 0 });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25", sort: "order", dir: "asc" });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      const res = await api<{ data: Array<Record<string, any>>; meta: { pagination: PaginationInfo } }>(
        `${config.apiPath}?${params.toString()}`
      );
      setRows(res.data);
      setPagination(res.meta.pagination);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [config.apiPath, page, q, status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (payload: Record<string, any>) => {
    setSaving(true);
    try {
      if (creating) {
        await api(config.apiPath, { method: "POST", body: payload });
        toast(`${config.singular} created`);
      } else {
        await api(`${config.apiPath}/${editing?._id}`, { method: "PATCH", body: payload });
        toast(`${config.singular} updated`);
      }
      setEditing(null);
      setCreating(false);
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Record<string, any>) => {
    if (!(await confirm(`Delete this ${config.singular.toLowerCase()}? This cannot be undone.`))) return;
    try {
      await api(`${config.apiPath}/${row._id}`, { method: "DELETE" });
      toast(`${config.singular} deleted`);
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Delete failed", "error");
    }
  };

  const duplicate = async (row: Record<string, any>) => {
    try {
      await api(`${config.apiPath}/${row._id}/duplicate`, { method: "POST" });
      toast(`${config.singular} duplicated as draft`);
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Duplicate failed", "error");
    }
  };

  const toggle = async (row: Record<string, any>, key: string, value: boolean) => {
    try {
      await api(`${config.apiPath}/${row._id}`, { method: "PATCH", body: { [key]: value } });
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Update failed", "error");
    }
  };

  const title = (row: Record<string, any>) => row[config.titleField] ?? "Untitled";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">{config.label}</h1>
          <p className="mt-1 text-sm text-smoke">{pagination.total} records</p>
        </div>
        <Button variant="primary" onClick={() => { setEditing({}); setCreating(true); }}>
          <Plus className="h-4 w-4" /> New {config.singular.toLowerCase()}
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search…" className="pl-9" />
        </div>
        {config.statusField && (
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-44">
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          body="Create your first record to get started."
          action={
            <Button variant="primary" size="sm" onClick={() => { setEditing({}); setCreating(true); }}>
              <Plus className="h-3.5 w-3.5" /> Create
            </Button>
          }
        />
      ) : (
        <div className="border border-line bg-ink-2/40">
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row._id} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-ink-2">
                <button
                  type="button"
                  onClick={() => { setEditing(row); setCreating(false); }}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-paper">{title(row)}</span>
                    {config.subtitleField && row[config.subtitleField] && (
                      <span className="meta-label mt-0.5 block truncate text-[10px] text-stone">{row[config.subtitleField]}</span>
                    )}
                  </span>
                  {config.statusField === "status" && <Badge value={row.status} />}
                  {config.statusField === "enabled" && (
                    <Checkbox checked={row.enabled !== false} onChange={(v) => toggle(row, "enabled", v)} label="Enabled" />
                  )}
                  {config.statusField === "visible" && (
                    <Checkbox checked={row.visible !== false} onChange={(v) => toggle(row, "visible", v)} label="Visible" />
                  )}
                  {row.featured === true && <Badge value="featured" />}
                </button>
                <div className="flex flex-none items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="ghost" onClick={() => duplicate(row)} aria-label="Duplicate">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(row)} aria-label="Delete" className="hover:!text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onChange={setPage} />
        </div>
      )}

      <EditorDialog
        open={editing !== null}
        config={config}
        initial={editing ?? {}}
        creating={creating}
        saving={saving}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSave={save}
      />
    </div>
  );
}

/* --------------------------- Editor dialog -------------------------- */

function EditorDialog({
  open,
  config,
  initial,
  creating,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  config: CollectionConfig;
  initial: Record<string, any>;
  creating: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, any>) => void;
}) {
  const [form, setForm] = useState<Record<string, any>>({});
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(JSON.parse(JSON.stringify(initial)));
      setSlugTouched(false);
    }
  }, [open, initial]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const autoSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);

  const submit = () => {
    const payload = { ...form };
    const slugField = config.fields.find((f) => f.type === "slug");
    if (slugField && !slugTouched) {
      const source = payload[config.titleField] ?? "untitled";
      payload[slugField.key] = autoSlug(String(source));
    }
    onSave(payload);
  };

  const grouped = config.fields.reduce<Array<{ group: string; fields: typeof config.fields }>>((acc, f) => {
    const group = f.group ?? "Details";
    const existing = acc.find((g) => g.group === group);
    if (existing) existing.fields.push(f);
    else acc.push({ group, fields: [f] });
    return acc;
  }, []);

  return (
    <Dialog open={open} onClose={onClose} title={creating ? `New ${config.singular.toLowerCase()}` : `Edit ${config.singular.toLowerCase()}`} wide>
      <div className="flex flex-col gap-6">
        {grouped.map((g) => (
          <div key={g.group} className="flex flex-col gap-4">
            {g.group !== "Details" && <p className="meta-label text-stone">{g.group}</p>}
            {g.fields.map((field) => (
              <div key={field.key}>
                {field.type === "checkbox" ? (
                  <Checkbox checked={Boolean(form[field.key])} onChange={(v) => set(field.key, v)} label={field.label} />
                ) : field.type === "select" ? (
                  <Field label={field.label} hint={field.hint}>
                    <Select value={form[field.key] ?? ""} onChange={(e) => set(field.key, e.target.value)}>
                      {(field.options ?? []).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  </Field>
                ) : field.type === "textarea" ? (
                  <Field label={field.label} hint={field.hint}>
                    <Textarea value={form[field.key] ?? ""} onChange={(e) => set(field.key, e.target.value)} rows={4} />
                  </Field>
                ) : field.type === "number" ? (
                  <Field label={field.label} hint={field.hint}>
                    <Input type="number" value={form[field.key] ?? 0} onChange={(e) => set(field.key, Number(e.target.value))} />
                  </Field>
                ) : field.type === "slug" ? (
                  <Field label={field.label} hint={field.hint}>
                    <Input
                      value={form[field.key] ?? ""}
                      onChange={(e) => { setSlugTouched(true); set(field.key, e.target.value); }}
                      placeholder="auto-generated"
                    />
                  </Field>
                ) : field.type === "image" ? (
                  <Field label={field.label} hint={field.hint}>
                    <ImageField value={form[field.key] ?? ""} onChange={(v) => set(field.key, v)} />
                  </Field>
                ) : field.type === "tags" ? (
                  <Field label={field.label} hint={field.hint}>
                    <TagsInput value={form[field.key] ?? []} onChange={(v) => set(field.key, v)} />
                  </Field>
                ) : field.type === "rows" ? (
                  <Field label={field.label} hint={field.hint}>
                    <RowsEditor
                      value={form[field.key] ?? []}
                      subfields={field.subfields ?? []}
                      onChange={(v) => set(field.key, v)}
                    />
                  </Field>
                ) : field.type === "meta" ? (
                  <Field label={field.label} hint={field.hint}>
                    <MetaEditor value={form[field.key] ?? {}} subfields={field.subfields ?? []} onChange={(v) => set(field.key, v)} />
                  </Field>
                ) : (
                  <Field label={field.label} hint={field.hint}>
                    <Input value={form[field.key] ?? ""} onChange={(e) => set(field.key, e.target.value)} placeholder={field.placeholder} />
                  </Field>
                )}
              </div>
            ))}
          </div>
        ))}

        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>
            {creating ? "Create" : "Save changes"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
