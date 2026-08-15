"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Lead, Pagination as PaginationInfo } from "@/lib/types";
import { Badge, Button, EmptyState, Input, Pagination, Select, Spinner, Tabs, useToast } from "@/components/ui";

const STATUSES = ["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "CLOSED", "SPAM"];

const TABS = [
  { key: "contact", label: "Contact messages" },
  { key: "quotes", label: "Quote requests" },
  { key: "newsletter", label: "Newsletter" },
];

type LeadRow = Lead & { company?: string; budget?: string; service?: string; message?: string; status: string };

export default function LeadsPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState("contact");
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 25, total: 0, pages: 0 });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const endpoint = tab === "contact" ? "/api/v1/leads/contact-messages" : tab === "quotes" ? "/api/v1/leads/quote-requests" : "/api/v1/leads/newsletter-subscribers";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      const res = await api<{ data: LeadRow[]; meta: { pagination: PaginationInfo } }>(`${endpoint}?${params}`);
      setRows(res.data);
      setPagination(res.meta.pagination);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load leads", "error");
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, q, status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (row: LeadRow, value: string) => {
    try {
      await api(`${endpoint}/${row._id}`, { method: "PATCH", body: { status: value } });
      toast("Status updated");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Update failed", "error");
    }
  };

  const remove = async (row: LeadRow) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await api(`${endpoint}/${row._id}`, { method: "DELETE" });
      toast("Deleted");
      load();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Delete failed", "error");
    }
  };

  const countNew = (list: LeadRow[]) => list.filter((l) => l.status === "NEW").length;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="display text-3xl text-paper">Leads</h1>
        <p className="mt-1 text-sm text-smoke">Contact messages, quote requests and newsletter subscribers.</p>
      </header>

      <Tabs tabs={TABS} active={tab} onChange={(k) => { setTab(k); setPage(1); }} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search name, email, company…" className="pl-9" />
        </div>
        {tab !== "newsletter" && (
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-44">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        )}
      </div>

      {loading ? (
        <Spinner label="Loading leads" />
      ) : rows.length === 0 ? (
        <EmptyState title="Nothing here" body="New submissions from the public site will appear here." />
      ) : (
        <div className="border border-line bg-ink-2/40">
          <ul className="divide-y divide-line">
            {rows.map((row) => (
              <li key={row._id} className="flex items-start gap-4 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-paper">{row.name || row.email}</span>
                    <Badge value={row.status} />
                    {tab !== "newsletter" && <span className="meta-label text-[10px] text-stone">{new Date(row.createdAt).toLocaleString()}</span>}
                  </div>
                  <p className="meta-label mt-1 text-[10px] text-stone">
                    {row.email}
                    {row.company ? ` · ${row.company}` : ""}
                    {row.budget ? ` · ${row.budget}` : ""}
                    {row.service ? ` · ${row.service}` : ""}
                  </p>
                  {row.message && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-paper/75">{row.message}</p>}
                  {tab === "newsletter" && (
                    <p className="meta-label mt-1 text-[10px] text-stone">Subscribed {new Date(row.createdAt).toLocaleDateString()} · {row.status}</p>
                  )}
                </div>
                <div className="flex flex-none flex-col items-end gap-2">
                  {tab !== "newsletter" ? (
                    <Select value={row.status} onChange={(e) => updateStatus(row, e.target.value)} className="!h-8 w-40 !py-1 text-xs">
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(row, row.status === "SUBSCRIBED" ? "UNSUBSCRIBED" : "SUBSCRIBED")}>
                      {row.status === "SUBSCRIBED" ? "Unsubscribe" : "Resubscribe"}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => remove(row)} className="hover:!text-red-400">
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
