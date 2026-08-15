"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, FolderKanban, Image as ImageIcon, Inbox, Newspaper, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Badge, Card, Spinner } from "@/components/ui";

type Stats = {
  content: Record<string, number>;
  media: number;
  leads: { contacts: number; quotes: number; subscribers: number; new: number };
  users: number;
};

type ActivityItem = {
  _id: string;
  adminName: string;
  action: string;
  entity: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ data: Stats }>("/api/v1/admin/diagnostics/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});
    api<{ data: ActivityItem[] }>("/api/v1/admin/activity?limit=8")
      .then((r) => setActivity(r.data))
      .catch(() => setError("Could not load activity — check the API connection."));
  }, []);

  if (!stats) {
    return <Spinner label="Loading dashboard" />;
  }

  const tiles = [
    { label: "Projects", value: stats.content.projects, href: "/content/projects", icon: FolderKanban },
    { label: "Blog posts", value: stats.content.blogPosts, href: "/content/blog", icon: Newspaper },
    { label: "New leads", value: stats.leads.new, href: "/leads", icon: Inbox },
    { label: "Media assets", value: stats.media, href: "/media", icon: ImageIcon },
    { label: "Testimonials", value: stats.content.testimonials, href: "/content/testimonials", icon: Users },
    { label: "Admin users", value: stats.users, href: "/users", icon: Users },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="display text-3xl text-paper md:text-4xl">Overview</h1>
        <p className="mt-2 text-sm text-smoke">Everything your studio runs on, in one place.</p>
      </header>

      {error && <p className="border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link key={tile.label} href={tile.href} className="group border border-line bg-ink-2/60 p-5 transition-colors hover:border-acid/50">
              <div className="flex items-center justify-between">
                <Icon className="h-4 w-4 text-stone transition-colors group-hover:text-acid" />
                <Badge value={tile.label === "New leads" && tile.value > 0} className={tile.label === "New leads" ? "" : "hidden"} />
              </div>
              <p className="display mt-6 text-4xl text-paper">{tile.value}</p>
              <p className="meta-label mt-2 text-stone">{tile.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent activity" actions={<Activity className="h-4 w-4 text-stone" />}>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((a) => (
                <li key={a._id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-paper/90">{a.action}</p>
                    <p className="meta-label mt-1 text-[10px] text-stone">
                      {a.adminName} · {a.entity}
                    </p>
                  </div>
                  <time className="flex-none font-mono text-xs text-stone">
                    {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Quick actions">
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/website/theme", label: "Change brand color" },
              { href: "/home", label: "Reorder homepage" },
              { href: "/content/blog", label: "Write an insight" },
              { href: "/media", label: "Upload media" },
              { href: "/leads", label: "Review leads" },
              { href: "/diagnostics", label: "Check system health" },
            ].map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="border border-line bg-ink px-4 py-4 text-sm text-paper/85 transition-colors hover:border-acid/50 hover:text-paper"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
