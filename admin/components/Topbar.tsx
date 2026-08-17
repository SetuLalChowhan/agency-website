"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, Monitor, Moon, Shield, Sun } from "lucide-react";
import { api, setAuthToken } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import { useToast } from "@/components/ui";
import { useTheme, type Theme } from "@/components/theme";
import { cn } from "@/lib/cn";

const THEME_OPTIONS: Array<{ value: Theme; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    api<AdminUser>("/api/v1/auth/me").then(setUser).catch(() => {});
  }, []);

  const logout = async () => {
    try {
      await api("/api/v1/auth/logout", { method: "POST" });
    } catch {}
    setAuthToken(null);
    toast("Signed out");
    router.replace("/login");
  };

  return (
    <header className="flex h-16 flex-none items-center justify-between border-b border-line bg-ink px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="flex h-9 w-9 items-center justify-center text-smoke hover:text-paper lg:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <p className="meta-label text-smoke">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div role="group" aria-label="Color theme" className="flex items-center gap-0.5 rounded-full border border-line bg-ink-2 p-0.5">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                aria-label={`${opt.label} mode`}
                aria-pressed={active}
                title={`${opt.label} mode`}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  active ? "bg-acid text-ink" : "text-stone hover:text-paper"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden text-right md:block">
              <span className="block text-[13px] font-medium leading-tight text-paper">{user.name}</span>
              <span className="meta-label block text-[10px] text-stone">{user.role}</span>
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-ink-3">
              <Shield className="h-4 w-4 text-acid" />
            </span>
            <button
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-smoke transition-colors hover:border-red-500/40 hover:text-red-400"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
