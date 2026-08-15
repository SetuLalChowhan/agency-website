"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Link2, Search, Trash2, Upload } from "lucide-react";
import { api, ApiError, API_URL } from "@/lib/api";
import type { MediaItem, Pagination as PaginationInfo } from "@/lib/types";
import { Button, Dialog, EmptyState, Field, Input, Pagination, Spinner, useConfirm, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";

export default function MediaPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 48, total: 0, pages: 0 });
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "48" });
      if (q) params.set("q", q);
      if (type) params.set("type", type);
      const res = await api<{ data: MediaItem[]; meta: { pagination: PaginationInfo } }>(`/api/v1/admin/media?${params}`);
      setItems(res.data);
      setPagination(res.meta.pagination);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load media", "error");
    } finally {
      setLoading(false);
    }
  }, [page, q, type, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api("/api/v1/admin/media/upload", { method: "POST", formData });
      toast("Uploaded");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (item: MediaItem) => {
    if (!(await confirm("Delete this asset? It will be removed from Cloudinary too."))) return;
    try {
      await api(`/api/v1/admin/media/${item._id}`, { method: "DELETE" });
      toast("Deleted");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Delete failed", "error");
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast("URL copied");
    } catch {
      toast("Could not copy — select the URL manually", "error");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Media library</h1>
          <p className="mt-1 text-sm text-smoke">{pagination.total} assets · stored in Cloudinary</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <Button variant="primary" onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search assets…" className="pl-9" />
        </div>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="h-10 border border-line bg-ink-2 px-3 text-sm text-paper focus:border-acid focus:outline-none"
        >
          <option value="">All types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {loading ? (
        <Spinner label="Loading media" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No assets yet"
          body="Upload images and videos — they'll be available everywhere via the media picker."
          action={<Button variant="primary" size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-3.5 w-3.5" /> Upload</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((item) => (
              <div key={item._id} className="group relative overflow-hidden border border-line bg-ink-2">
                {item.resourceType === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.secureUrl || item.url} alt={item.altText || item.publicId} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center text-xs text-stone">video</div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-ink/80 px-2 py-1.5 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={() => setEditing(item)} className="text-xs text-paper hover:text-acid" aria-label="Edit metadata">Edit</button>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => copyUrl(item.secureUrl || item.url)} className="text-xs text-smoke hover:text-acid" aria-label="Copy URL"><Copy className="h-3 w-3" /></button>
                    <button type="button" onClick={() => remove(item)} className="text-xs text-smoke hover:text-red-400" aria-label="Delete"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onChange={setPage} />
        </>
      )}

      <MediaMetaDialog
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
    </div>
  );
}

function MediaMetaDialog({ item, onClose, onSaved }: { item: MediaItem | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setAlt(item.altText ?? "");
      setCaption(item.caption ?? "");
    }
  }, [item]);

  const save = async () => {
    if (!item) return;
    setSaving(true);
    try {
      await api(`/api/v1/admin/media/${item._id}`, { method: "PATCH", body: { altText: alt, caption } });
      toast("Metadata saved");
      onSaved();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={item !== null} onClose={onClose} title="Asset details">
      {item && (
        <div className="flex flex-col gap-4">
          {item.resourceType === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.secureUrl || item.url} alt={item.altText || "Asset preview"} className="max-h-64 w-full border border-line object-cover" />
          )}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs text-stone">
            <span>Format: <span className="text-paper">{item.format}</span></span>
            <span>Size: <span className="text-paper">{item.bytes ? `${(item.bytes / 1024).toFixed(0)} KB` : "—"}</span></span>
            <span className="col-span-2">Dimensions: <span className="text-paper">{item.width && item.height ? `${item.width}×${item.height}` : "—"}</span></span>
            <span className="col-span-2 truncate" title={item.secureUrl || item.url}>
              URL: <span className="text-paper">{item.secureUrl || item.url}</span>
            </span>
            <span className="col-span-2 flex items-center gap-2">
              <button type="button" onClick={() => navigator.clipboard.writeText(item.secureUrl || item.url)} className="inline-flex items-center gap-1 text-acid hover:underline">
                <Link2 className="h-3 w-3" /> Copy URL
              </button>
            </span>
          </div>
          <Field label="Alt text" hint="Used by the public site for accessibility and SEO.">
            <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Field>
          <Field label="Caption">
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} />
          </Field>
          <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={save} loading={saving}>Save metadata</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
