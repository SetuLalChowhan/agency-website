"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui";

export function useSingleton<T extends Record<string, any>>(key: string) {
  const { toast } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api<{ data: T }>(`/api/v1/settings/${key}`);
      setData(res.data);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [key, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (payload: Partial<T>) => {
      setSaving(true);
      setSaved(false);
      try {
        await api(`/api/v1/admin/settings/${key}`, { method: "PATCH", body: payload });
        setSaved(true);
        toast("Saved — the public site will refresh shortly");
        setTimeout(() => setSaved(false), 2500);
        load();
        return true;
      } catch (err) {
        toast(err instanceof ApiError ? err.message : "Save failed", "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [key, load, toast]
  );

  return { data, setData, loading, saving, saved, save, reload: load };
}
