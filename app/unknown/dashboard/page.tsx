"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GlassButton from "@/components/GlassButton";
import ThemeToggle from "@/components/ThemeToggle";
import AdminSidebar from "@/components/admin/AdminSidebar";
import OverviewPanel from "@/components/admin/OverviewPanel";
import ProjectsPanel from "@/components/admin/ProjectsPanel";
import ImagesPanel from "@/components/admin/ImagesPanel";
import ExperiencePanel from "@/components/admin/ExperiencePanel";
import MessagesPanel from "@/components/admin/MessagesPanel";
import FaqPanel from "@/components/admin/FaqPanel";
import SocialsPanel from "@/components/admin/SocialsPanel";
import CvPanel from "@/components/admin/CvPanel";
import SettingsPanel from "@/components/admin/SettingsPanel";
import { ADMIN_NAV, type AdminTab } from "@/lib/admin-nav";
import { useAdminSession } from "@/lib/admin-hooks";

export default function AdminDashboard() {
  const router = useRouter();
  const { admin, loading } = useAdminSession();
  const [tab, setTab] = useState<AdminTab>("overview");

  useEffect(() => {
    if (!loading && !admin) router.replace("/unknown");
  }, [loading, admin, router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    router.push("/unknown");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-cream-dim">Loading dashboard…</p>
      </main>
    );
  }
  if (!admin) return null;

  const activeLabel = ADMIN_NAV.find((n) => n.key === tab)?.label ?? "Dashboard";

  return (
    <main className="admin-shell flex min-h-screen bg-charcoal text-[var(--admin-text)]">
      <AdminSidebar tab={tab} onTabChange={setTab} onLogout={() => void logout()} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-charcoal/90 px-4 py-4 backdrop-blur-md sm:px-6 md:px-8">
          <div className="min-w-0">
            <p className="truncate text-sm text-secondary">
              Welcome back, {admin.name}
            </p>
            <h1 className="mt-1 truncate text-2xl font-bold text-[var(--admin-text)] md:text-3xl">
              {activeLabel}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <GlassButton href="/" variant="ghost" size="sm">
              View site
            </GlassButton>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {tab === "overview" && (
            <OverviewPanel adminName={admin.name} onNavigate={setTab} />
          )}
          {tab === "projects" && <ProjectsPanel />}
          {tab === "images" && <ImagesPanel />}
          {tab === "experience" && <ExperiencePanel />}
          {tab === "messages" && <MessagesPanel />}
          {tab === "faq" && <FaqPanel />}
          {tab === "socials" && <SocialsPanel />}
          {tab === "cv" && <CvPanel />}
          {tab === "settings" && <SettingsPanel />}
        </section>
      </div>
    </main>
  );
}
