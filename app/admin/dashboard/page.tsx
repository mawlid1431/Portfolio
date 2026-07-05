"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GlassButton from "@/components/GlassButton";
import OverviewPanel from "@/components/admin/OverviewPanel";
import ProjectsPanel from "@/components/admin/ProjectsPanel";
import ImagesPanel from "@/components/admin/ImagesPanel";
import ExperiencePanel from "@/components/admin/ExperiencePanel";
import MessagesPanel from "@/components/admin/MessagesPanel";
import FaqPanel from "@/components/admin/FaqPanel";
import SocialsPanel from "@/components/admin/SocialsPanel";
import SettingsPanel from "@/components/admin/SettingsPanel";
import { useAdminSession } from "@/lib/admin-hooks";

export type AdminTab =
  | "overview"
  | "projects"
  | "images"
  | "experience"
  | "messages"
  | "faq"
  | "socials"
  | "settings";

const NAV: { key: AdminTab; label: string; icon: string }[] = [
  { key: "overview", label: "Overview", icon: "▦" },
  { key: "projects", label: "Projects", icon: "◈" },
  { key: "images", label: "Images", icon: "🖼" },
  { key: "experience", label: "Experience", icon: "◎" },
  { key: "messages", label: "Messages", icon: "✉" },
  { key: "faq", label: "FAQ", icon: "?" },
  { key: "socials", label: "Socials", icon: "↗" },
  { key: "settings", label: "Settings", icon: "⚙" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { admin, loading } = useAdminSession();
  const [tab, setTab] = useState<AdminTab>("overview");

  useEffect(() => {
    if (!loading && !admin) router.replace("/admin");
  }, [loading, admin, router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    router.push("/admin");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-cream-dim">Loading dashboard…</p>
      </main>
    );
  }
  if (!admin) return null;

  const activeLabel = NAV.find((n) => n.key === tab)?.label ?? "Dashboard";

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r border-cream/10 bg-ink-soft/60 md:flex">
        <div className="border-b border-cream/10 p-6">
          <Link href="/" className="font-display text-xl">
            MALITOS<span className="text-emerald-bright">.</span>
          </Link>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-cream-dim">
            Devmalitos CMS
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {NAV.map((n) => (
            <button
              key={n.key}
              type="button"
              onClick={() => setTab(n.key)}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition-colors ${
                tab === n.key
                  ? "bg-emerald-glow/15 text-emerald-bright"
                  : "text-cream-dim hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <GlassButton
          type="button"
          variant="danger"
          size="md"
          className="m-4 justify-start"
          onClick={() => void logout()}
        >
          <span>⏻</span>
          <span>Log out</span>
        </GlassButton>
      </aside>

      <section className="flex-1 overflow-y-auto p-4 pb-24 md:p-10 md:pb-10">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mb-8">
          <div>
            <h1 className="font-display text-2xl uppercase sm:text-3xl md:text-4xl">
              {activeLabel}
            </h1>
            <p className="mt-1 text-xs text-cream-dim">
              Welcome back, {admin.name} 👋
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <GlassButton href="/" variant="ghost" size="sm">
              View site
            </GlassButton>
            <GlassButton
              type="button"
              variant="danger"
              size="sm"
              className="md:hidden"
              onClick={() => void logout()}
            >
              Log out
            </GlassButton>
          </div>
        </header>

        {tab === "overview" && <OverviewPanel />}
        {tab === "projects" && <ProjectsPanel />}
        {tab === "images" && <ImagesPanel />}
        {tab === "experience" && <ExperiencePanel />}
        {tab === "messages" && <MessagesPanel />}
        {tab === "faq" && <FaqPanel />}
        {tab === "socials" && <SocialsPanel />}
        {tab === "settings" && <SettingsPanel />}
      </section>

      {/* mobile bottom nav */}
      <nav
        aria-label="Admin sections"
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-cream/10 bg-ink-soft/95 pb-safe backdrop-blur-md md:hidden"
      >
        {NAV.map((n) => (
          <button
            key={n.key}
            type="button"
            onClick={() => setTab(n.key)}
            aria-current={tab === n.key ? "page" : undefined}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] transition-colors ${
              tab === n.key
                ? "text-emerald-bright"
                : "text-cream-dim"
            }`}
          >
            <span className="text-base leading-none">{n.icon}</span>
            <span className="truncate">{n.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
