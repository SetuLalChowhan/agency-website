"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Pagination as PaginationInfo } from "@/lib/types";
import { EmptyState, Input, Pagination, Select, Spinner, useToast } from "@/components/ui";

type Activity = {
  _id: string;
  adminName: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  createdAt: string;
};

const ENTITIES = [
  "", "Site settings", "Theme", "Navigation", "Footer", "SEO defaults", "Homepage",
  "Service", "Project", "Case study", "Testimonial", "Team member", "FAQ",
  "Blog post", "Blog category", "Blog tag", "Media", "Lead", "Newsletter", "AdminUser",
];

export default function ActivityPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Activity[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 30, total: 0, pages: 0 });
  const [q, setQ] = useState("");
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "30" });
      if (q) params.set("q", q);
      if (entity) params.set("entity", entity);
      const res = await api<{ data: Activity[]; meta: { pagination: PaginationInfo } }>(`/api/v1/admin/activity?${params}`);
      setRows(res.data);
      setPagination(res.meta.pagination);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load activity", "error");
    } finally {
      setLoading(false);
    }
  }, [page, q, entity, toast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="display text-3xl text-paper">Activity log</h1>
        <p className="mt-1 text-sm text-smoke">Every admin action, recorded.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search actions…" className="pl-9" />
        </div>
        <Select value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }} className="w-52">
          {ENTITIES.map((e) => (
            <option key={e} value={e}>{e || "All entities"}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <Spinner label="Loading activity" />
      ) : rows.length === 0 ? (
        <EmptyState title="No activity recorded yet" />
      ) : (
        <div className="border border-line bg-ink-2/40">
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row._id}>
                <button type="button" onClick={() => setExpanded(expanded === row._id ? null : row._id)} className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-ink-2">
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-acid" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-paper/90">{row.action}</span>
                    <span className="meta-label block truncate text-[10px] text-stone">{row.adminName} · {row.entity}</span>
                  </span>
                  <time className="flex-none font-mono text-xs text-stone">{new Date(row.createdAt).toLocaleString()}</time>
                </button>
                {expanded === row._id && row.changes && Object.keys(row.changes).length > 0 && (
                  <pre className="mx-4 mb-3 overflow-x-auto border border-line bg-ink p-3 font-mono text-xs text-smoke">
                    {JSON.stringify(row.changes, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
          <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
