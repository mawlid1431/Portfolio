"use client";

import { useCallback, useEffect, useState } from "react";
import { glassButtonClasses } from "./glass-button-classes";

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
    void refresh();
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

export const inputClass =
  "w-full rounded-xl border border-cream/15 bg-ink px-4 py-3.5 text-base text-cream placeholder:text-cream-dim/50 outline-none transition-colors focus:border-emerald-bright md:text-sm";

export const labelClass =
  "mb-2 block text-xs uppercase tracking-[0.25em] text-cream-dim";

export const cardClass =
  "rounded-2xl border border-cream/10 bg-ink-soft/70 p-6";

export const btnPrimary = glassButtonClasses({ variant: "primary", size: "md" });

export const btnGhost = glassButtonClasses({ variant: "ghost", size: "md" });

export const btnDanger = glassButtonClasses({ variant: "danger", size: "md" });

export function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
