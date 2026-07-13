"use client";

import { useCallback, useEffect, useState } from "react";
import { adminButtonClass } from "@/components/admin/AdminButton";

type AdminSession = {
  adminId: string;
  email: string;
  name: string;
  sessionId: string;
};

type MeResponse = {
  admin: AdminSession | null;
  tokenHash?: string;
};

export function useAdminSession() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (!res.ok) {
        setData({ admin: null });
        return;
      }
      const body = (await res.json()) as MeResponse;
      setData(body);
    } catch {
      setData({ admin: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = queueMicrotask.bind(null, () => {
      void refresh();
    });
    task();
  }, [refresh]);

  return {
    admin: data?.admin ?? null,
    tokenHash: data?.tokenHash ?? null,
    loading,
    refresh,
  };
}

export function useAdminTokenHash() {
  const { tokenHash } = useAdminSession();
  return tokenHash;
}

export const inputClass = "theme-input";

export const labelClass =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--admin-text-faint)]";

export const cardClass = "card-surface p-5 sm:p-6";

export const btnPrimary = adminButtonClass("primary");

export const btnGhost = adminButtonClass("simple");

export const btnDanger = adminButtonClass(
  "muted",
  "border-red-500/40 text-red-400 hover:bg-red-500/10",
);

export function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
