"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export function Shell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="flex h-svh overflow-hidden">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenu={() => setMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
