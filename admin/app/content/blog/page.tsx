"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Plus, Search, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Pagination as PaginationInfo } from "@/lib/types";
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
  useConfirm,
  useToast,
} from "@/components/ui";
import { ImageField, RowsEditor, TagsInput } from "@/components/fields";

type Category = { _id: string; name: string; slug: string };
type Tag = { _id: string; name: string; slug: string };
type Post = Record<string, any>;

export default function BlogManager() {
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 25, total: 0, pages: 0 });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25", sort: "publishedAt", dir: "desc" });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      const [postsRes, catsRes, tagsRes] = await Promise.all([
        api<{ data: Post[]; meta: { pagination: PaginationInfo } }>(`/api/v1/admin/content/blog?${params}`),
        api<{ data: Category[] }>("/api/v1/admin/content/blog-categories?limit=100"),
        api<{ data: Tag[] }>("/api/v1/admin/content/blog-tags?limit=100"),
      ]);
      setPosts(postsRes.data);
      setPagination(postsRes.meta.pagination);
      setCategories(catsRes.data);
      setTags(tagsRes.data);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, [page, q, status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (payload: Record<string, any>) => {
    setSaving(true);
    try {
      if (creating) await api("/api/v1/admin/content/blog", { method: "POST", body: payload });
      else await api(`/api/v1/admin/content/blog/${editing?._id}`, { method: "PATCH", body: payload });
      toast(creating ? "Post created" : "Post updated");
      setEditing(null);
      setCreating(false);
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (post: Post) => {
    if (!(await confirm("Delete this post? This cannot be undone."))) return;
    try {
      await api(`/api/v1/admin/content/blog/${post._id}`, { method: "DELETE" });
      toast("Post deleted");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Delete failed", "error");
    }
  };

  const duplicate = async (post: Post) => {
    try {
      await api(`/api/v1/admin/content/blog/${post._id}/duplicate`, { method: "POST" });
      toast("Post duplicated as draft");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Duplicate failed", "error");
    }
  };

  const catName = (id?: string) => categories.find((c) => c._id === id)?.name ?? "—";

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Blog posts</h1>
          <p className="mt-1 text-sm text-smoke">{pagination.total} posts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.assign("/content/blog-categories")}>Categories</Button>
          <Button variant="outline" onClick={() => window.location.assign("/content/blog-tags")}>Tags</Button>
          <Button variant="primary" onClick={() => { setEditing({}); setCreating(true); }}>
            <Plus className="h-4 w-4" /> New post
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search posts…" className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-44">
          <option value="">All statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </div>

      {loading ? (
        <Spinner label="Loading posts" />
      ) : posts.length === 0 ? (
        <EmptyState title="No posts yet" body="Write your first insight from the studio." />
      ) : (
        <div className="border border-line bg-ink-2/40">
          <ul className="divide-y divide-line">
            {posts.map((post) => (
              <li key={post._id} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-ink-2">
                <button type="button" onClick={() => { setEditing(post); setCreating(false); }} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-paper">{post.title}</span>
                    <span className="meta-label mt-0.5 block truncate text-[10px] text-stone">
                      {catName(post.category)} · {post.readingTime || "—"} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "not published"}
                    </span>
                  </span>
                  {post.featured && <Badge value="featured" />}
                  <Badge value={post.status} />
                </button>
                <div className="flex flex-none items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="ghost" onClick={() => duplicate(post)} aria-label="Duplicate"><Copy className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(post)} aria-label="Delete" className="hover:!text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onChange={setPage} />
        </div>
      )}

      <BlogEditor
        open={editing !== null}
        initial={editing ?? {}}
        creating={creating}
        saving={saving}
        categories={categories}
        tags={tags}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSave={save}
      />
    </div>
  );
}

function BlogEditor({
  open,
  initial,
  creating,
  saving,
  categories,
  tags,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: Post;
  creating: boolean;
  saving: boolean;
  categories: Category[];
  tags: Tag[];
  onClose: () => void;
  onSave: (payload: Record<string, any>) => void;
}) {
  const [form, setForm] = useState<Post>({});
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) setForm(JSON.parse(JSON.stringify(initial)));
  }, [open, initial]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    const payload = { ...form };
    if (!slugTouched) {
      payload.slug = (payload.title ?? "untitled")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 120);
    }
    // Map tag names to ids
    const tagNames = (payload.tagNames ?? []) as string[];
    payload.tags = tagNames
      .map((n) => tags.find((t) => t.name.toLowerCase() === n.toLowerCase())?._id)
      .filter(Boolean);
    delete payload.tagNames;
    onSave(payload);
  };

  const existingTagNames = (initial.tags ?? [])
    .map((id: string) => tags.find((t) => t._id === id)?.name)
    .filter(Boolean);

  return (
    <Dialog open={open} onClose={onClose} title={creating ? "New post" : "Edit post"} wide>
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" className="md:col-span-2">
            <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Slug" hint="Auto-generated from the title when left blank.">
            <Input value={form.slug ?? ""} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} placeholder="auto-generated" />
          </Field>
          <Field label="Reading time">
            <Input value={form.readingTime ?? ""} onChange={(e) => set("readingTime", e.target.value)} placeholder="6 min read" />
          </Field>
          <Field label="Category">
            <Select value={form.category ?? ""} onChange={(e) => set("category", e.target.value || undefined)}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tags">
            <TagsInput value={form.tagNames ?? existingTagNames ?? []} onChange={(v) => set("tagNames", v)} />
          </Field>
          <Field label="Author">
            <Input value={form.author ?? ""} onChange={(e) => set("author", e.target.value)} />
          </Field>
          <Field label="Featured">
            <Checkbox checked={Boolean(form.featured)} onChange={(v) => set("featured", v)} label="Feature on the site" className="pt-6" />
          </Field>
        </div>

        <Field label="Excerpt">
          <textarea
            className="w-full border border-line bg-ink-2 px-3 py-2 text-sm text-paper placeholder:text-stone transition-colors focus:border-acid focus:outline-none"
            rows={3}
            value={form.excerpt ?? ""}
            onChange={(e) => set("excerpt", e.target.value)}
          />
        </Field>

        <Field label="Cover image">
          <ImageField value={form.art ?? ""} onChange={(v) => set("art", v)} />
        </Field>

        <Field label="Pull quote">
          <Input value={form.pullQuote ?? ""} onChange={(e) => set("pullQuote", e.target.value)} />
        </Field>

        <Field label="Content blocks" hint="Structured sections — heading plus paragraphs.">
          <RowsEditor
            value={form.content ?? []}
            subfields={[
              { key: "heading", label: "Heading", type: "text" },
              { key: "paragraphs", label: "Paragraphs (one per line)", type: "textarea" },
            ]}
            onChange={(v) =>
              set(
                "content",
                v.map((row) => ({ ...row, paragraphs: Array.isArray(row.paragraphs) ? row.paragraphs : (row.paragraphs ?? "").split("\n").filter(Boolean) }))
              )
            }
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Status">
            <Select value={form.status ?? "DRAFT"} onChange={(e) => set("status", e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
          <Field label="Publish date">
            <Input
              type="date"
              value={form.publishedAt ? String(form.publishedAt).slice(0, 10) : ""}
              onChange={(e) => set("publishedAt", e.target.value ? new Date(e.target.value).toISOString() : undefined)}
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>{creating ? "Create" : "Save changes"}</Button>
        </div>
      </div>
    </Dialog>
  );
}
