"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"checking" | "ready">("checking");

  useEffect(() => {
    let cancelled = false;
    api("/api/v1/auth/me")
      .then(() => {
        if (!cancelled) setState("ready");
      })
      .catch(() => {
        if (!cancelled) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      });
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (state === "checking") {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner label="Checking session" />
      </div>
    );
  }

  return <>{children}</>;
}
