"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  btnPrimary,
  cardClass,
  formatDate,
  useAdminTokenHash,
} from "@/lib/admin-hooks";

export default function OverviewPanel() {
  const tokenHash = useAdminTokenHash();
  const stats = useQuery(
    api.dashboard.overview,
    tokenHash ? { tokenHash } : "skip",
  );
  const messages = useQuery(
    api.messages.list,
    tokenHash ? { tokenHash } : "skip",
  );
  const importDefaults = useMutation(api.dashboard.importDefaults);

  if (!tokenHash || stats === undefined) {
    return <p className="text-sm text-cream-dim">Loading overview…</p>;
  }

  const cards = [
    { label: "Projects", value: stats?.projects ?? 0 },
    { label: "Site images", value: stats?.images ?? 0 },
    { label: "Experience entries", value: stats?.experiences ?? 0 },
    { label: "Get in touch", value: stats?.messages ?? 0, extra: stats?.unreadMessages ? `${stats.unreadMessages} unread` : undefined },
    { label: "FAQ items", value: stats?.faqs ?? 0 },
    { label: "Social links", value: stats?.socials ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((s) => (
          <div key={s.label} className={cardClass}>
            <p className="font-display text-4xl text-emerald-bright">{s.value}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.15em] text-cream-dim">
              {s.label}
            </p>
            {s.extra && (
              <p className="mt-1 text-xs text-emerald-bright">{s.extra}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cardClass}>
          <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-bright">
            Latest get in touch
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {(messages ?? []).slice(0, 5).map((m) => (
              <li
                key={m._id}
                className="flex items-center justify-between gap-4 border-b border-cream/5 pb-3 text-sm"
              >
                <span className={m.read ? "text-cream-dim" : "text-cream"}>
                  {m.name} — {m.budget}
                </span>
                <span className="shrink-0 text-xs text-cream-dim">
                  {formatDate(m.createdAt)}
                </span>
              </li>
            ))}
            {messages?.length === 0 && (
              <li className="text-sm text-cream-dim">No messages yet.</li>
            )}
          </ul>
        </div>

        <div className={`${cardClass} border-emerald-glow/25 bg-emerald-glow/5`}>
          <h2 className="text-xs uppercase tracking-[0.3em] text-emerald-bright">
            Quick start
          </h2>
          <p className="mt-4 text-sm text-cream-dim">
            Import starter content (projects, images, experience, FAQ, social
            links) from your site defaults into Convex.
          </p>
          <button
            type="button"
            className={`${btnPrimary} mt-6`}
            onClick={() => void importDefaults({ tokenHash })}
          >
            Import defaults
          </button>
        </div>
      </div>
    </div>
  );
}
