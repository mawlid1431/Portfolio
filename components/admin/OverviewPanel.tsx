"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { AdminTab } from "@/lib/admin-nav";
import {
  btnPrimary,
  formatDate,
  useAdminTokenHash,
} from "@/lib/admin-hooks";
import { AdminSectionPanel, AdminStatCard } from "./AdminSectionPanel";
import OverviewActivityChart, {
  type ActivityPoint,
} from "./OverviewActivityChart";

type Period = "week" | "month";

type OverviewPanelProps = {
  adminName: string;
  onNavigate: (tab: AdminTab) => void;
};

function dayKey(ts: number) {
  const date = new Date(ts);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dayLabel(ts: number) {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function buildActivity(
  messageTimes: number[],
  projectTimes: number[],
  period: Period,
): ActivityPoint[] {
  const days = period === "week" ? 7 : 30;
  const now = Date.now();
  const start = now - (days - 1) * 24 * 60 * 60 * 1000;

  const buckets: ActivityPoint[] = [];
  for (let i = 0; i < days; i += 1) {
    const ts = start + i * 24 * 60 * 60 * 1000;
    buckets.push({
      label: dayLabel(ts),
      messages: 0,
      projects: 0,
    });
  }

  const indexByKey = new Map(
    buckets.map((bucket, index) => {
      const ts = start + index * 24 * 60 * 60 * 1000;
      return [dayKey(ts), index] as const;
    }),
  );

  for (const ts of messageTimes) {
    const index = indexByKey.get(dayKey(ts));
    if (index !== undefined) buckets[index]!.messages += 1;
  }
  for (const ts of projectTimes) {
    const index = indexByKey.get(dayKey(ts));
    if (index !== undefined) buckets[index]!.projects += 1;
  }

  // For month view, sample labels to reduce clutter: keep ~8 points visually in chart by grouping? 
  // Simpler: keep all days; chart labels get dense but hover still works. For month, aggregate by week instead.
  if (period === "month") {
    const weeks: ActivityPoint[] = [];
    for (let i = 0; i < buckets.length; i += 5) {
      const slice = buckets.slice(i, i + 5);
      weeks.push({
        label: slice[0]?.label ?? "",
        messages: slice.reduce((sum, point) => sum + point.messages, 0),
        projects: slice.reduce((sum, point) => sum + point.projects, 0),
      });
    }
    return weeks;
  }

  return buckets;
}

function sparklineFromActivity(activity: ActivityPoint[], key: "messages" | "projects") {
  return activity.map((point) => point[key]);
}

export default function OverviewPanel({
  adminName,
  onNavigate,
}: OverviewPanelProps) {
  const tokenHash = useAdminTokenHash();
  const [period, setPeriod] = useState<Period>("week");

  const stats = useQuery(
    api.dashboard.overview,
    tokenHash ? { tokenHash } : "skip",
  );
  const messages = useQuery(
    api.messages.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const projects = useQuery(
    api.projects.list,
    tokenHash ? { tokenHash } : "skip",
  );

  const activity = useMemo(() => {
    const messageTimes = (messages ?? []).map((m) => m.createdAt);
    const projectTimes = (projects ?? []).map((p) => p.createdAt);
    return buildActivity(messageTimes, projectTimes, period);
  }, [messages, projects, period]);

  const weekSpark = useMemo(
    () => buildActivity(
      (messages ?? []).map((m) => m.createdAt),
      (projects ?? []).map((p) => p.createdAt),
      "week",
    ),
    [messages, projects],
  );

  if (!tokenHash || stats === undefined || messages === undefined || projects === undefined) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-cream/20 bg-ink-soft p-4"
            >
              <div className="h-3 w-24 animate-pulse rounded bg-cream/10" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-cream/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const liveProjects = projects.filter((p) => p.status === "live").length;
  const featuredProjects = projects.filter((p) => p.featured).length;
  const unread = stats.unreadMessages;

  const summaryCards = [
    {
      label: "Projects",
      value: stats.projects,
      hint: `${liveProjects} live · ${featuredProjects} featured`,
      accentColor: "var(--emerald-bright)",
      sparkline: sparklineFromActivity(weekSpark, "projects"),
      tab: "projects" as AdminTab,
    },
    {
      label: "Unread messages",
      value: unread,
      hint: `${stats.messages} total get in touch`,
      accentColor: "var(--cream-dim)",
      sparkline: sparklineFromActivity(weekSpark, "messages"),
      tab: "messages" as AdminTab,
    },
    {
      label: "Experience",
      value: stats.experiences,
      hint: "Roles & history on site",
      accentColor: "var(--emerald-glow)",
      tab: "experience" as AdminTab,
    },
    {
      label: "Site assets",
      value: stats.images + stats.faqs + stats.socials,
      hint: `${stats.images} images · ${stats.faqs} FAQ · ${stats.socials} socials`,
      accentColor: "var(--cream-dim)",
      tab: "images" as AdminTab,
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <p className="text-sm text-cream-dim">Welcome back</p>
        <h2 className="mt-1 font-display text-3xl uppercase tracking-wide text-cream">
          {adminName} dashboard
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-cream-dim">
          Manage projects, messages, experience, and site content from one place —
          live from your Convex CMS.
        </p>
      </motion.div>

      <AdminSectionPanel
        title="Quick manage"
        description="Visual summary of your portfolio content and visitor messages."
      >
        <div className="space-y-4">
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-glow/30 bg-emerald-glow/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-emerald-bright">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-bright" />
              Live from database
            </span>
            <div className="inline-flex rounded-xl border border-cream/20 p-1">
              {(["week", "month"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPeriod(value)}
                  className={
                    period === value
                      ? "rounded-lg bg-emerald-glow/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-emerald-bright"
                      : "rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-cream-dim hover:text-cream"
                  }
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="h-full"
              >
                <AdminStatCard
                  label={card.label}
                  value={card.value}
                  hint={card.hint}
                  accentColor={card.accentColor}
                  sparkline={card.sparkline}
                  onClick={() => onNavigate(card.tab)}
                />
              </motion.div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-cream/20 bg-ink-soft">
            <div className="border-b border-cream/15 px-3.5 py-2.5 sm:px-4">
              <h3 className="text-[13px] font-medium text-cream">Activity</h3>
              <p className="mt-0.5 text-[11px] text-cream-dim">
                {period === "week" ? "Last 7 days" : "Last 30 days"} · messages &
                projects · live data
              </p>
            </div>
            <div className="px-3 py-3.5 sm:px-4 sm:py-4">
              <OverviewActivityChart activity={activity} />
            </div>
          </div>
        </div>
      </AdminSectionPanel>

      <AdminSectionPanel
        title="Recent activity"
        description="Latest get in touch messages and featured projects."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-cream">Get in touch</h3>
              <button
                type="button"
                className="text-[11px] uppercase tracking-[0.14em] text-emerald-bright hover:underline"
                onClick={() => onNavigate("messages")}
              >
                View all
              </button>
            </div>
            <ul className="space-y-1.5">
              {messages.slice(0, 4).map((m) => (
                <li
                  key={m._id}
                  className="rounded-lg border border-cream/20 px-3.5 py-2.5 text-[13px]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className={`font-medium ${m.read ? "text-cream-dim" : "text-cream"}`}>
                      {m.name}
                      {!m.read ? (
                        <span className="ml-2 rounded-full bg-emerald-glow px-1.5 py-0.5 text-[9px] font-bold uppercase text-ink">
                          New
                        </span>
                      ) : null}
                    </p>
                    <span className="shrink-0 text-[11px] text-cream-dim">
                      {formatDate(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-cream-dim">
                    {m.budget} · {m.message}
                  </p>
                </li>
              ))}
              {messages.length === 0 ? (
                <li className="rounded-lg border border-dashed border-cream/20 px-3.5 py-6 text-center text-sm text-cream-dim">
                  No messages yet.
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-cream">Featured projects</h3>
              <button
                type="button"
                className="text-[11px] uppercase tracking-[0.14em] text-emerald-bright hover:underline"
                onClick={() => onNavigate("projects")}
              >
                View all
              </button>
            </div>
            <ul className="space-y-1.5">
              {projects
                .filter((p) => p.featured)
                .slice(0, 4)
                .map((p) => (
                  <li
                    key={p._id}
                    className="rounded-lg border border-cream/20 px-3.5 py-2.5 text-[13px]"
                  >
                    <p className="font-medium text-cream">{p.title}</p>
                    <p className="mt-0.5 text-[11px] text-cream-dim">
                      {p.year} · {p.tag ? `${p.tag} · ` : ""}{p.status}
                    </p>
                  </li>
                ))}
              {projects.filter((p) => p.featured).length === 0 ? (
                <li className="rounded-lg border border-dashed border-cream/20 px-3.5 py-6 text-center text-sm text-cream-dim">
                  No featured projects yet.
                  <div className="mt-3">
                    <button
                      type="button"
                      className={btnPrimary}
                      onClick={() => onNavigate("projects")}
                    >
                      Manage projects
                    </button>
                  </div>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </AdminSectionPanel>
    </div>
  );
}
