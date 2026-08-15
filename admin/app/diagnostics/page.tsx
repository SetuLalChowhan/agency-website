"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { Badge, Button, Card, Spinner, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";

type Diag = {
  api: { status: string; uptime: number; version: string };
  database: { status: string; name: string | null; readyState: number };
  cloudinary: { configured: boolean; enabled: boolean };
  environment: { name: string; publicApiUrl: string };
  revalidation: { configured: boolean; url: string | null };
  activity: { last24h: number; errorLikeLast24h: number };
  leads: { new: number };
};

export default function DiagnosticsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<Diag | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ data: Diag }>("/api/v1/admin/diagnostics");
      setData(res.data);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load diagnostics", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !data) return <Spinner label="Running diagnostics" />;

  const rows: Array<{ label: string; value: string; status: "ok" | "warn" | "error" | "info" }> = [
    {
      label: "API",
      value: `${data.api.status} · uptime ${Math.floor(data.api.uptime / 60)}m · v${data.api.version}`,
      status: data.api.status === "ok" ? "ok" : "error",
    },
    {
      label: "Database",
      value: data.database.status === "connected" ? `Connected · ${data.database.name ?? "kern"}` : data.database.status,
      status: data.database.status === "connected" ? "ok" : "error",
    },
    {
      label: "Cloudinary",
      value: data.cloudinary.configured ? "Configured — uploads enabled" : "Not configured — add CLOUDINARY_* env vars",
      status: data.cloudinary.configured ? "ok" : "warn",
    },
    {
      label: "Environment",
      value: `${data.environment.name} · ${data.environment.publicApiUrl}`,
      status: "info",
    },
    {
      label: "Cache revalidation",
      value: data.revalidation.configured ? data.revalidation.url ?? "Configured" : "Not configured",
      status: data.revalidation.configured ? "ok" : "warn",
    },
    {
      label: "Activity (24h)",
      value: `${data.activity.last24h} events${data.activity.errorLikeLast24h ? ` · ${data.activity.errorLikeLast24h} error-like` : ""}`,
      status: "info",
    },
    {
      label: "New leads",
      value: String(data.leads.new),
      status: data.leads.new > 0 ? "warn" : "info",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="display text-3xl text-paper">Diagnostics</h1>
          <p className="mt-1 text-sm text-smoke">System health — configuration presence only, never secrets.</p>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCw className="h-4 w-4" /> Re-check
        </Button>
      </header>

      <Card title="Status">
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-paper">{row.label}</p>
                <p className="font-mono text-xs text-stone">{row.value}</p>
              </div>
              <Badge value={row.status} className={cn(row.status === "ok" && "!border-emerald-500/30 !bg-emerald-500/15 !text-emerald-400")} />
            </li>
          ))}
        </ul>
      </Card>

      <p className="text-xs text-stone">
        Credentials are never displayed — only whether each service is configured. For the public health endpoint see{" "}
        <code className="font-mono text-smoke">GET /api/v1/health</code>.
      </p>
    </div>
  );
}
